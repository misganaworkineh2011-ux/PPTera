import { headers } from "next/headers";
import { auth as betterAuthInstance } from "~/lib/auth";

/**
 * Server-side auth compat layer, Clerk-shaped.
 *
 * Dozens of API routes were written against Clerk's
 * `const { userId } = await auth()` followed by
 * `db.user.findUnique({ where: { clerkId: userId } })`. This module keeps that
 * contract on top of Better Auth:
 * - legacy users keep their original Clerk id in `user.clerkId`
 * - new users get `clerkId = user.id` (set by the create hook in ~/lib/auth)
 * so `auth().userId` is ALWAYS the value the clerkId lookups expect.
 */

interface SessionUserShape {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  clerkId?: string | null;
}

export async function getSessionUser(): Promise<SessionUserShape | null> {
  try {
    const session = await betterAuthInstance.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) return null;
    return session.user as unknown as SessionUserShape;
  } catch (error) {
    console.error("[auth-server] getSession failed:", error);
    return null;
  }
}

/** Clerk-compatible `auth()`: resolves to `{ userId }` (null when signed out). */
export async function auth(): Promise<{ userId: string | null }> {
  const user = await getSessionUser();
  if (!user) return { userId: null };
  return { userId: user.clerkId ?? user.id };
}

/**
 * Clerk-compatible `currentUser()`: the subset of fields this codebase reads
 * (names, image, primary email + verification status).
 */
export async function currentUser() {
  const user = await getSessionUser();
  if (!user) return null;

  const [firstName, ...rest] = (user.name ?? "").trim().split(/\s+/);
  return {
    id: user.clerkId ?? user.id,
    firstName: firstName || null,
    lastName: rest.join(" ") || null,
    username: null as string | null,
    fullName: user.name ?? null,
    imageUrl: user.image ?? "",
    emailAddresses: [
      {
        emailAddress: user.email,
        verification: { status: user.emailVerified ? "verified" : "unverified" },
      },
    ],
  };
}
