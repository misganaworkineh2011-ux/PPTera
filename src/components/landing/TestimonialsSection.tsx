"use client";

import { useState, useEffect } from "react";

interface TestimonialsSectionProps {
  t: any;
}

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at TechCorp",
    content:
      "PPTMaster saved me hours of work. I created a board presentation in 10 minutes that would have taken me a full day.",
    avatar: "SC",
  },
  {
    name: "Michael Rodriguez",
    role: "Startup Founder",
    content:
      "The AI understands exactly what I need. My investor pitch deck looked like it was made by a professional designer.",
    avatar: "MR",
  },
  {
    name: "Emily Watson",
    role: "Marketing Director",
    content: "Our team uses PPTMaster for all client presentations now. The quality is consistently impressive.",
    avatar: "EW",
  },
  {
    name: "David Kim",
    role: "Sales Executive",
    content: "I close more deals because my presentations look incredible. This tool pays for itself every month.",
    avatar: "DK",
  },
  {
    name: "Lisa Thompson",
    role: "University Professor",
    content: "Creating lecture slides used to be tedious. Now I focus on content while PPTMaster handles the design.",
    avatar: "LT",
  },
];

export function TestimonialsSection({ t }: TestimonialsSectionProps) {
  return (
    <section className="relative z-10 py-12 md:py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-16 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900">{t.joinMillionUsers}</h2>
      </div>
      <TestimonialsCarousel />
    </section>
  );
}

function TestimonialsCarousel() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((o) => o + 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden py-4">
      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

      {/* Scrolling Container */}
      <div
        className="flex gap-6"
        style={{
          transform: `translateX(-${offset % (testimonials.length * 350)}px)`,
          width: `${testimonials.length * 2 * 350}px`,
        }}
      >
        {[...testimonials, ...testimonials].map((testimonial, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[320px] p-6 rounded-2xl bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-xs text-slate-500">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
