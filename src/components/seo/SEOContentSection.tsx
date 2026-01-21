import type React from "react";

interface ContentSection {
  title: string;
  body: string;
  bullets?: string[];
}

export function SEOContentSection({
  sections,
  heading = "About this tool",
}: {
  sections: ContentSection[];
  heading?: string;
}) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="py-16 px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
          {heading}
        </h2>
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-900">
                {section.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {section.body}
              </p>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc pl-5 text-slate-600 space-y-1">
                  {section.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
