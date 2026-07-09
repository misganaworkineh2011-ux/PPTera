"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { tileStyle, SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (subtle editorial entrance, only used when presenting)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const leadVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface FeatureShowcaseRendererProps {
  items: BoxContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  isPresenting?: boolean;
  animationKey?: string;
  itemAnimation?: string;
  revealCount?: number;
  // Editing props
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

export function FeatureShowcaseRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId,
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
}: FeatureShowcaseRendererProps) {
  // Defensive color resolution
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor ||
    theme?.colors.accent ||
    theme?.colors.primary ||
    "#6366f1";

  const allItems = items ?? [];
  const lead = allItems[0];
  // Right column: remaining items, capped at 5
  const supportingItems = allItems.slice(1, 6);
  const hasSupporting = supportingItems.length > 0;

  // Dim non-highlighted supporting items in spotlight mode
  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: "all 0.4s ease-out",
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting
    ? {
        variants: containerVariants,
        initial: "hidden" as const,
        animate: "visible" as const,
      }
    : {};

  const LeadWrapper = isPresenting ? motion.div : "div";
  const leadProps = isPresenting ? { variants: leadVariants } : {};

  // Lead editorial block (used in both single-item and split layouts)
  const renderLead = (centered: boolean) => {
    if (!lead) return null;
    return (
      <LeadWrapper
        className={`flex flex-col ${centered ? "items-center text-center max-w-2xl mx-auto" : "items-start text-left"}`}
        {...leadProps}
      >
        {/* Big editorial lead heading from the first item's label */}
        {lead.label &&
          (onStartEditLabel ? (
            <EditableText
              value={lead.label}
              isEditing={
                isEditing && editingText?.field === `content-label-0`
              }
              onStartEdit={() => onStartEditLabel(0)}
              onChange={(val) => onUpdateLabel?.(0, val)}
              onFinish={onFinishEditing || (() => {})}
              onDelete={onDeleteItem ? () => onDeleteItem(0) : undefined}
              className="font-bold text-2xl sm:text-3xl leading-tight"
              style={{ color: titleColor }}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <h2
              className="font-bold text-2xl sm:text-3xl leading-tight"
              style={{ color: titleColor }}
            >
              {lead.label}
            </h2>
          ))}

        {/* Short accent underline bar beneath the lead heading (gradient) */}
        <div
          className="mt-3 h-1 w-16 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "33")})`,
          }}
        />

        {/* Supporting paragraph from the first item's text */}
        {onStartEditText ? (
          <EditableText
            value={lead.text}
            isEditing={isEditing && editingText?.field === `content-text-0`}
            onStartEdit={() => onStartEditText(0)}
            onChange={(val) => onUpdateText?.(0, val)}
            onFinish={onFinishEditing || (() => {})}
            onDelete={onDeleteItem ? () => onDeleteItem(0) : undefined}
            className="mt-4 text-base leading-relaxed max-w-prose"
            style={{ color: bodyColor }}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <p
            className="mt-4 text-base leading-relaxed max-w-prose"
            style={{ color: bodyColor }}
          >
            {lead.text}
          </p>
        )}
      </LeadWrapper>
    );
  };

  // ---- Shared bits for the added styles (2-6) ----
  const cardBg = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const cardBorder = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const feat = supportingItems;

  const editLabel = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${index}`}
          onStartEdit={() => onStartEditLabel(index)} onChange={(val) => onUpdateLabel?.(index, val)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
          className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  const editText = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)} onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );

  // == SHOWCASE-STYLE-2: SPOTLIGHT PANEL — accent gradient lead + feature list
  if (layoutId === "showcase-style-2" && lead) {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid w-full grid-cols-5 items-stretch gap-6">
          <div className="col-span-2 flex flex-col justify-center rounded-2xl p-6" style={{ background: `linear-gradient(150deg, ${accent}, ${alpha(accent, "b3")})`, boxShadow: `0 10px 30px -12px ${alpha(accent, "80")}` }}>
            <span className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.82)" }}>Overview</span>
            {editLabel(lead, 0, "text-2xl font-bold leading-tight", { color: "#ffffff" })}
            <div className="mt-3 h-1 w-14 rounded-full" style={{ background: "rgba(255,255,255,0.55)" }} />
            {editText(lead, 0, "mt-3 text-sm leading-relaxed", { color: "rgba(255,255,255,0.9)" })}
          </div>
          <div className="col-span-3 flex flex-col justify-center gap-4 pl-2">
            {feat.map((item, i) => {
              const ri = i + 1;
              return (
                <CItem key={ri} className={`flex items-start gap-3 ${i > 0 ? "border-t pt-4" : ""}`} style={{ ...(i > 0 ? { borderColor: alpha(bodyColor, "1f") } : {}), ...getSpotlightStyle(ri) }} {...itemMotion(ri)}>
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.72rem] font-extrabold tabular-nums" style={{ background: alpha(accent, "1a"), border: `1px solid ${alpha(accent, "3d")}`, color: accent }}>{pad2(ri)}</div>
                  <div className="min-w-0 flex-1">{editLabel(item, ri, "text-sm font-bold leading-snug")}{editText(item, ri, "mt-0.5 text-sm leading-relaxed")}</div>
                </CItem>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // == SHOWCASE-STYLE-3: HEADLINE BAND — lead headline on top + feature grid
  if (layoutId === "showcase-style-3" && lead) {
    const cols = feat.length <= 2 ? feat.length || 1 : feat.length <= 4 ? 2 : 3;
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-6 ${className}`} key={animationKey} {...cProps}>
        <div className="border-l-4 pl-4" style={{ borderColor: accent }}>
          {editLabel(lead, 0, "text-2xl sm:text-3xl font-bold leading-tight")}
          {editText(lead, 0, "mt-2 text-base leading-relaxed max-w-3xl")}
        </div>
        <div className="grid gap-x-8 gap-y-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {feat.map((item, i) => {
            const ri = i + 1;
            return (
              <CItem key={ri} className="min-w-0" style={getSpotlightStyle(ri)} {...itemMotion(ri)}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-lg font-extrabold tabular-nums" style={{ color: accent }}>{pad2(ri)}</span>
                  <span className="h-px flex-1" style={{ background: alpha(accent, "33") }} />
                </div>
                {editLabel(item, ri, "text-sm font-bold leading-snug")}
                {editText(item, ri, "mt-0.5 text-sm leading-relaxed")}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == SHOWCASE-STYLE-4: FEATURE CARDS — lead text left + mini-cards stacked right
  if (layoutId === "showcase-style-4" && lead) {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid w-full grid-cols-2 items-center gap-10">
          <div>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>Feature Set</span>
            {editLabel(lead, 0, "text-2xl sm:text-3xl font-bold leading-tight")}
            <div className="mt-3 h-1 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "33")})` }} />
            {editText(lead, 0, "mt-4 text-base leading-relaxed")}
          </div>
          <div className="flex flex-col gap-3">
            {feat.map((item, i) => {
              const ri = i + 1;
              return (
                <CItem key={ri} className="ppt-tile flex items-start gap-3 rounded-xl p-3.5" style={{ ...tileStyle(cardBg, cardBorder, accent, { bar: "left" }), ...getSpotlightStyle(ri) }} {...itemMotion(ri)}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-extrabold tabular-nums" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})` }}>{item.icon || ri}</div>
                  <div className="min-w-0 flex-1">{editLabel(item, ri, "text-sm font-bold leading-snug")}{editText(item, ri, "mt-0.5 text-xs leading-relaxed")}</div>
                </CItem>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // == SHOWCASE-STYLE-5: EDITORIAL RAIL — vertical accent rail + flowing features
  if (layoutId === "showcase-style-5" && lead) {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center gap-6 ${className}`} key={animationKey} {...cProps}>
        <div className="flex shrink-0 flex-col items-center self-stretch">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accent, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Showcase</span>
          <div className="mt-3 w-1 flex-1 rounded-full" style={{ background: `linear-gradient(${accent}, ${alpha(accent, "1a")})` }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-5">
            {editLabel(lead, 0, "text-2xl sm:text-3xl font-bold leading-tight")}
            {editText(lead, 0, "mt-2 text-base leading-relaxed max-w-2xl")}
          </div>
          <div className="grid gap-x-8 gap-y-4" style={{ gridTemplateColumns: `repeat(${feat.length <= 3 ? 1 : 2}, minmax(0, 1fr))` }}>
            {feat.map((item, i) => {
              const ri = i + 1;
              return (
                <CItem key={ri} className="flex items-baseline gap-3 min-w-0" style={getSpotlightStyle(ri)} {...itemMotion(ri)}>
                  <span className="shrink-0 font-mono text-xs font-bold tabular-nums" style={{ color: accent }}>{pad2(ri)}</span>
                  <div className="min-w-0">{editLabel(item, ri, "text-sm font-bold leading-snug inline")}{editText(item, ri, "mt-0.5 text-sm leading-relaxed")}</div>
                </CItem>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // == SHOWCASE-STYLE-6: QUOTE LEAD — oversized pull-quote + feature chips
  if (layoutId === "showcase-style-6" && lead) {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-6 ${className}`} key={animationKey} {...cProps}>
        <div className="relative pl-10">
          <span className="absolute left-0 top-0 select-none font-serif leading-none" style={{ fontSize: "4.5rem", color: alpha(accent, "2e"), lineHeight: 0.8 }} aria-hidden>“</span>
          {editLabel(lead, 0, "text-2xl sm:text-3xl font-bold leading-snug max-w-4xl")}
          {editText(lead, 0, "mt-3 text-base leading-relaxed max-w-3xl")}
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(feat.length || 1, 3)}, minmax(0, 1fr))` }}>
          {feat.map((item, i) => {
            const ri = i + 1;
            return (
              <CItem key={ri} className="rounded-xl p-3.5" style={{ background: `linear-gradient(150deg, ${alpha(accent, "1a")}, ${alpha(accent, "08")})`, border: `1px solid ${alpha(accent, "2e")}`, ...getSpotlightStyle(ri) }} {...itemMotion(ri)}>
                <span className="mb-1 block text-sm font-extrabold tabular-nums" style={{ color: accent }}>{pad2(ri)}</span>
                {editLabel(item, ri, "text-sm font-bold leading-snug")}
                {editText(item, ri, "mt-0.5 text-xs leading-relaxed")}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={`${SLIDE_FRAME} flex items-center ${className}`}
      key={animationKey} {...containerProps}
    >
      {hasSupporting ? (
        // Two-column magazine split: editorial lead | feature list
        <div className="grid w-full grid-cols-2 items-center gap-8 sm:gap-12">
          {/* LEFT: editorial lead */}
          <div>{renderLead(false)}</div>

          {/* RIGHT: clean vertical list of feature points */}
          <div className="flex flex-col gap-5">
            {supportingItems.map((item, i) => {
              // Real index in the original items array (lead is index 0)
              const realIndex = i + 1;
              const ItemWrapper = isPresenting ? motion.div : "div";
              const variantsProps = isPresenting
                ? { variants: itemVariants }
                : {};

              return (
                <ItemWrapper
                  key={realIndex}
                  className={`flex items-start gap-3 ${
                    i > 0 ? "border-t pt-5" : ""
                  }`}
                  style={{
                    ...(i > 0
                      ? { borderColor: `${bodyColor}1f` }
                      : {}),
                    ...getSpotlightStyle(realIndex),
                  }}
                  {...variantsProps}
                >
                  {/* Accent number chip marker (gradient squircle + hairline) */}
                  <div
                    className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center text-[0.72rem] font-extrabold tabular-nums"
                    style={{
                      borderRadius: 9,
                      background: `linear-gradient(135deg, ${alpha(accent, "26")}, ${alpha(accent, "0d")})`,
                      border: `1px solid ${alpha(accent, "3d")}`,
                      color: accent,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {String(realIndex).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Feature label */}
                    {item.label &&
                      (onStartEditLabel ? (
                        <EditableText
                          value={item.label}
                          isEditing={
                            isEditing &&
                            editingText?.field ===
                              `content-label-${realIndex}`
                          }
                          onStartEdit={() => onStartEditLabel(realIndex)}
                          onChange={(val) =>
                            onUpdateLabel?.(realIndex, val)
                          }
                          onFinish={onFinishEditing || (() => {})}
                          onDelete={
                            onDeleteItem
                              ? () => onDeleteItem(realIndex)
                              : undefined
                          }
                          className="font-bold text-sm sm:text-base leading-snug"
                          style={{ color: titleColor }}
                          isOwner={isOwner}
                          isHovered={isHovered}
                        />
                      ) : (
                        <h3
                          className="font-bold text-sm sm:text-base leading-snug"
                          style={{ color: titleColor }}
                        >
                          {item.label}
                        </h3>
                      ))}

                    {/* Feature text */}
                    {onStartEditText ? (
                      <EditableText
                        value={item.text}
                        isEditing={
                          isEditing &&
                          editingText?.field ===
                            `content-text-${realIndex}`
                        }
                        onStartEdit={() => onStartEditText(realIndex)}
                        onChange={(val) => onUpdateText?.(realIndex, val)}
                        onFinish={onFinishEditing || (() => {})}
                        onDelete={
                          onDeleteItem
                            ? () => onDeleteItem(realIndex)
                            : undefined
                        }
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: bodyColor }}
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <p
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: bodyColor }}
                      >
                        {item.text}
                      </p>
                    )}
                  </div>
                </ItemWrapper>
              );
            })}
          </div>
        </div>
      ) : (
        // Single item: just the centered big lead, no right column
        <div className="w-full">{renderLead(true)}</div>
      )}
    </Container>
  );
}
