"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LayoutTemplate, ArrowRight, FileStack, Layers } from "lucide-react";
import { toast } from "sonner";

interface TemplateCard {
  id: string;
  name: string;
  category: string;
  description?: string;
  slideCount: number;
  flow?: string[];
}

const FLOW_PREVIEW_COUNT = 4;

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  // Categories in catalog order, with counts for the filter chips
  const categories = useMemo(() => {
    const order: string[] = [];
    const counts = new Map<string, number>();
    for (const t of curated) {
      if (!counts.has(t.category)) order.push(t.category);
      counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
    }
    return order.map((c) => ({ name: c, count: counts.get(c) ?? 0 }));
  }, [curated]);

  const visibleCurated = activeCategory
    ? curated.filter((t) => t.category === activeCategory)
    : curated;

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

  const card = (t: TemplateCard, isCurated: boolean) => {
    const flow = (t.flow ?? []).slice(0, FLOW_PREVIEW_COUNT);
    const remaining = (t.flow?.length ?? 0) - flow.length;
    return (
      <div
        key={t.id}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:ring-0 dark:shadow-none dark:hover:bg-white/[0.06]"
      >
        {/* Aurora sheen on hover */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.10), transparent 40%, transparent 60%, rgba(34,211,238,0.10))" }}
        />
        <div className="relative flex items-center justify-between gap-2">
          <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-violet-600 dark:text-violet-300">
            {t.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold tabular-nums text-slate-400 dark:text-zinc-500">
            <Layers size={11} /> {t.slideCount} slides
          </span>
        </div>
        <h3 className="relative mt-3 text-base font-bold text-slate-900 transition-colors group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-300">
          {t.name}
        </h3>
        {t.description && (
          <p className="relative mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
            {t.description}
          </p>
        )}
        {/* Slide-flow preview: the structure you're actually buying */}
        {flow.length > 0 && (
          <ol className="relative mt-3 flex-1 space-y-1.5 border-l border-slate-200 pl-3 dark:border-white/10">
            {flow.map((title, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                <span className="text-[9px] font-black tabular-nums text-slate-300 dark:text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate">{title}</span>
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-[10px] font-bold uppercase tracking-wider text-slate-300 dark:text-zinc-600">
                +{remaining} more
              </li>
            )}
          </ol>
        )}
        {flow.length === 0 && <div className="flex-1" />}
        <button
          onClick={() => useTemplate(t.id, isCurated)}
          disabled={usingId !== null}
          className="relative mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:brightness-110 disabled:opacity-50"
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
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          <LayoutTemplate size={20} className="text-cyan-500" /> Templates
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
          Start from a proven structure — the AI fills it with your topic, your
          theme, and premium layouts. Save any deck as a template from the
          dashboard (right-click → “Use as template”).
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400 dark:text-zinc-500">
          <Loader2 size={16} className="animate-spin" /> Loading templates…
        </div>
      ) : (
        <>
          {mine.length > 0 && (
            <>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                <FileStack size={15} /> My templates
              </h2>
              <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mine.map((t) => card(t, false))}
              </div>
            </>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="mr-2 text-sm font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Curated
            </h2>
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${
                activeCategory === null
                  ? "border-transparent bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-cyan-400/50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
              }`}
            >
              All {curated.length}
            </button>
            {categories.map(({ name, count }) => (
              <button
                type="button"
                key={name}
                onClick={() => setActiveCategory(activeCategory === name ? null : name)}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${
                  activeCategory === name
                    ? "border-transparent bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-cyan-400/50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
                }`}
              >
                {name} <span className="opacity-60 tabular-nums">{count}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCurated.map((t) => card(t, true))}
          </div>
        </>
      )}
    </div>
  );
}
