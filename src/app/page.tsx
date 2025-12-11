import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20">
      <Navbar />

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            AI-Powered Presentations
          </div>

          <h1 className="text-6xl font-bold leading-tight text-slate-900 md:text-7xl">
            Creative content at the
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              speed of light
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
            Skip the blank page, create brilliance in a flash. Transform your
            ideas into stunning presentations with AI.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl">
                  Start for free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <Link
              href="/pricing"
              className="group flex items-center gap-2 text-base font-medium text-slate-700 transition hover:text-slate-900"
            >
              View pricing
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Preview Cards */}
        <div className="mt-24 grid gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 blur-2xl transition group-hover:opacity-20"></div>
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl text-white shadow-lg">
                ✨
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Presentations
              </h3>
              <p className="text-sm text-slate-600">
                Stunning slides with consistent branding in minutes. Export to
                PPTX, Google Slides, and more.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 blur-2xl transition group-hover:opacity-20"></div>
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-2xl text-white shadow-lg">
                🎨
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Beautiful Designs
              </h3>
              <p className="text-sm text-slate-600">
                Professional templates and stunning visuals powered by advanced
                AI models.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 opacity-10 blur-2xl transition group-hover:opacity-20"></div>
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-2xl text-white shadow-lg">
                ⚡
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Lightning Fast
              </h3>
              <p className="text-sm text-slate-600">
                Create complete presentations in under a minute. No design
                skills required.
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-24 text-center">
          <p className="mb-8 text-sm font-medium text-slate-500">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
            <div className="text-2xl font-bold text-slate-400">Amazon</div>
            <div className="text-2xl font-bold text-slate-400">Adobe</div>
            <div className="text-2xl font-bold text-slate-400">Vercel</div>
            <div className="text-2xl font-bold text-slate-400">Zoom</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
