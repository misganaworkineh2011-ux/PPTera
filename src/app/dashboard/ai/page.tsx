import { requireAuth } from "~/lib/clerk-server";
import { Sparkles, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import AIStickyHeader from "./AIStickyHeader";

export default async function AISuggestionsPage() {
  await requireAuth();

  return (
    <div className="space-y-8 h-full">
      {/* Sticky Header Section */}
      <AIStickyHeader />

      {/* Suggestions List */}
      <div className="space-y-4">
        {/* Suggestion 1: Slide Improvement */}
        <div className="overflow-hidden rounded-xl border border-[#e0f2fe] bg-[#e0f2fe]/30 p-6 shadow-sm transition hover:border-[#06b6d4]/50 hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#1e3a8a]">
                Enhance Slide #3: "Market Analysis"
              </h3>
              <p className="mt-1 text-slate-600">
                The content on this slide is text-heavy. Consider replacing the bullet points with a bar chart to visualize the growth data more effectively.
              </p>
              
              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                   <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Current</p>
                   <div className="space-y-2 text-sm text-slate-500">
                      <p>• Q1 Growth: 10%</p>
                      <p>• Q2 Growth: 15%</p>
                      <p>• Q3 Growth: 22%</p>
                   </div>
                </div>
                <div className="flex items-center justify-center text-slate-400">
                   <ArrowRight size={20} />
                </div>
                <div className="flex-1 rounded-lg border border-[#06b6d4]/30 bg-[#e0f2fe]/30 p-4 shadow-sm">
                   <p className="mb-2 text-xs font-semibold uppercase text-[#06b6d4]">Suggestion</p>
                   <div className="flex h-20 items-end gap-2 px-4">
                      <div className="h-8 w-8 rounded-t bg-[#06b6d4]/40"></div>
                      <div className="h-12 w-8 rounded-t bg-[#06b6d4]/60"></div>
                      <div className="h-16 w-8 rounded-t bg-[#06b6d4]"></div>
                   </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:from-[#172554] hover:to-[#0891b2]">
                  <ThumbsUp size={16} /> Apply Suggestion
                </button>
                <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#1e3a8a] hover:border-[#1e3a8a]/20">
                  <ThumbsDown size={16} /> Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion 2: Image Recommendation */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#06b6d4]/50 hover:shadow-md">
           <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#1e3a8a]">
                Visual Enhancement for "Team" Slide
              </h3>
              <p className="mt-1 text-slate-600">
                We found some high-quality stock photos that match your "Corporate" theme.
              </p>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                 <div className="aspect-video rounded-lg bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10"></div>
                 <div className="aspect-video rounded-lg bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10"></div>
                 <div className="aspect-video rounded-lg bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10"></div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button className="rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:from-[#172554] hover:to-[#0891b2]">
                   View All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
