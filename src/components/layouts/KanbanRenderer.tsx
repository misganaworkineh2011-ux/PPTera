"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

interface KanbanRendererProps {
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

export function KanbanRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId = "kanban-style-1",
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
}: KanbanRendererProps) {
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent = accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const border = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";

  const Container = isPresenting ? motion.div : "div";
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const canEdit = !!onStartEditLabel;

  type Card = { col: string | null; title: string; item: BoxContentItem; i: number };
  const cards: Card[] = items.slice(0, 12).map((item, i) => {
    const l = item.label || "";
    const ci = l.indexOf(":");
    return ci > 0 ? { col: l.slice(0, ci).trim(), title: l.slice(ci + 1).trim(), item, i } : { col: null, title: l, item, i };
  });
  let colNames = Array.from(new Set(cards.map((c) => c.col).filter((c): c is string => !!c)));
  if (colNames.length === 0) colNames = ["To Do", "In Progress", "Done"];
  colNames = colNames.slice(0, 4);
  const columns = colNames.map((name) => ({ name, cards: [] as Card[] }));
  let rr = 0;
  cards.forEach((c) => {
    const idx = c.col && colNames.includes(c.col) ? colNames.indexOf(c.col) : (rr++ % columns.length);
    columns[idx]!.cards.push(c);
  });
  const colColor = (ci: number) => `color-mix(in srgb, ${accent} ${88 - ci * 16}%, #7c3aed ${ci * 16}%)`;
  const maxLoad = Math.max(...columns.map((c) => c.cards.length), 1);

  const editTitle = (card: Card, cls: string, style?: React.CSSProperties) => {
    const editingThis = isEditing && editingText?.field === `content-label-${card.i}`;
    if (onStartEditLabel && editingThis) {
      return <EditableText value={card.item.label || ""} isEditing onStartEdit={() => {}} onChange={(v) => onUpdateLabel?.(card.i, v)} onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(card.i) : undefined} className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />;
    }
    return <h4 onClick={() => canEdit && !isPresenting && onStartEditLabel?.(card.i)} className={`${cls} ${canEdit && !isPresenting ? "cursor-text" : ""}`} style={{ color: titleColor, ...style }}>{card.title}</h4>;
  };
  const editDesc = (card: Card, cls: string, style?: React.CSSProperties) =>
    card.item.text ? (
      onStartEditText ? (
        <EditableText value={card.item.text} isEditing={isEditing && editingText?.field === `content-text-${card.i}`} onStartEdit={() => onStartEditText(card.i)} onChange={(v) => onUpdateText?.(card.i, v)} onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(card.i) : undefined} className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <p className={cls} style={{ color: bodyColor, ...style }}>{card.item.text}</p>
      )
    ) : null;

  const frame = `${SLIDE_FRAME} flex items-center justify-center ${className}`;
  const gridStyle = { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` };

  // Sticky-note rotations for style-4
  const rot = ["-1.5deg", "1.2deg", "-0.8deg", "1deg"];

  // == STYLE-2: SWIMLANES — horizontal status lanes
  if (layoutId === "kanban-style-2") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-3 ${className}`} key={animationKey} {...cProps}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex items-stretch overflow-hidden rounded-xl" style={{ border: `1px solid ${border}` }}>
            <div className="flex w-32 shrink-0 items-center px-4 text-sm font-extrabold text-white" style={{ background: colColor(ci) }}>{col.name}</div>
            <div className="flex flex-1 gap-2.5 p-2.5" style={{ background: alpha(colColor(ci), "0a") }}>
              {col.cards.map((card) => (
                <CItem key={card.i} className="min-w-0 flex-1 rounded-lg px-3 py-2" style={{ background: cardBg, border: `1px solid ${border}` }} {...itemMotion(card.i)}>
                  {editTitle(card, "text-sm font-bold leading-tight")}
                  {editDesc(card, "mt-0.5 text-xs leading-snug break-words")}
                </CItem>
              ))}
            </div>
          </div>
        ))}
      </Container>
    );
  }

  // == STYLE-4: STICKY NOTES
  if (layoutId === "kanban-style-4") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="grid w-full gap-5" style={gridStyle}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col">
              <div className="mb-3 text-center text-sm font-extrabold uppercase tracking-wide" style={{ color: colColor(ci) }}>{col.name}</div>
              <div className="flex flex-col gap-3.5">
                {col.cards.map((card, k) => (
                  <CItem key={card.i} className="px-4 py-3" style={{ background: `linear-gradient(160deg, ${alpha(colColor(ci), "2e")}, ${alpha(colColor(ci), "17")})`, borderRadius: 4, transform: `rotate(${rot[k % 4]})`, boxShadow: "0 6px 14px -8px rgba(0,0,0,0.4)" }} {...itemMotion(card.i)}>
                    {editTitle(card, "text-sm font-bold leading-tight")}
                    {editDesc(card, "mt-0.5 text-xs leading-snug break-words")}
                  </CItem>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-7: TIMELINE BOARD — a progress rail flowing across columns
  if (layoutId === "kanban-style-7") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-5 ${className}`} key={animationKey} {...cProps}>
        <div className="flex items-center px-2">
          {columns.map((col, ci) => (
            <React.Fragment key={ci}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: colColor(ci), boxShadow: `0 0 0 4px ${alpha(colColor(ci), "1f")}` }}>{ci + 1}</span>
              {ci < columns.length - 1 && <div className="mx-1.5 h-1 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${colColor(ci)}, ${colColor(ci + 1)})` }} />}
            </React.Fragment>
          ))}
        </div>
        <div className="grid gap-4" style={gridStyle}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col">
              <div className="mb-2 text-sm font-extrabold" style={{ color: colColor(ci) }}>{col.name}</div>
              <div className="flex flex-col gap-2.5">
                {col.cards.map((card) => (
                  <CItem key={card.i} className="ppt-tile rounded-lg px-3.5 py-2.5" style={{ background: cardBg, border: `1px solid ${border}`, borderTop: `2px solid ${colColor(ci)}` }} {...itemMotion(card.i)}>
                    {editTitle(card, "text-sm font-bold leading-tight")}
                    {editDesc(card, "mt-0.5 text-xs leading-snug break-words")}
                  </CItem>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-8: GLASS COLUMNS — frosted translucent column panels
  if (layoutId === "kanban-style-8") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="grid w-full gap-4" style={gridStyle}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col rounded-2xl p-3.5" style={{ background: `linear-gradient(160deg, ${alpha(colColor(ci), "1f")}, ${alpha(colColor(ci), "08")})`, backdropFilter: "blur(8px)", border: `1px solid ${alpha(colColor(ci), "33")}` }}>
              <div className="mb-3 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colColor(ci) }} /><span className="text-sm font-extrabold" style={{ color: titleColor }}>{col.name}</span><span className="ml-auto text-xs font-bold" style={{ color: bodyColor }}>{col.cards.length}</span></div>
              <div className="flex flex-col gap-2.5">
                {col.cards.map((card) => (
                  <CItem key={card.i} className="rounded-lg px-3.5 py-2.5" style={{ background: alpha(cardBg, "cc"), border: `1px solid ${alpha(colColor(ci), "2e")}` }} {...itemMotion(card.i)}>
                    {editTitle(card, "text-sm font-bold leading-tight")}
                    {editDesc(card, "mt-0.5 text-xs leading-snug break-words")}
                  </CItem>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-9: COMPACT CHIPS — dense one-line card chips
  if (layoutId === "kanban-style-9") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="grid w-full gap-4" style={gridStyle}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col">
              <div className="mb-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: colColor(ci) }} /><span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: colColor(ci) }}>{col.name}</span></div>
              <div className="flex flex-col gap-1.5">
                {col.cards.map((card) => (
                  <CItem key={card.i} className="flex items-center gap-2 rounded-md px-2.5 py-1.5 min-w-0" style={{ background: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${colColor(ci)}` }} {...itemMotion(card.i)}>
                    {editTitle(card, "truncate text-xs font-bold leading-tight")}
                  </CItem>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-3 / 5 / 6 / 1: column boards with varied header + chrome
  const headerKind = layoutId === "kanban-style-3" ? "bar" : layoutId === "kanban-style-5" ? "progress" : layoutId === "kanban-style-6" ? "minimal" : "pill";
  return (
    <Container className={frame} key={animationKey} {...cProps}>
      <div className="grid w-full gap-4" style={gridStyle}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col rounded-2xl p-3" style={headerKind === "minimal" ? {} : { background: alpha(colColor(ci), "0a"), border: `1px solid ${alpha(colColor(ci), "1f")}` }}>
            {headerKind === "bar" && (
              <div className="mb-3 flex items-center justify-between rounded-lg px-3 py-2 text-white" style={{ background: colColor(ci) }}>
                <span className="text-sm font-extrabold">{col.name}</span>
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-bold">{col.cards.length}</span>
              </div>
            )}
            {headerKind === "pill" && (
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: colColor(ci) }} />
                <span className="text-sm font-extrabold" style={{ color: titleColor }}>{col.name}</span>
                <span className="ml-auto text-xs font-bold" style={{ color: bodyColor }}>{col.cards.length}</span>
              </div>
            )}
            {headerKind === "progress" && (
              <div className="mb-3">
                <div className="mb-1.5 flex items-center justify-between"><span className="text-sm font-extrabold" style={{ color: titleColor }}>{col.name}</span><span className="text-xs font-bold" style={{ color: colColor(ci) }}>{col.cards.length}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: alpha(colColor(ci), "1f") }}><div className="h-full rounded-full" style={{ width: `${(col.cards.length / maxLoad) * 100}%`, background: colColor(ci) }} /></div>
              </div>
            )}
            {headerKind === "minimal" && (
              <div className="mb-3 border-b pb-2" style={{ borderColor: alpha(colColor(ci), "40") }}><span className="text-sm font-extrabold uppercase tracking-wide" style={{ color: colColor(ci) }}>{col.name}</span></div>
            )}
            <div className="flex flex-col gap-2.5">
              {col.cards.map((card) => (
                <CItem key={card.i} className="ppt-tile rounded-lg px-3.5 py-2.5" style={{ background: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${colColor(ci)}` }} {...itemMotion(card.i)}>
                  {editTitle(card, "text-sm font-bold leading-tight")}
                  {editDesc(card, "mt-0.5 text-xs leading-snug break-words")}
                </CItem>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

export default KanbanRenderer;
