"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";

const templates = [
  { 
    category: "Business", 
    bg: "bg-cyan-500",
    href: "/inspiration",
  },
  { 
    category: "Social media", 
    bg: "bg-lime-400",
    href: "/inspiration",
  },
  { 
    category: "Education", 
    bg: "bg-emerald-400",
    href: "/education",
  },
  { 
    category: "Presentations", 
    bg: "bg-zinc-200",
    href: "/dashboard",
  },
  { 
    category: "Marketing", 
    bg: "bg-lime-300",
    href: "/inspiration",
  },
];

export function TemplatesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % templates.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length);
  };

  return (
    <section className="bg-zinc-900 py-20 px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div>
            <h2 className="text-[2.5rem] leading-[1.15] font-semibold tracking-tight text-white lg:text-[3rem]">
              Start with a template. Make just<br />about anything.
            </h2>
            <LoadingLink 
              href="/inspiration"
              className="inline-flex items-center mt-6 px-5 py-2.5 border border-zinc-700 rounded-lg text-sm text-white hover:bg-zinc-800 transition"
            >
              Explore all templates
            </LoadingLink>
          </div>
        </div>
      </div>
    </section>
  );
}
