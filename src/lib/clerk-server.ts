import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

const REFERRAL_CREDITS = 10;

// ============================================================================
// USER CREATION HELPER
// ============================================================================

/**
 * Safely create a user in the database with retry logic for race conditions
 * Returns the user if successful, null if creation failed
 */
async function ensureUserInDatabase(clerkId: string): Promise<Awaited<ReturnType<typeof db.user.findUnique>> | null> {
  // First, try to find existing user
  const existingUser = await db.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    return existingUser;
  }

  // User doesn't exist, try to create from Clerk data
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const name =
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
    clerkUser.username ||
    "User";
  const emailVerified =
    clerkUser.emailAddresses[0]?.verification?.status === "verified";

  // Check if email already exists - if so, link this Clerk account to existing user
  if (email) {
    const existingEmailUser = await db.user.findUnique({
      where: { email },
    });
    if (existingEmailUser) {
      // Email already exists - update the existing user with this new Clerk ID
      // This handles cases where user signs in with different auth method (Google vs email)
      try {
        const updatedUser = await db.user.update({
          where: { email },
          data: { clerkId }, // Link new Clerk account to existing user
        });
        console.log(`Linked Clerk ID ${clerkId} to existing user with email ${email}`);
        return updatedUser;
      } catch (updateError) {
        // If update fails (e.g., clerkId already used), try to find by clerkId
        const userByClerk = await db.user.findUnique({ where: { clerkId } });
        if (userByClerk) return userByClerk;
        console.error(`Failed to link Clerk ID to existing email user:`, updateError);
        return null;
      }
    }
  }

  // Check for referral code in cookies
  let referralCode: string | undefined;
  try {
    const cookieStore = await cookies();
    referralCode = cookieStore.get("referral_code")?.value;
  } catch {
    // Cookies might not be available in some contexts
  }

  // Retry logic for race conditions (webhook might create user concurrently)
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Generate a unique referral code for the new user
      const newUserReferralCode = nanoid(8).toUpperCase();
      
      const newUser = await db.user.create({
        data: {
          clerkId,
          email,
          name,
          emailVerified,
          image: clerkUser.imageUrl,
          credits: 200, // Free credits for new users
          subscriptionPlan: "Free",
          referralCode: newUserReferralCode,
        },
      });

      // Process referral if code exists
      if (referralCode) {
        await processReferral(newUser.id, email, referralCode);
      }

      return newUser;
    } catch (error) {
      // Handle unique constraint violation (race condition)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // User might have been created by webhook or another request
        const userNow = await db.user.findUnique({
          where: { clerkId },
        });

        if (userNow) {
          return userNow;
        }

        // If still not found, retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 50; // 100ms, 200ms, 400ms
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // On final retry, check one more time if user exists
      if (attempt === maxRetries) {
        const finalCheck = await db.user.findUnique({
          where: { clerkId },
        });
        if (finalCheck) {
          return finalCheck;
        }
      }

      return null;
    }
  }

  return null;
}

/**
 * Process a referral when a new user signs up
 */
async function processReferral(newUserId: string, newUserEmail: string, referralCode: string): Promise<void> {
  try {
    // Check if the new user already has a referral (shouldn't happen for new users, but safety check)
    const newUser = await db.user.findUnique({
      where: { id: newUserId },
      select: { referredBy: true },
    });

    if (newUser?.referredBy) {
      return; // User already used a referral code
    }

    // Find the referrer by their referral code
    const referrer = await db.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
      select: { id: true },
    });

    if (!referrer || referrer.id === newUserId) {
      return; // Invalid code or self-referral
    }

    // Check if this referral already exists
    const existingReferral = await db.referral.findFirst({
      where: {
        referrerId: referrer.id,
        referredUserId: newUserId,
      },
    });

    if (existingReferral) {
      return; // Already processed
    }

    // Create the referral and award credits in a transaction (only referrer gets credits)
    await db.$transaction([
      // Create referral record
      db.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: newUserId,
          referredEmail: newUserEmail,
          referralCode: nanoid(12),
          status: "completed",
          creditsAwarded: REFERRAL_CREDITS,
          completedAt: new Date(),
        },
      }),
      // Award credits to referrer only
      db.user.update({
        where: { id: referrer.id },
        data: { credits: { increment: REFERRAL_CREDITS } },
      }),
      // Mark new user as referred (no credits for them)
      db.user.update({
        where: { id: newUserId },
        data: {
          referredBy: referralCode.toUpperCase(),
        },
      }),
      // Create notification for referrer
      db.notification.create({
        data: {
          userId: referrer.id,
          type: "referral",
          title: "Referral Bonus!",
          message: `You earned ${REFERRAL_CREDITS} credits! Someone signed up using your referral link.`,
          link: "/dashboard/billing",
        },
      }),
    ]);
  } catch (error) {
    // Log but don't fail user creation if referral processing fails
    console.error("Failed to process referral:", error);
  }
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Get the current authenticated user's database record
 * Returns null if not authenticated or user creation fails
 */
export async function getAuthUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to find user by clerkId
  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // If not found, try to create from Clerk data (fallback)
  if (!user) {
    user = await ensureUserInDatabase(userId);
  }

  return user;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Returns the user's database record
 * If user exists in Clerk but not in DB, creates the user as fallback
 * This is production-ready with proper error handling
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Try to find user in database
  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // If not found, try to create from Clerk data (fallback for webhook failures)
  if (!user) {
    user = await ensureUserInDatabase(userId);

    // If creation failed, redirect to sign-in with error message
    if (!user) {
      redirect("/sign-in?error=user_creation_failed");
    }
  }

  return user;
}

/**
 * Require no authentication - redirects to dashboard if authenticated
 */
export async function requireNoAuth() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }
  
  return null;
}

/**
 * Get Clerk user ID
 */
export async function getClerkUserId() {
  const { userId } = await auth();
  return userId;
}
