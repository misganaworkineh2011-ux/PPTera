import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, ArrowRight } from "lucide-react";

export default function AISuggestionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Suggestions</h1>
          <p className="text-sm text-slate-500">
            Smart recommendations to improve your presentations
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {/* Suggestion 1: Slide Improvement */}
        <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">
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
                <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
                   <p className="mb-2 text-xs font-semibold uppercase text-blue-400">Suggestion</p>
                   <div className="flex h-20 items-end gap-2 px-4">
                      <div className="h-8 w-8 rounded-t bg-blue-300"></div>
                      <div className="h-12 w-8 rounded-t bg-blue-400"></div>
                      <div className="h-16 w-8 rounded-t bg-blue-500"></div>
                   </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                  <ThumbsUp size={16} /> Apply Suggestion
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <ThumbsDown size={16} /> Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion 2: Image Recommendation */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6">
           <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">
                Visual Enhancement for "Team" Slide
              </h3>
              <p className="mt-1 text-slate-600">
                We found some high-quality stock photos that match your "Corporate" theme.
              </p>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                 <div className="aspect-video rounded-lg bg-slate-100"></div>
                 <div className="aspect-video rounded-lg bg-slate-100"></div>
                 <div className="aspect-video rounded-lg bg-slate-100"></div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
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

