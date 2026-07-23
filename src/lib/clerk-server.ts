/**
 * Server auth helpers. Historically Clerk-backed (hence the filename, kept so
 * ~40 API routes don't churn); now implemented on Better Auth sessions.
 *
 * Contract preserved from the Clerk era:
 * - `requireAuth()` / `getAuthUser()` return the FULL Prisma User row.
 * - `getClerkUserId()` returns the external auth id — for legacy accounts the
 *   original Clerk id, for new accounts the user's own id (clerkId = id).
 */
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { getSessionUser } from "~/lib/auth-server";

/**
 * Get the current authenticated user's database record.
 * Returns null if not authenticated.
 */
export async function getAuthUser() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  return db.user.findUnique({ where: { id: sessionUser.id } });
}

/**
 * Require authentication — redirects to sign-in if not authenticated.
 * Returns the user's database record.
 */
export async function requireAuth() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/sign-in");
  }

  // Small retry for transient DB hiccups (kept from the Clerk implementation).
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const user = await db.user.findUnique({ where: { id: sessionUser.id } });
      if (user) return user;
      // Session exists but the row is gone (deleted account with a live
      // cookie) — treat as signed out.
      redirect("/sign-in?error=user_not_found");
    } catch (error) {
      if (isNextControlFlowError(error)) throw error;
      lastError = error as Error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
      }
    }
  }

  throw new Error(
    `Failed to fetch user from database: ${lastError?.message ?? "unknown"}`,
  );
}

/** Next.js redirect()/notFound() throw control-flow errors — never swallow. */
function isNextControlFlowError(error: unknown): boolean {
  const digest = (error as { digest?: string } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_");
}

/**
 * Require no authentication — redirects to dashboard if authenticated.
 */
export async function requireNoAuth() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/dashboard");
  }
  return null;
}

/**
 * Get the external auth id (legacy name kept for call-site compatibility).
 */
export async function getClerkUserId() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  return sessionUser.clerkId ?? sessionUser.id;
}
