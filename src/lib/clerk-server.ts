import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user's database record
 * Returns null if not authenticated
 */
export async function getAuthUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to find user by clerkId; if not found, fall back to creating from Clerk
  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      try {
        const email = clerkUser.emailAddresses[0]?.emailAddress || "";
        const name =
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.username ||
          "User";

        user = await db.user.create({
          data: {
            clerkId: userId,
            email: email,
            name: name,
            emailVerified:
              clerkUser.emailAddresses[0]?.verification?.status === "verified",
            image: clerkUser.imageUrl,
            credits: 200,
            subscriptionPlan: "Free",
          },
        });
      } catch (error) {
        // If user already exists or creation fails, just return null and let caller handle redirect
        console.error("[getAuthUser] Failed to ensure user:", error);
        return null;
      }
    } else {
      return null;
    }
  }

  return user;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Returns the user's database record
 * If user exists in Clerk but not in DB, creates the user as fallback
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // User exists in Clerk but not in our database
    // This should be handled by the webhook, but we'll create it here as fallback
    const clerkUser = await currentUser();
    
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User";
      
      try {
        const newUser = await db.user.create({
          data: {
            clerkId: userId,
            email: email,
            name: name,
            emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
            image: clerkUser.imageUrl,
            credits: 200, // Free credits for new users
            subscriptionPlan: "Free", // Default to free plan
          },
        });
        
        return newUser;
      } catch (error) {
        // If user was created by webhook between check and create (race condition)
        if (error instanceof Error && error.message.includes("Unique constraint")) {
          // Try to fetch the user again - webhook probably created it
          const existingUser = await db.user.findUnique({
            where: { clerkId: userId },
          });
          
          if (existingUser) {
            return existingUser;
          }
        }
        
        // If it's a different error or user still doesn't exist, throw it
        throw error;
      }
    }
    
    redirect("/sign-in");
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

