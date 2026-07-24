import Link from "next/link";
import { Home, MailCheck, Sparkles } from "lucide-react";

export default function NewsletterSuccessPage({
  searchParams,
}: {
  searchParams: { already?: string };
}) {
  const alreadyConfirmed = searchParams.already === "true";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Icon Animation */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black text-slate-200 leading-none select-none">
            🎉
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#0f766e] to-[#14b8a6] flex items-center justify-center animate-bounce">
              {alreadyConfirmed ? (
                <MailCheck className="h-16 w-16 text-white" />
              ) : (
                <Sparkles className="h-16 w-16 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {alreadyConfirmed ? "Already Subscribed!" : "You're Subscribed!"}
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          {alreadyConfirmed
            ? "Your email is already confirmed. You'll receive our latest updates and tips."
            : "Thanks for subscribing! You'll now receive our latest updates, tips, and exclusive content."}
        </p>

        {!alreadyConfirmed && (
          <div className="mb-8 rounded-xl bg-gradient-to-r from-[#0f766e]/5 to-[#14b8a6]/5 p-6 max-w-md mx-auto border border-slate-200">
            <p className="font-semibold text-slate-800 mb-2">What to expect:</p>
            <p className="text-slate-600 text-sm">
              Product updates, presentation tips, and exclusive offers delivered to your inbox.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-full border-2 border-slate-200 hover:border-slate-300 transition-all hover:scale-105"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Contact Info */}
        <p className="mt-12 text-sm text-slate-500">
          Questions? Contact us at{" "}
          <a 
            href="mailto:pptmaster.app@gmail.com" 
            className="text-[#0f766e] hover:underline font-medium"
          >
            pptmaster.app@gmail.com
          </a>
        </p>

        {/* Decorative Elements */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto opacity-50">
          <div className="h-2 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-2 bg-slate-200 rounded-full animate-pulse [animation-delay:200ms]"></div>
          <div className="h-2 bg-slate-200 rounded-full animate-pulse [animation-delay:400ms]"></div>
        </div>
      </div>
    </div>
  );
}
