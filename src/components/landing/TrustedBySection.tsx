"use client";

const logos = [
  { src: "/companyLogo/adobe.png", alt: "Adobe" },
  { src: "/companyLogo/amazon.png", alt: "Amazon" },
  { src: "/companyLogo/stanford.png", alt: "Stanford" },
  { src: "/companyLogo/vercel.png", alt: "Vercel" },
  { src: "/companyLogo/zoom.png", alt: "Zoom" },
  { src: "/companyLogo/latimes.png", alt: "LA Times" },
];

export function TrustedBySection() {
  return (
    <section className="relative z-10 py-12 sm:py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-lg font-medium text-slate-700 mb-8 sm:mb-10">
          Your next big idea is in good company
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
          {logos.map((logo) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              className="h-8 sm:h-10 object-contain brightness-0 opacity-50 hover:opacity-70 transition-opacity"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
