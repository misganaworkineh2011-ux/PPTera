import type { Metadata } from "next";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * OAuth landing route for the custom sign-in/sign-up pages: Clerk finishes the
 * redirect handshake here (headless — renders nothing of its own), then sends
 * the user to redirectUrlComplete. We show a branded spinner meanwhile.
 */
export default function SSOCallbackPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#06090f] text-white">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      <p className="text-sm text-slate-400">Signing you in…</p>
      <AuthenticateWithRedirectCallback signInForceRedirectUrl="/" signUpForceRedirectUrl="/" />
    </main>
  );
}
