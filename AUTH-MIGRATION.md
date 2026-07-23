# Clerk → Better Auth migration

This branch (`better-auth`) replaces Clerk with [Better Auth](https://better-auth.com) —
self-hosted email/password + Google OAuth on our own Postgres. **`main` still runs
Clerk**; nothing changes in production until this branch is merged and the env vars
below are set on Vercel.

## What changed

- **Schema** (already pushed — additive, safe for the live site):
  `user.clerkId` became optional; new `session`, `account`, `verification` tables.
- **Server**: `~/lib/auth.ts` (Better Auth instance), `/api/auth/[...all]` handler,
  `~/lib/auth-server.ts` (Clerk-shaped `auth()` / `currentUser()` compat) and
  `~/lib/clerk-server.ts` (same exports as before — `requireAuth`, `getAuthUser`,
  `requireNoAuth`, `getClerkUserId` — now Better Auth-backed). All ~40 API routes
  kept their logic; only imports moved.
- **Legacy id bridge**: new users get `clerkId = user.id` (create hook), old users
  keep their original Clerk id, so every `where: { clerkId }` lookup still works.
- **Client**: `~/lib/auth-client.ts` (Better Auth client) and `~/lib/auth-compat.tsx`
  (Clerk-shaped `useUser`, `useClerk`, `SignedIn`, `SignedOut`, `UserButton`).
- **Middleware**: optimistic session-cookie check (pages redirect to `/sign-in`,
  APIs get 401). i18n/referral behavior unchanged.
- **Pages**: `/sign-in` (password + Google + email-link password reset),
  `/sign-up` (name/email/password, instant session). `/sso-callback` and the Clerk
  webhook are gone. Welcome credits (200), referral rewards, and referral-cookie
  processing now run in Better Auth's user-create hooks.

## Cutover checklist (in order)

1. **Vercel env vars** (Project → Settings → Environment Variables):
   - `BETTER_AUTH_SECRET` — generate:
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
   - `BETTER_AUTH_URL=https://www.pptera.com`
   - Remove `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
     `CLERK_WEBHOOK_SECRET` (after merge).
2. **Google OAuth** (needed for "Continue with Google"):
   - Google Cloud Console → APIs & Services → Credentials → Create OAuth client
     (Web application).
   - Authorized redirect URI: `https://www.pptera.com/api/auth/callback/google`
     (plus `http://localhost:3000/api/auth/callback/google` for local dev).
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. The Google buttons
     appear automatically once both are set (the pages ask
     /api/auth/providers); without them email/password works alone.
3. **Merge `better-auth` → `main`** and let Vercel deploy.
4. **Existing users** (all sessions reset at cutover):
   - Google users: sign in with Google again — account linking matches them to
     their existing account by verified email. Nothing is lost.
   - Email/password users: passwords live in Clerk and cannot be read out
     directly. They use **Forgot password** on /sign-in (email link via Resend).
     Optionally, request a password-hash export from Clerk support (bcrypt) and
     import into `account.password` rows for a seamless switch.
5. **Decommission Clerk** once sign-ins look healthy: delete the Clerk app and
   the `clerk.pptmaster.app` DNS record.

## Notes

- Email verification at sign-up is OFF (`requireEmailVerification: false`) to keep
  the funnel friction-free; flip it on later + wire `sendVerificationEmail` when
  wanted. Password reset emails go through the existing Resend setup
  (`RESEND_API_KEY` — already configured).
- 2FA is not wired (Better Auth has a twoFactor plugin when wanted); the settings
  toggle shows "coming soon" and the password card sends a reset link.
- The svix + @clerk/nextjs dependencies are removed on this branch.
