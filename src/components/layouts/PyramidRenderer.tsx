"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { isHex, alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (entrance, gated on isPresenting)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const tierVariants = {
  hidden: {
    opacity: 0,
    y: -16,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface PyramidRendererProps {
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

// Progressive widths for tiers 1..5 (top narrowest -> base widest)
const TIER_WIDTHS = ["46%", "60%", "74%", "88%", "100%"];

export function PyramidRenderer({
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
}: PyramidRendererProps) {
  // Cap at 5 tiers; top = first item = most important
  const displayItems = items.slice(0, 5);
  const tierCount = displayItems.length;

  // Defensive color fallbacks
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor ||
    theme?.colors.accent ||
    theme?.colors.primary ||
    "#6366f1";

  // Fill opacity ramps from full at the top down toward the base for contrast.
  const getTierOpacity = (index: number): number => {
    if (tierCount <= 1) return 1;
    const minOpacity = 0.55;
    const step = (1 - minOpacity) / (tierCount - 1);
    return 1 - step * index;
  };

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
        initial: "hidden",
        animate: "visible",
      }
    : {};

  // ---- Shared bits for the added styles (2-10) ----
  const pad2 = (k: number) => String(k).padStart(2, "0");
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const shade = (i: number) => `color-mix(in srgb, ${accent} ${100 - (tierCount > 1 ? (i / (tierCount - 1)) * 45 : 0)}%, #0b1220 ${tierCount > 1 ? (i / (tierCount - 1)) * 45 : 0}%)`;

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

  // Apex-first label/text: main line inside the tier (label or text fallback)
  const tierMain = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    item.label ? editLabel(item, index, cls, style) : editText(item, index, cls, style);

  // == PYRAMID-STYLE-2: TRIANGLE SPLIT — a solid triangle sliced into bands
  if (layoutId === "pyramid-style-2") {
    return (
      <Container className={`w-full h-full flex items-center justify-center gap-8 px-8 ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-[46%] max-w-sm self-stretch" style={{ minHeight: "16rem" }}>
          <div className="absolute inset-0 flex flex-col" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}>
            {displayItems.map((item, index) => (
              <CItem key={index} className="flex flex-1 items-center justify-center px-4 text-center" style={{ background: shade(index), borderTop: index ? "1px solid rgba(255,255,255,0.25)" : "none", ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                <span className="text-xs font-bold text-white" style={{ paddingTop: index === 0 ? "1.5rem" : 0 }}>{index + 1}</span>
              </CItem>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2">
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex items-baseline gap-2.5 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span className="text-sm font-extrabold tabular-nums" style={{ color: shade(index) }}>{pad2(index + 1)}</span>
              <div className="min-w-0">{editLabel(item, index, "text-sm font-bold leading-tight")}{editText(item, index, "text-xs leading-snug break-words", { display: item.label ? undefined : "block" })}</div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == PYRAMID-STYLE-3: INVERTED FUNNEL — widest at the top, narrowing down
  if (layoutId === "pyramid-style-3") {
    const widths = ["100%", "88%", "74%", "60%", "46%"];
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center gap-1.5 px-8 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => (
          <CItem key={index} className="flex items-center justify-center rounded-lg px-6" style={{ width: widths[index] ?? "46%", minHeight: "2.75rem", paddingTop: "0.6rem", paddingBottom: "0.6rem", background: shade(index), clipPath: "polygon(0 0, 100% 0, 93% 100%, 7% 100%)", ...getSpotlightStyle(index) }} {...itemMotion(index)}>
            {tierMain(item, index, "text-center text-xs font-bold leading-tight break-words", { color: "#ffffff" })}
          </CItem>
        ))}
      </Container>
    );
  }

  // == PYRAMID-STYLE-4: LAYER CAKE — stacked slabs with side captions
  if (layoutId === "pyramid-style-4") {
    const widths = ["58%", "70%", "82%", "94%", "100%"];
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center gap-2 px-8 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => (
          <CItem key={index} className="flex items-center gap-4" style={{ width: widths[index] ?? "100%", ...getSpotlightStyle(index) }} {...itemMotion(index)}>
            <div className="flex flex-1 items-center rounded-lg px-5 py-2.5" style={{ background: shade(index), borderBottom: `4px solid ${alpha("#000000", "33")}`, boxShadow: "0 3px 8px rgba(0,0,0,0.18)" }}>
              <span className="mr-3 text-base font-extrabold tabular-nums text-white opacity-80">{index + 1}</span>
              {tierMain(item, index, "text-sm font-bold leading-tight text-white break-words")}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == PYRAMID-STYLE-5: NUMBERED STEPS UP — ascending bars with number badges
  if (layoutId === "pyramid-style-5") {
    const rows = [...displayItems].reverse(); // base(widest) at bottom -> render bottom-up
    return (
      <Container className={`w-full h-full flex flex-col justify-end gap-2 px-10 py-6 ${className}`} key={animationKey} {...cProps}>
        {rows.map((item, r) => {
          const index = displayItems.length - 1 - r;
          const width = `${52 + ((displayItems.length - 1 - index) * 48) / Math.max(displayItems.length - 1, 1)}%`;
          return (
            <CItem key={index} className="flex items-center gap-3 self-center rounded-xl px-4 py-2.5" style={{ width, background: `linear-gradient(90deg, ${shade(index)}, ${alpha(shade(index), "cc")})`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/25 text-xs font-extrabold text-white">{index + 1}</span>
              {tierMain(item, index, "text-sm font-bold leading-tight text-white break-words")}
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == PYRAMID-STYLE-6: MASLOW BANDS — full-width tiers, label inside, caption right
  if (layoutId === "pyramid-style-6") {
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-1 px-10 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => (
          <CItem key={index} className="flex items-stretch overflow-hidden rounded-md" style={{ ...getSpotlightStyle(index) }} {...itemMotion(index)}>
            <div className="flex w-2/5 items-center px-5 py-3" style={{ background: shade(index) }}>
              <span className="mr-2.5 text-sm font-extrabold tabular-nums text-white opacity-80">{pad2(index + 1)}</span>
              {tierMain(item, index, "text-sm font-bold leading-tight text-white break-words")}
            </div>
            <div className="flex flex-1 items-center px-4 py-3" style={{ background: alpha(accent, "0d") }}>
              {item.label && editText(item, index, "text-xs leading-snug break-words")}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == PYRAMID-STYLE-7: NESTED CHEVRONS — up-pointing chevron tiers
  if (layoutId === "pyramid-style-7") {
    const widths = ["46%", "62%", "78%", "94%", "100%"];
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center px-8 ${className}`} key={animationKey} {...cProps}>
        <div className="flex w-full max-w-lg flex-col items-center" style={{ gap: 3 }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex items-center justify-center px-4 pt-3 pb-1.5 text-center" style={{ width: widths[index] ?? "100%", marginBottom: index === displayItems.length - 1 ? 0 : -6, background: shade(index), clipPath: "polygon(0 30%, 50% 0, 100% 30%, 100% 100%, 0 100%)", ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              {tierMain(item, index, "text-xs font-bold leading-tight text-white break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == PYRAMID-STYLE-8: APEX CALLOUTS — outline triangle with numbered captions
  if (layoutId === "pyramid-style-8") {
    return (
      <Container className={`w-full h-full flex items-center justify-center gap-6 px-8 ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-[42%] max-w-xs self-stretch" style={{ minHeight: "15rem" }}>
          <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)", background: `linear-gradient(160deg, ${alpha(accent, "2e")}, ${alpha(accent, "12")})`, border: `1.5px solid ${alpha(accent, "4d")}` }} />
          <div className="absolute inset-0 flex flex-col">
            {displayItems.map((_, index) => (
              <div key={index} className="flex flex-1 items-center justify-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ background: shade(index), marginTop: index === 0 ? "1.2rem" : 0 }}>{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2.5">
          {displayItems.map((item, index) => (
            <CItem key={index} className="border-l-2 pl-3 min-w-0" style={{ borderColor: shade(index), ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              {editLabel(item, index, "text-sm font-bold leading-tight")}
              {editText(item, index, "text-xs leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == PYRAMID-STYLE-9: PRISM — gradient triangle with dividers, captions right
  if (layoutId === "pyramid-style-9") {
    return (
      <Container className={`w-full h-full flex items-center justify-center gap-7 px-8 ${className}`} key={animationKey} {...cProps}>
        <div className="relative w-[40%] max-w-xs self-stretch" style={{ minHeight: "15rem" }}>
          <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)", background: `linear-gradient(180deg, ${accent}, ${alpha(accent, "80")})` }} />
          <div className="absolute inset-0 flex flex-col">
            {displayItems.map((_, index) => (
              <div key={index} className="flex-1" style={{ borderTop: index ? "1.5px solid rgba(255,255,255,0.35)" : "none" }} />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2.5">
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex items-start gap-2.5 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: shade(index) }} />
              <div className="min-w-0">{editLabel(item, index, "text-sm font-bold leading-tight")}{editText(item, index, "text-xs leading-snug break-words")}</div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == PYRAMID-STYLE-10: ASCENDING ROWS — chromeless rows growing toward the base
  if (layoutId === "pyramid-style-10") {
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-1 px-12 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => {
          const t = tierCount > 1 ? index / (tierCount - 1) : 0;
          return (
            <CItem key={index} className="flex items-center gap-4 border-b py-2.5" style={{ borderColor: alpha(accent, "1a"), ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <span className="shrink-0 font-extrabold tabular-nums leading-none" style={{ fontSize: `${1 + t * 0.7}rem`, color: shade(index), width: "2.5rem" }}>{pad2(index + 1)}</span>
              <div className="min-w-0 flex-1" style={{ paddingLeft: `${t * 1.5}rem` }}>
                {editLabel(item, index, "font-bold leading-tight", { fontSize: `${0.9 + t * 0.35}rem` })}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </CItem>
          );
        })}
      </Container>
    );
  }

  return (
    <Container
      className={`w-full h-full flex flex-col items-center justify-center px-8 py-6 ${className}`}
      key={animationKey} {...containerProps}
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-1.5">
        {displayItems.map((item, index) => {
          const width = TIER_WIDTHS[index] ?? "100%";
          const fillOpacity = getTierOpacity(index);
          // Fade only the FILL (hex-alpha), not the whole tier — keeps the
          // white label crisp on lower tiers instead of washing out with it.
          const fadeViaAlpha = isHex(accent);
          const tierBg = fadeViaAlpha
            ? `${accent}${Math.round(fillOpacity * 255)
                .toString(16)
                .padStart(2, "0")}`
            : accent;

          const TierWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: tierVariants } : {};

          return (
            <TierWrapper
              key={index}
              className="flex w-full items-center justify-center"
              style={getSpotlightStyle(index)}
              {...variantsProps}
            >
              {/* Tier band (trapezoid via clip-path) */}
              <div
                className="relative flex items-center justify-center rounded-lg px-6"
                style={{
                  width,
                  minHeight: "2.75rem",
                  maxHeight: "4.5rem",
                  height: "auto",
                  paddingTop: "0.6rem",
                  paddingBottom: "0.6rem",
                  backgroundColor: tierBg,
                  // Non-hex accents can't take a hex alpha — fall back to
                  // fading the whole tier as before.
                  opacity: fadeViaAlpha ? 1 : fillOpacity,
                  clipPath:
                    "polygon(7% 0%, 93% 0%, 100% 100%, 0% 100%)",
                }}
              >
                {/* Label inside the tier (high-contrast, bold, centered) */}
                {item.label ? (
                  onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={
                        isEditing &&
                        editingText?.field === `content-label-${index}`
                      }
                      onStartEdit={() => onStartEditLabel(index)}
                      onChange={(val) => onUpdateLabel?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={
                        onDeleteItem ? () => onDeleteItem(index) : undefined
                      }
                      className="text-center text-xs font-bold leading-tight break-words"
                      style={{ color: "#ffffff" }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="text-center text-xs font-bold leading-tight break-words"
                      style={{ color: "#ffffff" }}
                    >
                      {item.label}
                    </h3>
                  )
                ) : (
                  // Fall back to text inside the tier when no label is present
                  onStartEditText ? (
                    <EditableText
                      value={item.text}
                      isEditing={
                        isEditing &&
                        editingText?.field === `content-text-${index}`
                      }
                      onStartEdit={() => onStartEditText(index)}
                      onChange={(val) => onUpdateText?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={
                        onDeleteItem ? () => onDeleteItem(index) : undefined
                      }
                      className="text-center text-xs font-bold leading-tight break-words"
                      style={{ color: "#ffffff" }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="text-center text-xs font-bold leading-tight break-words"
                      style={{ color: "#ffffff" }}
                    >
                      {item.text}
                    </h3>
                  )
                )}
              </div>
            </TierWrapper>
          );
        })}
      </div>

      {/* Captions beneath the pyramid (short supporting text per tier) */}
      {displayItems.some((item) => item.label && item.text) && (
        <div className="mt-4 flex w-full max-w-3xl flex-col items-center gap-1">
          {displayItems.map((item, index) => {
            // Only show a caption when there's a distinct label + text pair.
            if (!item.label || !item.text) return null;

            const CaptionWrapper = isPresenting ? motion.div : "div";
            const variantsProps = isPresenting
              ? { variants: tierVariants }
              : {};

            return (
              <CaptionWrapper
                key={index}
                className="flex w-full items-baseline justify-center gap-2"
                style={getSpotlightStyle(index)}
                {...variantsProps}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: titleColor }}
                >
                  {item.label}
                </span>
                {onStartEditText ? (
                  <EditableText
                    value={item.text}
                    isEditing={
                      isEditing &&
                      editingText?.field === `content-text-${index}`
                    }
                    onStartEdit={() => onStartEditText(index)}
                    onChange={(val) => onUpdateText?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={
                      onDeleteItem ? () => onDeleteItem(index) : undefined
                    }
                    className="text-center text-sm leading-snug"
                    style={{ color: bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-center text-sm leading-snug"
                    style={{ color: bodyColor }}
                  >
                    {item.text}
                  </p>
                )}
              </CaptionWrapper>
            );
          })}
        </div>
      )}
    </Container>
  );
}
