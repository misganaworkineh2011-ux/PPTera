"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

interface OrgChartRendererProps {
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

type Flat = { depth: number; name: string; item: BoxContentItem; i: number };
type TNode = Flat & { children: TNode[] };

export function OrgChartRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId = "orgchart-style-1",
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
}: OrgChartRendererProps) {
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent = accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const border = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.1)";
  const line = alpha(accent, "59");

  const Container = isPresenting ? motion.div : "div";
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const canEdit = !!onStartEditLabel && !isPresenting;

  const flat: Flat[] = items.slice(0, 12).map((item, i) => {
    const raw = item.label || "";
    const lead = raw.match(/^[\s\->]+/)?.[0] ?? "";
    const depth = (lead.match(/[\->]/g) || []).length;
    const name = raw.slice(lead.length).trim() || raw.trim();
    return { depth, name, item, i };
  });
  const buildForest = (nodes: Flat[]): TNode[] => {
    const roots: TNode[] = [];
    const stack: TNode[] = [];
    for (const n of nodes) {
      const node: TNode = { ...n, children: [] };
      while (stack.length && stack[stack.length - 1]!.depth >= node.depth) stack.pop();
      if (stack.length) stack[stack.length - 1]!.children.push(node);
      else roots.push(node);
      stack.push(node);
    }
    return roots;
  };
  const forest = buildForest(flat);
  const depthColor = (d: number) => `color-mix(in srgb, ${accent} ${100 - Math.min(d, 3) * 22}%, #0b1220 ${Math.min(d, 3) * 22}%)`;

  const editName = (node: Flat, cls: string, style?: React.CSSProperties) => {
    const editingThis = isEditing && editingText?.field === `content-label-${node.i}`;
    if (onStartEditLabel && editingThis) {
      return <EditableText value={node.item.label || ""} isEditing onStartEdit={() => {}} onChange={(v) => onUpdateLabel?.(node.i, v)} onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(node.i) : undefined} className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />;
    }
    return <span onClick={() => canEdit && onStartEditLabel?.(node.i)} className={`${cls} ${canEdit ? "cursor-text" : ""}`} style={{ color: titleColor, ...style }}>{node.name}</span>;
  };
  const editRole = (node: Flat, cls: string, style?: React.CSSProperties) =>
    node.item.text ? (
      onStartEditText ? (
        <EditableText value={node.item.text} isEditing={isEditing && editingText?.field === `content-text-${node.i}`} onStartEdit={() => onStartEditText(node.i)} onChange={(v) => onUpdateText?.(node.i, v)} onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(node.i) : undefined} className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <p className={cls} style={{ color: bodyColor, ...style }}>{node.item.text}</p>
      )
    ) : null;

  const box = (node: TNode, opts: { solid?: boolean } = {}) => (
    <CItem className="rounded-xl px-4 py-2.5 text-center" style={opts.solid ? { background: `linear-gradient(135deg, ${depthColor(node.depth)}, ${alpha(depthColor(node.depth), "cc")})`, boxShadow: `0 6px 16px -8px ${alpha(accent, "80")}` } : { background: cardBg, border: `1px solid ${border}`, borderTop: `3px solid ${depthColor(node.depth)}` }} {...itemMotion(node.i)}>
      {editName(node, "text-sm font-bold leading-tight", opts.solid ? { color: "#fff" } : undefined)}
      {editRole(node, "text-xs leading-snug", opts.solid ? { color: "rgba(255,255,255,0.85)" } : { color: node.depth === 0 ? accent : bodyColor })}
    </CItem>
  );

  const frame = `${SLIDE_FRAME} flex items-center justify-center ${className}`;

  // == STYLE-1 / 4: TOP-DOWN chart (bracket = same tree, square connectors)
  if (layoutId === "orgchart-style-1" || layoutId === "orgchart-style-4" || !layoutId) {
    const solidRoot = layoutId !== "orgchart-style-4";
    const renderTD = (node: TNode): React.ReactNode => (
      <div className="flex flex-col items-center">
        <div className="w-44 max-w-[12rem]">{box(node, { solid: solidRoot && node.depth === 0 })}</div>
        {node.children.length > 0 && (
          <>
            <div className="h-4 w-px" style={{ background: line }} />
            <div className="relative flex items-start gap-4 pt-4">
              {node.children.length > 1 && <div className="absolute left-[8%] right-[8%] top-0 h-px" style={{ background: line }} />}
              {node.children.map((c) => (
                <div key={c.i} className="relative flex flex-col items-center">
                  <div className="absolute top-0 h-4 w-px -translate-y-4" style={{ background: line }} />
                  {renderTD(c)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="flex items-start justify-center gap-8">{forest.map((r) => <div key={r.i}>{renderTD(r)}</div>)}</div>
      </Container>
    );
  }

  // == STYLE-2: INDENTED TREE — file-explorer with guide lines
  if (layoutId === "orgchart-style-2") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-1.5 px-10 ${className}`} key={animationKey} {...cProps}>
        {flat.map((node) => (
          <CItem key={node.i} className="flex items-center gap-3 min-w-0" style={{ paddingLeft: `${node.depth * 1.75}rem` }} {...itemMotion(node.i)}>
            {node.depth > 0 && <span className="text-sm" style={{ color: line }} aria-hidden>{"└"}</span>}
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: depthColor(node.depth) }} />
            <div className="min-w-0">{editName(node, `font-bold leading-tight ${node.depth === 0 ? "text-base" : "text-sm"}`)}{editRole(node, "text-xs leading-snug break-words")}</div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == STYLE-3: LEFT-TO-RIGHT — columns by level
  if (layoutId === "orgchart-style-3") {
    const maxDepth = Math.max(...flat.map((n) => n.depth), 0);
    const byDepth = Array.from({ length: maxDepth + 1 }, (_, d) => flat.filter((n) => n.depth === d));
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center gap-5 ${className}`} key={animationKey} {...cProps}>
        {byDepth.map((level, d) => (
          <React.Fragment key={d}>
            <div className="flex flex-1 flex-col justify-center gap-3">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: depthColor(d) }}>{["Lead", "Reports", "Team", "Ops"][d] ?? `Level ${d + 1}`}</div>
              {level.map((node) => (
                <CItem key={node.i} className="rounded-lg px-3.5 py-2" style={{ background: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${depthColor(d)}` }} {...itemMotion(node.i)}>
                  {editName(node, "text-sm font-bold leading-tight")}{editRole(node, "text-xs leading-snug break-words")}
                </CItem>
              ))}
            </div>
            {d < byDepth.length - 1 && <span className="shrink-0 text-xl" style={{ color: line }} aria-hidden>→</span>}
          </React.Fragment>
        ))}
      </Container>
    );
  }

  // == STYLE-5: NESTED CARDS — children nested inside the parent
  if (layoutId === "orgchart-style-5") {
    const renderNested = (node: TNode): React.ReactNode => (
      <div className="rounded-xl p-3" style={{ background: alpha(depthColor(node.depth), "0d"), border: `1px solid ${alpha(depthColor(node.depth), "33")}` }}>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: depthColor(node.depth) }} />
          <div className="min-w-0">{editName(node, "text-sm font-bold leading-tight")}{node.item.text && <span className="ml-2 text-xs" style={{ color: bodyColor }}>· {node.item.text}</span>}</div>
        </div>
        {node.children.length > 0 && <div className="ml-3 flex flex-wrap gap-2">{node.children.map((c) => <div key={c.i} className="min-w-[40%] flex-1">{renderNested(c)}</div>)}</div>}
      </div>
    );
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-3 ${className}`} key={animationKey} {...cProps}>
        {forest.map((r) => <div key={r.i}>{renderNested(r)}</div>)}
      </Container>
    );
  }

  // == STYLE-7: AVATAR TREE — indented tree with initial-avatar nodes
  if (layoutId === "orgchart-style-7") {
    const initials = (name: string) => {
      const w = name.trim().split(/\s+/).filter(Boolean);
      return ((w[0]?.[0] || "") + (w[1]?.[0] || "")).toUpperCase() || "?";
    };
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-2 px-10 ${className}`} key={animationKey} {...cProps}>
        {flat.map((node) => (
          <CItem key={node.i} className="flex items-center gap-3 min-w-0" style={{ paddingLeft: `${node.depth * 1.75}rem` }} {...itemMotion(node.i)}>
            {node.depth > 0 && <span className="text-sm" style={{ color: line }} aria-hidden>{"└"}</span>}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${depthColor(node.depth)}, ${alpha(depthColor(node.depth), "cc")})` }}>{initials(node.name)}</span>
            <div className="min-w-0">{editName(node, `font-bold leading-tight ${node.depth === 0 ? "text-base" : "text-sm"}`)}{editRole(node, "text-xs leading-snug break-words")}</div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == STYLE-8: CHIP CASCADE — nodes as connected pills cascading down-right
  if (layoutId === "orgchart-style-8") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-2 px-8 ${className}`} key={animationKey} {...cProps}>
        {flat.map((node) => (
          <CItem key={node.i} className="flex items-center" style={{ marginLeft: `${node.depth * 2.2}rem` }} {...itemMotion(node.i)}>
            {node.depth > 0 && <span className="mr-2 text-lg leading-none" style={{ color: line }} aria-hidden>↳</span>}
            <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5" style={{ background: `linear-gradient(90deg, ${alpha(depthColor(node.depth), "24")}, ${alpha(depthColor(node.depth), "0d")})`, border: `1px solid ${alpha(depthColor(node.depth), "40")}` }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: depthColor(node.depth) }} />
              <div className="min-w-0">{editName(node, "text-sm font-bold leading-tight")}{editRole(node, "text-[11px] leading-snug break-words")}</div>
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == STYLE-9: BAND LEVELS — depth grouped into labelled horizontal bands
  if (layoutId === "orgchart-style-9") {
    const maxDepth = Math.max(...flat.map((n) => n.depth), 0);
    const byDepth = Array.from({ length: maxDepth + 1 }, (_, d) => flat.filter((n) => n.depth === d));
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-2.5 ${className}`} key={animationKey} {...cProps}>
        {byDepth.map((level, d) => (
          <div key={d} className="rounded-xl p-3" style={{ background: alpha(depthColor(d), "0d"), border: `1px solid ${alpha(depthColor(d), "1f")}` }}>
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: depthColor(d) }}>{["Leadership", "Directors", "Managers", "Team"][d] ?? `Level ${d + 1}`}</div>
            <div className="flex flex-wrap gap-2">
              {level.map((node) => (
                <CItem key={node.i} className="rounded-lg px-3.5 py-1.5" style={{ background: cardBg, border: `1px solid ${border}` }} {...itemMotion(node.i)}>
                  {editName(node, "text-sm font-bold leading-tight")}{editRole(node, "text-[11px] leading-snug break-words")}
                </CItem>
              ))}
            </div>
          </div>
        ))}
      </Container>
    );
  }

  // == STYLE-6: REPORTING RAIL — vertical rail with tiered badges
  return (
    <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-1 px-10 ${className}`} key={animationKey} {...cProps}>
      <div className="relative flex flex-col gap-2">
        <div className="absolute bottom-3 top-3 w-0.5" style={{ left: 15, background: alpha(accent, "26") }} aria-hidden />
        {flat.map((node) => (
          <CItem key={node.i} className="relative flex items-center gap-4 min-w-0" style={{ paddingLeft: `${node.depth * 1.5}rem` }} {...itemMotion(node.i)}>
            <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white" style={{ background: depthColor(node.depth), boxShadow: `0 0 0 4px ${theme?.colors.background || cardBg}` }}>{node.depth === 0 ? "★" : node.depth}</span>
            <div className="min-w-0 flex-1 rounded-lg px-4 py-2" style={{ background: cardBg, border: `1px solid ${border}` }}>
              {editName(node, "text-sm font-bold leading-tight")}{editRole(node, "text-xs leading-snug break-words")}
            </div>
          </CItem>
        ))}
      </div>
    </Container>
  );
}

export default OrgChartRenderer;
