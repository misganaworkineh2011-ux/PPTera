"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MailCheck } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useAuthProviders } from "~/lib/use-auth-providers";
import AuthShell from "~/components/auth/AuthShell";
import {
  ErrorBanner,
  FieldLabel,
  GoogleButton,
  OrDivider,
  PasswordInput,
  SubmitButton,
  TextInput,
} from "~/components/auth/AuthUi";

type Mode = "signin" | "forgot" | "sent" | "reset";

/** Only allow same-origin relative destinations (never external URLs). */
function sanitizeRedirect(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

function authErrorMessage(error: { message?: string } | null | undefined): string {
  return error?.message || "Something went wrong. Please try again.";
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { google: googleEnabled } = useAuthProviders();
  const redirectTo = sanitizeRedirect(searchParams.get("redirect_url"));
  // A reset link from the email lands back here with ?token=…
  const resetToken = searchParams.get("token");

  const [mode, setMode] = useState<Mode>(resetToken ? "reset" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("error") === "INVALID_TOKEN"
      ? null
      : null,
  );
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "INVALID_TOKEN"
      ? "That reset link is invalid or has expired. Request a new one."
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const signInWithGoogle = async () => {
    setError(null);
    setOauthLoading(true);
    const { error: err } = await authClient.signIn.social({
      provider: "google",
      callbackURL: redirectTo,
    });
    if (err) {
      setError(authErrorMessage(err));
      setOauthLoading(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signIn.email({ email, password });
    if (err) {
      setError(authErrorMessage(err));
      setLoading(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/sign-in",
    });
    setLoading(false);
    if (err) {
      setError(authErrorMessage(err));
      return;
    }
    setMode("sent");
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.resetPassword({
      newPassword,
      token: resetToken,
    });
    setLoading(false);
    if (err) {
      setError(authErrorMessage(err));
      return;
    }
    setNotice("Password updated — sign in with your new password.");
    setMode("signin");
    router.replace("/sign-in");
  };

  return (
    <AuthShell>
      {/* Mobile logo */}
      <Link href="/" className="mb-8 flex justify-center lg:hidden">
        <Image src="/logo.png" alt="PPTera" width={150} height={40} className="h-10 w-auto" />
      </Link>

      {mode === "signin" && (
        <>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">Welcome back</h1>
          <p className="mt-1.5 text-[15px] text-zinc-500">
            Sign in to keep building beautiful presentations.
          </p>

          {notice && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] font-semibold text-emerald-700">
              {notice}
            </div>
          )}

          <div className="mt-8 space-y-4">
            {googleEnabled && (
              <>
                <GoogleButton onClick={signInWithGoogle} loading={oauthLoading} label="Continue with Google" />
                <OrDivider />
              </>
            )}
            <form onSubmit={submitPassword} className="space-y-4">
              <div>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <TextInput
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode("forgot");
                    }}
                    className="mb-1.5 text-[13px] font-semibold text-cyan-700 transition-colors hover:text-cyan-800"
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <ErrorBanner message={error} />
              <SubmitButton loading={loading}>Sign in</SubmitButton>
            </form>
          </div>

          <p className="mt-8 text-center text-[14px] text-zinc-500">
            New to PPTera?{" "}
            <Link href="/sign-up" className="font-semibold text-cyan-700 transition-colors hover:text-cyan-800">
              Create a free account
            </Link>
          </p>
        </>
      )}

      {mode === "forgot" && (
        <>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode("signin");
            }}
            className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-zinc-500 transition-colors hover:text-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </button>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">Reset your password</h1>
          <p className="mt-1.5 text-[15px] text-zinc-500">
            Enter your email and we&apos;ll send you a secure reset link.
          </p>
          <form onSubmit={requestReset} className="mt-8 space-y-4">
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <TextInput
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <ErrorBanner message={error} />
            <SubmitButton loading={loading}>Send reset link</SubmitButton>
          </form>
        </>
      )}

      {mode === "sent" && (
        <>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] shadow-lg shadow-cyan-600/25">
            <MailCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">Check your email</h1>
          <p className="mt-1.5 text-[15px] text-zinc-500">
            If an account exists for{" "}
            <span className="font-semibold text-zinc-700">{email}</span>, we sent a link to reset
            your password. The link expires in one hour.
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode("signin");
            }}
            className="mt-8 w-full text-center text-[13.5px] font-semibold text-zinc-500 transition-colors hover:text-zinc-800"
          >
            Back to sign in
          </button>
        </>
      )}

      {mode === "reset" && (
        <>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">Choose a new password</h1>
          <p className="mt-1.5 text-[15px] text-zinc-500">
            Set a new password for your account to finish the reset.
          </p>
          <form onSubmit={submitReset} className="mt-8 space-y-4">
            <div>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <ErrorBanner message={error} />
            <SubmitButton loading={loading}>Reset password</SubmitButton>
          </form>
        </>
      )}
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
