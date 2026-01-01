"use client";

import { type Language } from "~/lib/i18n";

interface TemplatesSectionProps {
  t?: any;
  currentLang?: Language;
}

export function TemplatesSection({ t }: TemplatesSectionProps) {
  return (
    <section className="bg-zinc-900 pt-20 pb-1 px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div>
            <h2 className="text-[2.5rem] leading-[1.15] font-semibold tracking-tight text-white lg:text-[3rem]">
              {t?.startWithTemplate || "Start with a template. Make just"}<br />{t?.aboutAnything || "about anything."}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
