"use client";

/**
 * Dev-only harness to verify per-item entrance animations + click-to-reveal
 * builds without needing an authed presentation. Open /dev/animation-test.
 * Safe to delete once animations are confirmed.
 */
import { useState } from "react";
import { getDefaultTheme } from "~/lib/themes";
import BoxLayoutRenderer from "~/components/presentation/BoxLayoutRenderer";
import { TimelineRoadmapRenderer } from "~/components/layouts/TimelineRoadmapRenderer";
import { StepsLayoutRenderer } from "~/components/layouts/StepsLayoutRenderer";
import { ITEM_ANIMATIONS } from "~/components/presentation/item-animations";

const ITEMS = [
  { label: "First Point", text: "The opening component enters first." },
  { label: "Second Point", text: "Then this one follows with a delay." },
  { label: "Third Point", text: "Each item waits for the previous one." },
  { label: "Fourth Point", text: "Until the whole slide has arrived." },
];

export default function AnimationTestPage() {
  const theme = getDefaultTheme();
  const [style, setStyle] = useState("fade-up");
  const [replayKey, setReplayKey] = useState(0);
  const [reveal, setReveal] = useState<number | undefined>(undefined);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 space-y-6">
      <h1 className="text-xl font-bold">Item animation test harness</h1>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={style}
          onChange={(e) => { setStyle(e.target.value); setReplayKey((k) => k + 1); }}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
          data-testid="style-select"
        >
          {ITEM_ANIMATIONS.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <button
          onClick={() => setReplayKey((k) => k + 1)}
          className="bg-teal-600 hover:bg-teal-500 rounded-lg px-4 py-2 text-sm font-medium"
          data-testid="replay"
        >
          Replay
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Build reveal:</span>
          <button onClick={() => setReveal(undefined)} className={`px-2.5 py-1.5 rounded text-xs ${reveal === undefined ? "bg-teal-600" : "bg-slate-700"}`}>auto</button>
          {[0, 1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => setReveal(n)} className={`px-2.5 py-1.5 rounded text-xs ${reveal === n ? "bg-teal-600" : "bg-slate-700"}`} data-testid={`reveal-${n}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-white rounded-xl p-6" data-testid="box-section">
        <p className="text-slate-500 text-xs mb-3 font-mono">BoxLayoutRenderer · isPresenting=true · style={style} · reveal={String(reveal)}</p>
        <BoxLayoutRenderer
          key={`box-${replayKey}`}
          layoutId="box-style-1"
          items={ITEMS}
          theme={theme}
          isPresenting={true}
          animationKey={`box-${replayKey}`}
          itemAnimation={style}
          revealCount={reveal}
        />
      </section>

      <section className="bg-white rounded-xl p-6" style={{ height: 340 }} data-testid="timeline-section">
        <p className="text-slate-500 text-xs mb-3 font-mono">TimelineRoadmapRenderer (metro) · isPresenting=true</p>
        <div style={{ height: 280 }}>
          <TimelineRoadmapRenderer
            key={`tl-${replayKey}`}
            layoutId="timeline-style-2"
            items={ITEMS}
            theme={theme}
            isPresenting={true}
            animationKey={`tl-${replayKey}`}
            itemAnimation={style}
            revealCount={reveal}
          />
        </div>
      </section>

      <section className="bg-white rounded-xl p-6" style={{ height: 320 }} data-testid="steps-section">
        <p className="text-slate-500 text-xs mb-3 font-mono">StepsLayoutRenderer (pipeline) · isPresenting=true</p>
        <div style={{ height: 250 }}>
          <StepsLayoutRenderer
            key={`st-${replayKey}`}
            layoutId="steps-pipeline"
            items={ITEMS}
            theme={theme}
            isPresenting={true}
            animationKey={`st-${replayKey}`}
            itemAnimation={style}
            revealCount={reveal}
          />
        </div>
      </section>
    </div>
  );
}
