"use client";

import { useState } from "react";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import PresentationViewer from "~/app/presentation/[slug]/PresentationViewer";

interface PasswordProtectedViewProps {
  presentationId: string;
  correctPassword: string;
  presentationData: any;
  showWatermark?: boolean;
}

export default function PasswordProtectedView({
  presentationId,
  correctPassword,
  presentationData,
  showWatermark
}: PasswordProtectedViewProps) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password === correctPassword) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (isUnlocked) {
    return (
      <div className="relative min-h-screen bg-black">
        <PresentationViewer
          presentation={presentationData}
          mode="view"
          isOwner={false}
          isPublicView={true}
        />
        
        {showWatermark && (
          <a
            href="https://www.pptmaster.app"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-black/80 transition shadow-lg"
          >
            <img 
              src="/logo.png" 
              alt="PPTera" 
              className="w-5 h-5 object-contain"
            />
            Made with PPTera
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-8 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-cyan-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Protected Presentation</h1>
          <p className="text-slate-500 text-sm">This presentation is password-protected. Please enter the password to view it.</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-1.5">
            <input
              autoFocus
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-5 py-4 rounded-2xl border text-center text-lg font-bold focus:outline-none focus:ring-4 transition-all ${
                error 
                  ? "border-red-300 bg-red-50 ring-red-500/10 dark:bg-red-900/10 dark:border-red-800"
                  : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 focus:ring-cyan-500/20"
              }`}
            />
            {error && (
              <p className="text-red-500 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <ShieldAlert size={14} /> Incorrect password. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95"
          >
            Unlock Presentation
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Powered by PPTera Security
          </p>
        </div>
      </div>
    </div>
  );
}
