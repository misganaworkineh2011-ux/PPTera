"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

function authErrorMessage(error: { message?: string } | null | undefined): string {
  return error?.message || "Something went wrong. Please try again.";
}

export default function SignUpPage() {
  const router = useRouter();
  const { google: googleEnabled } = useAuthProviders();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const signUpWithGoogle = async () => {
    setError(null);
    setOauthLoading(true);
    const { error: err } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    if (err) {
      setError(authErrorMessage(err));
      setOauthLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signUp.email({
      name: name.trim() || email.split("@")[0] || "User",
      email,
      password,
    });
    if (err) {
      setError(authErrorMessage(err));
      setLoading(false);
      return;
    }
    // Session starts immediately — straight into the product.
    router.push("/");
    router.refresh();
  };

  return (
    <AuthShell>
      {/* Mobile logo */}
      <Link href="/" className="mb-8 flex justify-center lg:hidden">
        <Image src="/logo.png" alt="PPTera" width={150} height={40} className="h-10 w-auto" />
      </Link>

      <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">
        Create your free account
      </h1>
      <p className="mt-1.5 text-[15px] text-zinc-500">
        Your first AI-designed deck is minutes away. No credit card needed.
      </p>

      <div className="mt-8 space-y-4">
        {googleEnabled && (
          <>
            <GoogleButton onClick={signUpWithGoogle} loading={oauthLoading} label="Sign up with Google" />
            <OrDivider />
          </>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <TextInput
              id="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
    </AuthShell>
  );
}
