"use client";

import { CheckCircle2 } from "lucide-react";
import { GenerateDemo } from "./GenerateDemo";
import { EditDemo } from "./EditDemo";
import { ExportDemo } from "./ExportDemo";

interface FeaturesSectionProps {
  t: any;
}

export function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section className="relative z-10 py-24 px-6 md:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl">
        {/* Generate Feature */}
        <div className="grid gap-12 md:grid-cols-2 items-center mb-32">
          <div className="order-2 md:order-1">
            <div className="mb-6 inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-600">
              {t.instantCreation}
            </div>
            <h3 className="mb-4 text-3xl font-bold text-slate-900">
              {t.skipBlankPage} <br /> {t.createBrilliance}
            </h3>
            <ul className="space-y-4 text-lg text-slate-600">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                {t.startWithIdea}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                {t.aiModels}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                {t.importBrand}
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <GenerateDemo />
          </div>
        </div>

        {/* Edit Feature */}
        <div className="grid gap-12 md:grid-cols-2 items-center mb-32">
          <div>
            <EditDemo />
          </div>
          <div>
            <div className="mb-6 inline-flex rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-600">
              {t.smartRefine}
            </div>
            <h3 className="mb-4 text-3xl font-bold text-slate-900">
              {t.editWithAI} <br /> {t.inJustClick}
            </h3>
            <ul className="space-y-4 text-lg text-slate-600">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0" />
                {t.smartLayouts}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0" />
                {t.generateImages}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0" />
                {t.collaborateRealtime}
              </li>
            </ul>
          </div>
        </div>

        {/* Export Feature */}
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <div className="mb-6 inline-flex rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-600">
              {t.universalShare}
            </div>
            <h3 className="mb-4 text-3xl font-bold text-slate-900">
              {t.shareworthyContent} <br /> {t.whereverYouNeed}
            </h3>
            <ul className="space-y-4 text-lg text-slate-600">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                {t.exportFormats}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                {t.publishWebsite}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                {t.trackEngagement}
              </li>
            </ul>
          </div>
          <div>
            <ExportDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
