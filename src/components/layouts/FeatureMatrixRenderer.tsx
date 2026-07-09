"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

interface FeatureMatrixRendererProps {
  items: BoxContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  isPresenting?: boolean;
  animationKey?: string;
  itemAnimation?: string;
  revealCount?: number;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  onDeleteItem?: (index: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function FeatureMatrixRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId = "featurematrix-style-1",
  isPresenting = false,
  animationKey,
  itemAnimation,
  revealCount,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  onDeleteItem,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: FeatureMatrixRendererProps) {
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent = accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const border = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.1)";

  const header = items[0];
  const cols = (header?.text || "Option A | Option B | Option C").split("|").map((s) => s.trim()).filter(Boolean);
  const rows = items.slice(1, 9);
  const nCols = Math.max(cols.length, 1);
  const gridCols = `minmax(0, 1.5fr) repeat(${nCols}, minmax(0, 1fr))`;

  const Container = isPresenting ? motion.div : "div";
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const canEdit = !!onStartEditText;

  const token = (raw: string) => {
    const t = raw.trim().toLowerCase();
    if (["✓", "yes", "true", "y", "✔", "included", "1"].includes(t)) return "yes";
    if (["✗", "x", "no", "false", "n", "—", "-", "✕", "0", ""].includes(t)) return "no";
    if (["~", "partial", "part", "±", "limited"].includes(t)) return "partial";
    return raw.trim();
  };
  const cellNode = (raw: string, on: boolean) => {
    const k = token(raw);
    if (k === "yes") return <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: on ? accent : `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})` }}>✓</span>;
    if (k === "no") return <span className="text-base font-bold" style={{ color: alpha(bodyColor, "80") }}>✕</span>;
    if (k === "partial") return <span className="text-lg font-bold leading-none" style={{ color: alpha(accent, "99") }}>~</span>;
    return <span className="text-sm font-semibold" style={{ color: on ? accent : titleColor }}>{k}</span>;
  };

  // Feature name — inline editable
  const editName = (item: BoxContentItem, i: number, cls: string) =>
    onStartEditLabel ? (
      <EditableText value={item.label || ""} isEditing={isEditing && editingText?.field === `content-label-${i}`}
        onStartEdit={() => onStartEditLabel(i)} onChange={(v) => onUpdateLabel?.(i, v)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(i) : undefined}
        className={cls} style={{ color: titleColor }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <span className={cls} style={{ color: titleColor }}>{item.label}</span>
    );

  // Cells for one item (header row uses index 0). Click to edit the raw pipe string.
  const rawEditor = (item: BoxContentItem, i: number, cls: string) => (
    <EditableText value={item.text || ""} isEditing onStartEdit={() => {}} onChange={(v) => onUpdateText?.(i, v)}
      onFinish={onFinishEditing || (() => {})} className={cls} style={{ color: bodyColor }} isOwner={isOwner} isHovered={isHovered} />
  );

  const shade = (ci: number) => `color-mix(in srgb, ${accent} ${88 - ci * 14}%, #0b1220 ${ci * 14}%)`;

  const matrix = (opts: { headerBg: string; headerColor: string; zebra?: boolean; winner?: number; tint?: boolean; chip?: boolean; hairline?: boolean }) => {
    const editingHeader = isEditing && editingText?.field === "content-text-0";
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="w-full max-w-5xl overflow-hidden" style={{ borderRadius: 14, border: opts.hairline ? "none" : `1px solid ${border}` }}>
          {/* Header row */}
          <div className="grid items-center" style={{ gridTemplateColumns: gridCols, background: opts.headerBg, borderBottom: opts.hairline ? `2px solid ${accent}` : undefined }}>
            <div className="px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide" style={{ color: opts.headerColor }}>{header ? editName(header, 0, "text-sm font-extrabold uppercase tracking-wide") : "Features"}</div>
            {editingHeader && canEdit ? (
              <div className="col-span-full px-3 py-2" style={{ gridColumn: `2 / span ${nCols}` }}>{rawEditor(header!, 0, "text-center text-sm font-bold")}</div>
            ) : (
              cols.map((c, ci) => (
                <div key={ci} onClick={() => canEdit && onStartEditText?.(0)} className={`px-3 py-2.5 text-center text-sm font-extrabold ${canEdit && !isPresenting ? "cursor-text" : ""}`}
                  style={{ color: ci === opts.winner ? accent : opts.headerColor, background: ci === opts.winner ? alpha(accent, "1a") : opts.tint ? alpha(shade(ci), "14") : undefined }}>
                  {c}
                </div>
              ))
            )}
          </div>
          {/* Feature rows */}
          {rows.map((row, ri) => {
            const i = ri + 1;
            const editingRow = isEditing && editingText?.field === `content-text-${i}`;
            const cells = (row.text || "").split("|");
            return (
              <CItem key={i} className="grid items-center" style={{ gridTemplateColumns: gridCols, background: opts.zebra && ri % 2 === 1 ? alpha(bodyColor, "0a") : undefined, borderTop: `1px solid ${alpha(border, "cc")}` }} {...itemMotion(i)}>
                <div className="px-4 py-2.5">{editName(row, i, "text-sm font-semibold leading-tight")}</div>
                {editingRow && canEdit ? (
                  <div className="px-3 py-2" style={{ gridColumn: `2 / span ${nCols}` }}>{rawEditor(row, i, "text-center text-sm")}</div>
                ) : (
                  cols.map((_, ci) => (
                    <div key={ci} onClick={() => canEdit && onStartEditText?.(i)} className={`flex justify-center px-3 py-2.5 ${canEdit && !isPresenting ? "cursor-text" : ""}`}
                      style={{ background: ci === opts.winner ? alpha(accent, "0d") : opts.tint ? alpha(shade(ci), "0a") : undefined }}>
                      {opts.chip ? (
                        <span className="flex w-full items-center justify-center rounded-md py-1" style={{ background: token(cells[ci] ?? "") === "yes" ? alpha(accent, "17") : alpha(bodyColor, "0d") }}>{cellNode(cells[ci] ?? "", ci === opts.winner)}</span>
                      ) : cellNode(cells[ci] ?? "", ci === opts.winner)}
                    </div>
                  ))
                )}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  };

  if (layoutId === "featurematrix-style-2") return matrix({ headerBg: cardBg, headerColor: titleColor, chip: true });
  if (layoutId === "featurematrix-style-3") return matrix({ headerBg: cardBg, headerColor: titleColor, zebra: true, winner: nCols - 1 });
  if (layoutId === "featurematrix-style-4") return matrix({ headerBg: "transparent", headerColor: bodyColor, hairline: true });
  if (layoutId === "featurematrix-style-5") return matrix({ headerBg: cardBg, headerColor: titleColor, tint: true });
  if (layoutId === "featurematrix-style-8") return matrix({ headerBg: titleColor, headerColor: theme?.colors.background || cardBg, zebra: true });

  // == STYLE-6: COLUMN CARDS — each option as a card listing its ✓ features
  if (layoutId === "featurematrix-style-6") {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid w-full max-w-5xl items-stretch gap-4" style={{ gridTemplateColumns: `repeat(${nCols}, minmax(0, 1fr))` }}>
          {cols.map((col, ci) => {
            const win = ci === nCols - 1;
            return (
              <CItem key={ci} className="ppt-tile flex flex-col rounded-2xl p-5" style={{ background: win ? `linear-gradient(160deg, ${alpha(accent, "1f")}, ${cardBg})` : cardBg, border: `1px solid ${win ? accent : border}` }} {...itemMotion(ci)}>
                <div className="mb-3 text-base font-extrabold" style={{ color: win ? accent : titleColor }}>{col}</div>
                <ul className="flex flex-1 flex-col gap-2">
                  {rows.map((row, ri) => {
                    const cell = (row.text || "").split("|")[ci] ?? "";
                    const k = token(cell);
                    return (
                      <li key={ri} className="flex items-start gap-2 text-sm" style={{ color: k === "no" ? alpha(bodyColor, "80") : bodyColor }}>
                        <span className="mt-0.5">{cellNode(cell, win)}</span>
                        <span className={k === "no" ? "line-through opacity-60" : ""}>{row.label}{k !== "yes" && k !== "no" && k !== "partial" ? "" : ""}</span>
                      </li>
                    );
                  })}
                </ul>
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == STYLE-7: SCORE RANKING — options ranked by their ✓ count
  if (layoutId === "featurematrix-style-7") {
    const scores = cols.map((col, ci) => ({ col, ci, score: rows.filter((r) => token((r.text || "").split("|")[ci] ?? "") === "yes").length }));
    const max = Math.max(...scores.map((s) => s.score), 1);
    const ranked = [...scores].sort((a, b) => b.score - a.score);
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex w-full max-w-3xl flex-col gap-4">
          {ranked.map((s, rank) => (
            <CItem key={s.ci} className="flex items-center gap-4" {...itemMotion(rank)}>
              <span className="w-8 text-2xl font-black tabular-nums" style={{ color: rank === 0 ? accent : alpha(bodyColor, "80") }}>{rank + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between"><span className="text-sm font-bold" style={{ color: titleColor }}>{s.col}</span><span className="text-xs font-bold" style={{ color: accent }}>{s.score}/{rows.length}</span></div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full" style={{ background: alpha(accent, "14") }}><div className="h-full rounded-full" style={{ width: `${(s.score / max) * 100}%`, background: rank === 0 ? `linear-gradient(90deg, ${accent}, ${alpha(accent, "b3")})` : alpha(accent, "80") }} /></div>
              </div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-9: DENSE PRINT — a compact tight table
  if (layoutId === "featurematrix-style-9") {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="w-full max-w-4xl overflow-hidden rounded-lg text-xs" style={{ border: `1px solid ${border}` }}>
          <div className="grid items-center" style={{ gridTemplateColumns: gridCols, background: alpha(accent, "14") }}>
            <div className="px-3 py-1.5 font-extrabold uppercase tracking-wide" style={{ color: titleColor }}>{cols.length ? "Feature" : ""}</div>
            {cols.map((c, ci) => <div key={ci} className="px-2 py-1.5 text-center font-bold" style={{ color: accent }}>{c}</div>)}
          </div>
          {rows.map((row, ri) => {
            const i = ri + 1;
            const cells = (row.text || "").split("|");
            return (
              <CItem key={i} className="grid items-center" style={{ gridTemplateColumns: gridCols, background: ri % 2 === 1 ? alpha(bodyColor, "08") : undefined, borderTop: `1px solid ${alpha(border, "cc")}` }} {...itemMotion(i)}>
                <div className="px-3 py-1">{editName(row, i, "text-xs font-semibold leading-tight")}</div>
                {cols.map((_, ci) => {
                  const k = token(cells[ci] ?? "");
                  return <div key={ci} className="flex justify-center px-2 py-1 font-bold" style={{ color: k === "yes" ? accent : k === "no" ? alpha(bodyColor, "80") : titleColor }}>{k === "yes" ? "✓" : k === "no" ? "✕" : k === "partial" ? "~" : k}</div>;
                })}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // style-1 (default): accent header + zebra
  return matrix({ headerBg: `linear-gradient(90deg, ${accent}, ${alpha(accent, "cc")})`, headerColor: "#ffffff", zebra: true });
}

export default FeatureMatrixRenderer;
