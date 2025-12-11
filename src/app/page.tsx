import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">PPTMaster</h1>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900">
            Create Stunning Presentations
            <span className="block text-blue-600">with AI</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Transform your ideas into professional presentations in seconds.
            Powered by advanced AI technology.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700">
                  Get Started Free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <Link
              href="/pricing"
              className="rounded-lg border-2 border-blue-600 px-8 py-3 text-lg font-semibold text-blue-600 hover:bg-blue-50"
            >
              View Pricing
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">🤖</div>
            <h3 className="mb-2 text-xl font-semibold">AI-Powered</h3>
            <p className="text-gray-600">
              Advanced AI generates professional content and designs
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">⚡</div>
            <h3 className="mb-2 text-xl font-semibold">Lightning Fast</h3>
            <p className="text-gray-600">
              Create complete presentations in under a minute
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">🎨</div>
            <h3 className="mb-2 text-xl font-semibold">Beautiful Designs</h3>
            <p className="text-gray-600">
              Professional templates and stunning visuals
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
