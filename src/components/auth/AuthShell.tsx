"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { Sparkles, Wand2, LayoutTemplate, Share2 } from "lucide-react";

/**
 * Split-screen shell for the custom auth pages: dark brand panel with an
 * animated aurora backdrop on the left, the form on the right. Fully custom
 * UI — no Clerk components render here, so no third-party branding appears.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen w-full flex bg-[#06090f] text-white">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex w-[46%] flex-col justify-between overflow-hidden p-12">
        {/* Aurora backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#0f766e]/50 blur-[130px]" />
          <div className="absolute bottom-[-140px] left-1/3 w-[520px] h-[520px] rounded-full bg-[#14b8a6]/30 blur-[150px]" />
          <div className="absolute top-1/3 right-[-120px] w-[380px] h-[380px] rounded-full bg-[#10b981]/25 blur-[130px]" />
          {/* Fine grid, fading out */}
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse at 30% 20%, black 0%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at 30% 20%, black 0%, transparent 70%)",
            }}
          />
        </div>

        <Link href="/" className="relative z-10 inline-flex items-center w-fit">
          <Image src="/logo.png" alt="PPTera" width={170} height={46} className="h-11 w-auto" />
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-[1.15] tracking-tight">
            Ideas in.
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Stunning decks out.
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-300/90">
            PPTera turns a single prompt into a fully designed presentation —
            layouts, imagery, charts and speaker notes included.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              { icon: Wand2, text: "Generate a complete deck from one prompt" },
              { icon: LayoutTemplate, text: "100+ themes and smart, adaptive layouts" },
              { icon: Share2, text: "Present, export to PowerPoint, or share a link" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-teal-300" />
                </span>
                <span className="text-[15px] text-slate-200">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 text-sm text-slate-400">
          <Sparkles className="h-4 w-4 text-teal-300" />
          Trusted by presenters, founders, educators and teams worldwide
        </div>
      </aside>

      {/* Form panel */}
      <section className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-10 bg-white text-zinc-900">
        {/* Soft accent for the light side */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-28 right-[-100px] w-[380px] h-[380px] rounded-full bg-teal-100/60 blur-[110px]" />
          <div className="absolute bottom-[-120px] left-[-80px] w-[320px] h-[320px] rounded-full bg-emerald-100/60 blur-[110px]" />
        </div>
        <div className="relative w-full max-w-[420px]">{children}</div>
      </section>
    </main>
  );
}
