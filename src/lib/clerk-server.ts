import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

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

  // Retry logic for race conditions (webhook might create user concurrently)
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const newUser = await db.user.create({
        data: {
          clerkId,
          email,
          name,
          emailVerified,
          image: clerkUser.imageUrl,
          credits: 200, // Free credits for new users
          subscriptionPlan: "Free",
        },
      });

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
