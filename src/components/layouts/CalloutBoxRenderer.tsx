"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { SLIDE_FRAME } from "./tile";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants
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

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface CalloutBoxRendererProps {
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

export function CalloutBoxRenderer({
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
}: CalloutBoxRendererProps) {
  // Defensive colors
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor ||
    theme?.colors.accent ||
    theme?.colors.primary ||
    "#6366f1";

  // Cap at 3 callout blocks
  const displayItems = items.slice(0, 3);
  const isHero = displayItems.length === 1;

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
  const surface = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const cardBorder = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

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

  const hero0 = displayItems[0];

  // == CALLOUT-STYLE-2: ALERT BANNER — bold colored banner with an icon badge
  if (layoutId === "callout-style-2") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-3.5 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => (
          <CItem key={index} className="flex items-stretch overflow-hidden rounded-2xl" style={{ background: `linear-gradient(120deg, ${alpha(accent, "24")}, ${alpha(accent, "0d")})`, border: `1px solid ${alpha(accent, "3d")}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
            <div className="flex w-14 shrink-0 items-center justify-center text-2xl text-white" style={{ background: `linear-gradient(160deg, ${accent}, ${alpha(accent, "cc")})` }}>{item.icon || "!"}</div>
            <div className="min-w-0 flex-1 px-5 py-4">
              {editLabel(item, index, "font-bold text-base leading-tight mb-1")}
              {editText(item, index, "text-sm leading-relaxed")}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == CALLOUT-STYLE-3: STICKY NOTES — softly rotated note cards
  if (layoutId === "callout-style-3") {
    const rot = ["-1.4deg", "1.1deg", "-0.8deg"];
    return (
      <Container className={`${SLIDE_FRAME} flex flex-wrap items-center justify-center gap-6 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => (
          <CItem key={index} className="relative w-full max-w-xs px-5 py-5 pt-7" style={{ background: `linear-gradient(160deg, ${alpha(accent, "26")}, ${alpha(accent, "12")})`, borderRadius: 6, transform: `rotate(${rot[index % 3]})`, boxShadow: "0 10px 22px -10px rgba(0,0,0,0.35)", ...getSpotlightStyle(index) }} {...itemMotion(index)}>
            <span aria-hidden className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rounded-sm" style={{ background: alpha(accent, "59"), boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            {editLabel(item, index, "font-bold text-base leading-tight mb-1")}
            {editText(item, index, "text-sm leading-relaxed")}
          </CItem>
        ))}
      </Container>
    );
  }

  // == CALLOUT-STYLE-4: ADMONITION — outlined card with an accent header label
  if (layoutId === "callout-style-4") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-4 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => (
          <CItem key={index} className="overflow-hidden rounded-xl" style={{ background: surface, border: `1px solid ${alpha(accent, "40")}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
            <div className="flex items-center gap-2 px-4 py-2" style={{ background: alpha(accent, "1a"), borderBottom: `1px solid ${alpha(accent, "2e")}` }}>
              <span className="text-sm">{item.icon || "◆"}</span>
              {item.label
                ? editLabel(item, index, "text-xs font-bold uppercase tracking-[0.18em]", { color: accent })
                : <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>Note</span>}
            </div>
            <div className="px-4 py-3.5">{editText(item, index, "text-sm leading-relaxed")}</div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == CALLOUT-STYLE-5: ICON SPOTLIGHT — a big centered icon above a statement
  if (layoutId === "callout-style-5" && hero0) {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col items-center justify-center text-center ${className}`} key={animationKey} {...cProps}>
        <CItem className="flex max-w-2xl flex-col items-center" style={getSpotlightStyle(0)} {...itemMotion(0)}>
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl text-white" style={{ background: `linear-gradient(150deg, ${accent}, ${alpha(accent, "b3")})`, boxShadow: `0 12px 30px -10px ${alpha(accent, "80")}` }}>{hero0.icon || "★"}</div>
          {editLabel(hero0, 0, "text-2xl font-bold leading-tight mb-2")}
          {editText(hero0, 0, "text-base leading-relaxed")}
        </CItem>
      </Container>
    );
  }

  // == CALLOUT-STYLE-6: PULL CALLOUT — thick left accent bar with large text
  if (layoutId === "callout-style-6" && hero0) {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <CItem className="pl-6" style={{ borderLeft: `6px solid ${accent}`, ...getSpotlightStyle(0) }} {...itemMotion(0)}>
          {editLabel(hero0, 0, "mb-2 text-xs font-bold uppercase tracking-[0.22em]", { color: accent })}
          {editText(hero0, 0, "text-2xl sm:text-3xl font-bold leading-snug max-w-3xl", { color: titleColor })}
        </CItem>
      </Container>
    );
  }

  // == CALLOUT-STYLE-7: GRADIENT PANEL — a full accent-gradient panel, white text
  if (layoutId === "callout-style-7" && hero0) {
    return (
      <Container className={`${SLIDE_FRAME} flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <CItem className="relative w-full overflow-hidden rounded-3xl p-8 sm:p-10 text-center" style={{ background: `linear-gradient(140deg, ${accent}, ${alpha(accent, "b3")})`, boxShadow: `0 18px 44px -16px ${alpha(accent, "99")}`, ...getSpotlightStyle(0) }} {...itemMotion(0)}>
          {hero0.icon && <div className="mb-3 text-3xl">{hero0.icon}</div>}
          {editLabel(hero0, 0, "text-xl font-bold leading-tight mb-2", { color: "#ffffff" })}
          {editText(hero0, 0, "text-lg leading-relaxed mx-auto max-w-2xl", { color: "rgba(255,255,255,0.92)" })}
        </CItem>
      </Container>
    );
  }

  // == CALLOUT-STYLE-8: DOUBLE RULE — statement framed by accent rules
  if (layoutId === "callout-style-8" && hero0) {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col items-center justify-center text-center ${className}`} key={animationKey} {...cProps}>
        <CItem className="max-w-3xl py-6" style={{ borderTop: `2px solid ${accent}`, borderBottom: `2px solid ${accent}`, ...getSpotlightStyle(0) }} {...itemMotion(0)}>
          {hero0.label && editLabel(hero0, 0, "mb-3 text-xs font-bold uppercase tracking-[0.24em]", { color: accent })}
          {editText(hero0, 0, "text-2xl sm:text-3xl font-bold leading-snug", { color: titleColor })}
        </CItem>
      </Container>
    );
  }

  // == CALLOUT-STYLE-9: TAB LABEL — a folder-tab accent label on top of the card
  if (layoutId === "callout-style-9") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-5 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => (
          <CItem key={index} className="relative" style={getSpotlightStyle(index)} {...itemMotion(index)}>
            <div className="inline-flex items-center gap-1.5 rounded-t-lg px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white" style={{ background: accent }}>
              <span>{item.icon || "▸"}</span>
              {item.label ? editLabel(item, index, "text-xs font-bold uppercase tracking-[0.16em]", { color: "#fff" }) : <span>Key Takeaway</span>}
            </div>
            <div className="rounded-b-xl rounded-tr-xl p-5" style={{ background: surface, border: `1px solid ${cardBorder}`, borderTop: `2px solid ${accent}` }}>
              {editText(item, index, "text-sm leading-relaxed")}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == CALLOUT-STYLE-10: CORNER FOLD — a card with a folded dog-ear corner
  if (layoutId === "callout-style-10") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-4 ${className}`} key={animationKey} {...cProps}>
        {displayItems.map((item, index) => (
          <CItem key={index} className="relative overflow-hidden rounded-2xl p-5 pr-10" style={{ background: `linear-gradient(150deg, ${alpha(accent, "1a")}, ${alpha(accent, "08")})`, border: `1px solid ${alpha(accent, "33")}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
            <span aria-hidden className="absolute right-0 top-0" style={{ width: 30, height: 30, background: accent, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
            <span aria-hidden className="absolute right-0 top-0" style={{ width: 30, height: 30, background: alpha("#000000", "26"), clipPath: "polygon(0 0, 0 100%, 100% 100%)" }} />
            <div className="flex items-start gap-3">
              {item.icon && <span className="text-xl" style={{ color: accent }}>{item.icon}</span>}
              <div className="min-w-0 flex-1">
                {editLabel(item, index, "font-bold text-base leading-tight mb-1")}
                {editText(item, index, "text-sm leading-relaxed")}
              </div>
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col items-center justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div
        className={`flex flex-col w-full ${
          isHero ? "items-center" : "items-stretch"
        } gap-4`}
      >
        {displayItems.map((item, index) => {
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          return (
            <ItemWrapper
              key={index}
              className={`ppt-tile relative w-full ${
                isHero ? "max-w-2xl" : ""
              } overflow-hidden rounded-2xl`}
              style={{
                background: `linear-gradient(150deg, ${accent}1f 0%, ${accent}0a 100%)`,
                border: `1px solid ${accent}29`,
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
              {/* Inner left accent bar (kept separate so the card can stay rounded) */}
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{ width: "4px", backgroundColor: accent }}
              />

              <div
                className={`flex items-start gap-4 ${
                  isHero ? "p-6" : "p-5"
                } pl-6`}
              >
                {/* Accent icon chip (or dot fallback) */}
                {item.icon ? (
                  <div
                    className="flex flex-shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      backgroundColor: accent,
                      color: "#ffffff",
                    }}
                  >
                    {item.icon}
                  </div>
                ) : (
                  <div
                    className="mt-1.5 flex-shrink-0 rounded-full"
                    style={{
                      width: "0.625rem",
                      height: "0.625rem",
                      backgroundColor: accent,
                    }}
                  />
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                  {/* Label */}
                  {item.label &&
                    (onStartEditLabel ? (
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
                        className={`font-bold leading-tight ${
                          isHero ? "text-xl mb-2" : "text-base mb-1.5"
                        }`}
                        style={{ color: titleColor }}
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <h3
                        className={`font-bold leading-tight ${
                          isHero ? "text-xl mb-2" : "text-base mb-1.5"
                        }`}
                        style={{ color: titleColor }}
                      >
                        {item.label}
                      </h3>
                    ))}

                  {/* Text */}
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
                      className={`leading-relaxed ${
                        isHero ? "text-base" : "text-sm"
                      }`}
                      style={{ color: bodyColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <p
                      className={`leading-relaxed ${
                        isHero ? "text-base" : "text-sm"
                      }`}
                      style={{ color: bodyColor }}
                    >
                      {item.text}
                    </p>
                  )}
                </div>
              </div>
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
