"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { FileText, Wand2, Share2, Sparkles } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";
import { StepCard } from "./StepCard";
import { ProductDemo } from "./ProductDemo";

interface HowItWorksSectionProps {
  t: any;
}

export function HowItWorksSection({ t }: HowItWorksSectionProps) {
  return (
    <section id="demo" className="relative z-10 py-20 px-4 sm:py-28 sm:px-6 md:py-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/bg2.webp" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/90 via-blue-100/80 to-white/90"></div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {t.fromIdeaToPresentation}
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Three simple steps to create stunning presentations
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <StepCard
            number="1"
            icon={<FileText className="w-6 h-6" />}
            title="Describe Your Idea"
            description="Just type what your presentation is about. Our AI understands context and creates a perfect outline."
            color="blue"
          />
          <StepCard
            number="2"
            icon={<Wand2 className="w-6 h-6" />}
            title="AI Generates Slides"
            description="Watch as beautiful slides are created in seconds with smart layouts, images, and professional design."
            color="purple"
          />
          <StepCard
            number="3"
            icon={<Share2 className="w-6 h-6" />}
            title="Edit & Share"
            description="Fine-tune with our editor, export to PowerPoint or PDF, and share with your audience."
            color="green"
          />
        </div>

        {/* Interactive Demo */}
        <ProductDemo />

        <div className="mt-16 text-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-2 h-12 rounded-full bg-black px-8 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:bg-slate-800">
                <Sparkles className="w-5 h-5" />
                {t.tryItFree}
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <LoadingLink
              href="/dashboard"
              className="inline-flex items-center gap-2 h-12 rounded-full bg-black px-8 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:bg-slate-800"
            >
              <Sparkles className="w-5 h-5" />
              {t.goToDashboard}
            </LoadingLink>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}
