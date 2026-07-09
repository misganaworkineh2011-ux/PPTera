"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LayoutTemplate, ArrowRight, FileStack } from "lucide-react";
import { toast } from "sonner";

interface TemplateCard {
  id: string;
  name: string;
  category: string;
  description?: string;
  slideCount: number;
}

/**
 * Template gallery: curated deck structures + the user's saved templates.
 * "Use" creates an outline from the skeleton and enters the normal
 * outline → generate flow.
 */
export default function TemplatesClient() {
  const router = useRouter();
  const [curated, setCurated] = useState<TemplateCard[]>([]);
  const [mine, setMine] = useState<TemplateCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        setCurated(data.curated ?? []);
        setMine(data.mine ?? []);
      })
      .catch(() => toast.error("Failed to load templates"))
      .finally(() => setIsLoading(false));
  }, []);

  const useTemplate = async (id: string, isCurated: boolean) => {
    setUsingId(id);
    try {
      const res = await fetch("/api/templates/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCurated ? { curatedId: id } : { templateId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to use template");
      router.push(`/createpresentation/outline/${data.outlineId}?mode=ai`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to use template");
      setUsingId(null);
    }
  };

  const card = (t: TemplateCard, isCurated: boolean) => (
    <div
      key={t.id}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-indigo-600">
          {t.category}
        </span>
        <span className="text-[0.65rem] tabular-nums text-slate-400">
          {t.slideCount} slides
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold text-slate-900">{t.name}</h3>
      {t.description && (
        <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">
          {t.description}
        </p>
      )}
      <button
        onClick={() => useTemplate(t.id, isCurated)}
        disabled={usingId !== null}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {usingId === t.id ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <>
            Use template <ArrowRight size={13} />
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <LayoutTemplate size={20} className="text-indigo-500" /> Templates
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Start from a proven structure — the AI fills it with your topic, your
          theme, and premium layouts. Save any deck as a template from the
          editor (⌘K → “Save as template”).
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading templates…
        </div>
      ) : (
        <>
          {mine.length > 0 && (
            <>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                <FileStack size={15} /> My templates
              </h2>
              <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mine.map((t) => card(t, false))}
              </div>
            </>
          )}
          <h2 className="mb-3 text-sm font-bold text-slate-700">Curated</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {curated.map((t) => card(t, true))}
          </div>
        </>
      )}
    </div>
  );
}
