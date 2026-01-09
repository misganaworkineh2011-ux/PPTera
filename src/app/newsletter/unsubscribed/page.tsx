import Link from "next/link";
import { Home, MailX, RefreshCw } from "lucide-react";

export default function NewsletterUnsubscribedPage({
  searchParams,
}: {
  searchParams: { already?: string; success?: string };
}) {
  const alreadyUnsubscribed = searchParams.already === "true";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Icon Animation */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black text-slate-200 leading-none select-none">
            {alreadyUnsubscribed ? "👋" : "✓"}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center animate-bounce">
              {alreadyUnsubscribed ? (
                <RefreshCw className="h-16 w-16 text-white" />
              ) : (
                <MailX className="h-16 w-16 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {alreadyUnsubscribed ? "Already Unsubscribed" : "Unsubscribed Successfully"}
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          {alreadyUnsubscribed
            ? "You've already been removed from our mailing list. No further action is needed."
            : "You've been removed from our mailing list. We're sorry to see you go!"}
        </p>

        {!alreadyUnsubscribed && (
          <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
            Changed your mind? You can always resubscribe from our homepage.
          </p>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </div>

        {/* Contact Info */}
        <p className="mt-12 text-sm text-slate-500">
          Questions? Contact us at{" "}
          <a 
            href="mailto:pptmaster.app@gmail.com" 
            className="text-[#1e3a8a] hover:underline font-medium"
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
