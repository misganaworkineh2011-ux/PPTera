"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSignUp } from "@clerk/nextjs";
import { MailCheck } from "lucide-react";
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

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const signUpWithGoogle = async () => {
    if (!isLoaded) return;
    setError(null);
    setOauthLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      setError(clerkErrorMessage(err));
      setOauthLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Verification incomplete. Please check the code and try again.");
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

      {!verifying ? (
        <>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">
            Create your free account
          </h1>
          <p className="mt-1.5 text-[15px] text-zinc-500">
            Your first AI-designed deck is minutes away. No credit card needed.
          </p>

          <div className="mt-8 space-y-4">
            <GoogleButton onClick={signUpWithGoogle} loading={oauthLoading} label="Sign up with Google" />
            <OrDivider />
            <form onSubmit={submit} className="space-y-4">
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Clerk smart CAPTCHA mounts here when bot protection is enabled */}
              <div id="clerk-captcha" />
              <ErrorBanner message={error} />
              <SubmitButton loading={loading}>Create account</SubmitButton>
            </form>
          </div>

          <p className="mt-6 text-center text-[12.5px] leading-relaxed text-zinc-400">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-zinc-600">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-zinc-600">Privacy Policy</Link>.
          </p>

          <p className="mt-6 text-center text-[14px] text-zinc-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-cyan-700 transition-colors hover:text-cyan-800">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] shadow-lg shadow-cyan-600/25">
            <MailCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">Verify your email</h1>
          <p className="mt-1.5 text-[15px] text-zinc-500">
            We sent a 6-digit code to <span className="font-semibold text-zinc-700">{email}</span>.
          </p>
          <form onSubmit={submitCode} className="mt-8 space-y-4">
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
            <ErrorBanner message={error} />
            <SubmitButton loading={loading}>Verify &amp; continue</SubmitButton>
          </form>
          <button
            type="button"
            onClick={() => setVerifying(false)}
            className="mt-6 w-full text-center text-[13.5px] font-semibold text-zinc-500 transition-colors hover:text-zinc-800"
          >
            Use a different email
          </button>
        </>
      )}
    </AuthShell>
  );
}
