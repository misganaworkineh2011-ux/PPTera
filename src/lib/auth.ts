import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nanoid } from "nanoid";
import { db } from "~/server/db";
import { sendPasswordResetEmail } from "~/lib/email/send-password-reset";

const REFERRAL_CREDITS = 10;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/** Parse the referral_code cookie set by middleware from ?ref= links. */
function referralCodeFromHeaders(headers: Headers | undefined): string | null {
  const cookie = headers?.get("cookie");
  if (!cookie) return null;
  const match = /(?:^|;\s*)referral_code=([^;]+)/.exec(cookie);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Award the referrer once when a referred user signs up (best-effort). */
async function processReferral(newUserId: string, newUserEmail: string, referralCode: string) {
  try {
    const referrer = await db.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
      select: { id: true },
    });
    if (!referrer || referrer.id === newUserId) return;

    const existing = await db.referral.findFirst({
      where: { referrerId: referrer.id, referredUserId: newUserId },
    });
    if (existing) return;

    await db.$transaction([
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
      db.user.update({
        where: { id: referrer.id },
        data: { credits: { increment: REFERRAL_CREDITS } },
      }),
      db.user.update({
        where: { id: newUserId },
        data: { referredBy: referralCode.toUpperCase() },
      }),
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
    console.error("[auth] Failed to process referral:", error);
  }
}

/**
 * Better Auth server instance. Owns the existing `user` table plus the new
 * session/account/verification tables. Email+password is always on; Google
 * OAuth activates automatically once GOOGLE_CLIENT_ID/SECRET are set.
 */
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  // In dev the server answers on localhost even when NEXT_PUBLIC_APP_URL
  // points at production — origin checks must match the ACTUAL origin.
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_APP_URL) ||
    "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],

  emailAndPassword: {
    enabled: true,
    // Sessions start immediately after sign-up; verification emails can be
    // layered on later without blocking the migration.
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, name: user.name, url });
    },
  },

  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),

  account: {
    accountLinking: {
      enabled: true,
      // A Google sign-in whose verified email matches an existing account
      // (e.g. a legacy Clerk user) links to that user instead of failing.
      trustedProviders: ["google"],
    },
  },

  user: {
    additionalFields: {
      // Surfaced on session.user so the legacy `where: { clerkId }` lookups
      // in API routes resolve without an extra DB read per request.
      clerkId: { type: "string", required: false, input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh expiry at most once a day
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  databaseHooks: {
    user: {
      create: {
        // App-level defaults Clerk's webhook used to set. These CANNOT go in
        // a before-hook: the adapter strips fields that aren't part of Better
        // Auth's user schema, so they're applied right after the insert.
        after: async (user, ctx) => {
          try {
            await db.user.update({
              where: { id: user.id },
              data: {
                // clerkId doubles as the generic external-auth id: pointing it
                // at the user's own id keeps every legacy `where: { clerkId }`
                // lookup working.
                clerkId: user.id,
                credits: 200, // welcome credits
                subscriptionPlan: "Free",
                referralCode: nanoid(8).toUpperCase(),
              },
            });
          } catch (error) {
            console.error("[auth] Failed to apply new-user defaults:", error);
          }

          const referralCode = referralCodeFromHeaders(ctx?.headers ?? undefined);
          if (referralCode) {
            await processReferral(user.id, user.email, referralCode);
          }
        },
      },
    },
  },
});

export type ServerSession = typeof auth.$Infer.Session;
