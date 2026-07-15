"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import AuthShell from "~/components/auth/AuthShell";
import {
  clerkErrorMessage,
  ErrorBanner,
  FieldLabel,
  GoogleButton,
  OrDivider,
  PasswordInput,
  SubmitButton,
  TextInput,
} from "~/components/auth/AuthUi";

type Mode = "signin" | "forgot" | "reset";

/** Only allow same-origin relative destinations (never external URLs). */
function sanitizeRedirect(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirect(searchParams.get("redirect_url"));

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (!isLoaded) return;
    setError(null);
    setOauthLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectTo,
      });
    } catch (err) {
      setError(clerkErrorMessage(err));
      setOauthLoading(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(redirectTo);
      } else {
        // Extra factors (e.g. 2FA) aren't handled by this simple flow.
        setError("Additional verification is required for this account.");
      }
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const requestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setMode("reset");
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(redirectTo);
      } else {
        setError("Could not complete the password reset. Please try again.");
      }
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
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

          <div className="mt-8 space-y-4">
            <GoogleButton onClick={signInWithGoogle} loading={oauthLoading} label="Continue with Google" />
            <OrDivider />
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
            Enter your email and we&apos;ll send you a verification code.
          </p>
          <form onSubmit={requestResetCode} className="mt-8 space-y-4">
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
            <SubmitButton loading={loading}>Send reset code</SubmitButton>
          </form>
        </>
      )}

      {mode === "reset" && (
        <>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">Check your email</h1>
          <p className="mt-1.5 text-[15px] text-zinc-500">
            We sent a code to <span className="font-semibold text-zinc-700">{email}</span>. Enter it
            below with your new password.
          </p>
          <form onSubmit={submitReset} className="mt-8 space-y-4">
            <div>
              <FieldLabel htmlFor="code">Verification code</FieldLabel>
              <TextInput
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-[0.35em]"
              />
            </div>
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
            <SubmitButton loading={loading}>Reset password &amp; sign in</SubmitButton>
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
