"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants - a gentle fade + scale-up for the hero statement
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface ThemeStyles {
  titleColor: string;
  bodyColor: string;
  accent: string;
}

function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  return {
    titleColor: theme?.colors.heading || "#1e293b",
    bodyColor: theme?.colors.textMuted || "#64748b",
    accent:
      accentColor ||
      theme?.colors.accent ||
      theme?.colors.primary ||
      "#6366f1",
  };
}

interface SpotlightStatementRendererProps {
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

export function SpotlightStatementRenderer({
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
}: SpotlightStatementRendererProps) {
  const themeStyles = getThemeStyles(theme, accentColor);

  // The first item is the hero statement; anything after is supporting context.
  const heroItem = items[0];
  const supportingItems = items.slice(1, 4); // keep it minimal - one big idea

  if (!heroItem) return null;

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

  const Block = isPresenting ? motion.div : "div";
  const blockProps = isPresenting ? { variants: itemVariants } : {};

  // ---- Shared bits for the added styles (2-10) ----
  const accent = themeStyles.accent;
  const titleColor = themeStyles.titleColor;
  const bodyColor = themeStyles.bodyColor;
  const SB = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const bMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const editKicker = (cls: string, style?: React.CSSProperties) =>
    heroItem.label ? (
      onStartEditLabel ? (
        <EditableText value={heroItem.label} isEditing={isEditing && editingText?.field === `content-label-0`}
          onStartEdit={() => onStartEditLabel(0)} onChange={(val) => onUpdateLabel?.(0, val)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(0) : undefined}
          className={cls} style={{ color: accent, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <p className={cls} style={{ color: accent, ...style }}>{heroItem.label}</p>
      )
    ) : null;

  // Editable text for hero (index 0) or a supporting item (index >= 1)
  const editStatement = (index: number, cls: string, style?: React.CSSProperties) => {
    const value = index === 0 ? heroItem.text : supportingItems[index - 1]!.text;
    return onStartEditText ? (
      <EditableText value={value} isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)} onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <p className={cls} style={{ color: titleColor, ...style }}>{value}</p>
    );
  };

  const supportBlock = (align: "center" | "left", textColor?: string) => {
    if (supportingItems.length === 0) return null;
    const col = textColor || bodyColor;
    if (supportingItems.length === 1) {
      return (
        <SB className={`mt-7 ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`} style={getSpotlightStyle(1)} {...bMotion(1)}>
          {editStatement(1, "text-base sm:text-lg leading-relaxed", { color: col })}
        </SB>
      );
    }
    return (
      <SB className={`mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 ${align === "center" ? "justify-center" : ""}`} style={getSpotlightStyle(1)} {...bMotion(1)}>
        {supportingItems.map((_, i) => (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
            {editStatement(i + 1, "text-sm sm:text-base leading-snug", { color: col })}
          </div>
        ))}
      </SB>
    );
  };

  // == SPOTLIGHT-STYLE-2: QUOTE FRAME — statement bracketed by giant marks
  if (layoutId === "spotlight-style-2") {
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center text-center px-10 py-10 ${className}`} key={animationKey} {...cProps}>
        <SB className="relative max-w-3xl px-6" style={getSpotlightStyle(0)} {...bMotion(0)}>
          <span aria-hidden className="absolute -left-2 -top-8 select-none font-serif leading-none" style={{ fontSize: "5rem", color: alpha(accent, "2e") }}>“</span>
          {editKicker("mb-3 text-sm font-medium uppercase tracking-[0.2em]")}
          {editStatement(0, "text-3xl sm:text-4xl font-bold leading-[1.14] tracking-tight")}
          <span aria-hidden className="absolute -bottom-12 -right-2 select-none font-serif leading-none" style={{ fontSize: "5rem", color: alpha(accent, "2e") }}>”</span>
        </SB>
        {supportBlock("center")}
      </Container>
    );
  }

  // == SPOTLIGHT-STYLE-3: GRADIENT GLOW — radial accent glow behind statement
  if (layoutId === "spotlight-style-3") {
    return (
      <Container className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden text-center px-10 py-10 ${className}`} key={animationKey} {...cProps}>
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(58% 58% at 50% 44%, ${alpha(accent, "30")} 0%, transparent 70%)` }} />
        <SB className="relative max-w-3xl" style={getSpotlightStyle(0)} {...bMotion(0)}>
          {editKicker("mb-4 text-sm font-medium uppercase tracking-[0.2em]")}
          {editStatement(0, "text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight")}
          <div className="mx-auto mt-6 h-1 w-16 rounded-full" style={{ background: accent }} />
        </SB>
        {supportBlock("center")}
      </Container>
    );
  }

  // == SPOTLIGHT-STYLE-4: LEFT STATEMENT — left-aligned with a thick accent rule
  if (layoutId === "spotlight-style-4") {
    return (
      <Container className={`w-full h-full flex flex-col items-start justify-center text-left px-12 py-10 ${className}`} key={animationKey} {...cProps}>
        <SB className="max-w-3xl border-l-4 pl-7" style={{ borderColor: accent, ...getSpotlightStyle(0) }} {...bMotion(0)}>
          {editKicker("mb-3 text-sm font-medium uppercase tracking-[0.2em]")}
          {editStatement(0, "text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight")}
        </SB>
        {supportBlock("left")}
      </Container>
    );
  }

  // == SPOTLIGHT-STYLE-5: STAT HERO — the label as a giant stat, text as caption
  if (layoutId === "spotlight-style-5") {
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center text-center px-10 py-10 ${className}`} key={animationKey} {...cProps}>
        <SB className="max-w-3xl" style={getSpotlightStyle(0)} {...bMotion(0)}>
          {heroItem.label ? (
            <>
              {editKicker("font-extrabold leading-none tracking-tight tabular-nums", { fontSize: "clamp(3.5rem, 12vw, 7rem)" })}
              <div className="mx-auto mt-4 h-1 w-16 rounded-full" style={{ background: accent }} />
              {editStatement(0, "mt-4 text-lg sm:text-xl leading-relaxed", { color: bodyColor })}
            </>
          ) : (
            editStatement(0, "text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight")
          )}
        </SB>
        {supportBlock("center")}
      </Container>
    );
  }

  // == SPOTLIGHT-STYLE-6: FRAMED STATEMENT — statement in an accent corner frame
  if (layoutId === "spotlight-style-6") {
    const tick = (pos: React.CSSProperties) => (
      <span aria-hidden className="absolute h-5 w-5" style={{ borderColor: accent, ...pos }} />
    );
    return (
      <Container className={`w-full h-full flex items-center justify-center px-10 py-10 ${className}`} key={animationKey} {...cProps}>
        <SB className="relative max-w-3xl px-10 py-9 text-center" style={{ border: `1px solid ${alpha(accent, "3d")}`, ...getSpotlightStyle(0) }} {...bMotion(0)}>
          {tick({ top: -1, left: -1, borderTop: `3px solid ${accent}`, borderLeft: `3px solid ${accent}` })}
          {tick({ top: -1, right: -1, borderTop: `3px solid ${accent}`, borderRight: `3px solid ${accent}` })}
          {tick({ bottom: -1, left: -1, borderBottom: `3px solid ${accent}`, borderLeft: `3px solid ${accent}` })}
          {tick({ bottom: -1, right: -1, borderBottom: `3px solid ${accent}`, borderRight: `3px solid ${accent}` })}
          {editKicker("mb-3 text-sm font-medium uppercase tracking-[0.2em]")}
          {editStatement(0, "text-3xl sm:text-4xl font-bold leading-[1.12] tracking-tight")}
          {supportingItems.length > 0 && <div className="mt-5">{editStatement(1, "text-base leading-relaxed", { color: bodyColor })}</div>}
        </SB>
      </Container>
    );
  }

  // == SPOTLIGHT-STYLE-7: ACCENT BAND — the statement on a full-width accent band
  if (layoutId === "spotlight-style-7") {
    return (
      <Container className={`w-full h-full flex items-center justify-center px-8 py-10 ${className}`} key={animationKey} {...cProps}>
        <SB className="relative w-full overflow-hidden rounded-3xl px-8 py-12 text-center" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "b3")})`, boxShadow: `0 20px 50px -18px ${alpha(accent, "99")}`, ...getSpotlightStyle(0) }} {...bMotion(0)}>
          {editKicker("mb-3 text-sm font-medium uppercase tracking-[0.22em]", { color: "rgba(255,255,255,0.82)" })}
          {editStatement(0, "text-3xl sm:text-4xl font-bold leading-[1.1] tracking-tight mx-auto max-w-3xl", { color: "#ffffff" })}
          {supportingItems.length > 0 && <div className="mx-auto mt-5 max-w-2xl">{editStatement(1, "text-base sm:text-lg leading-relaxed", { color: "rgba(255,255,255,0.9)" })}</div>}
        </SB>
      </Container>
    );
  }

  // == SPOTLIGHT-STYLE-8: UNDERLINE SWEEP — centered statement over a bold bar
  if (layoutId === "spotlight-style-8") {
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center text-center px-10 py-10 ${className}`} key={animationKey} {...cProps}>
        <SB className="max-w-3xl" style={getSpotlightStyle(0)} {...bMotion(0)}>
          {editKicker("mb-4 text-sm font-medium uppercase tracking-[0.2em]")}
          {editStatement(0, "text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight")}
          <div className="mx-auto mt-5 h-2.5 w-44 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "40")})` }} />
        </SB>
        {supportBlock("center")}
      </Container>
    );
  }

  // == SPOTLIGHT-STYLE-9: SIDE RULE — a tall accent rule with a rotated kicker
  if (layoutId === "spotlight-style-9") {
    return (
      <Container className={`w-full h-full flex flex-row items-center gap-7 px-12 py-10 text-left ${className}`} key={animationKey} {...cProps}>
        <div className="flex shrink-0 items-center gap-3 self-stretch py-4">
          {heroItem.label && (
            <span className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: accent, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              {heroItem.label}
            </span>
          )}
          <div className="w-1.5 self-stretch rounded-full" style={{ background: `linear-gradient(${accent}, ${alpha(accent, "1a")})` }} />
        </div>
        <SB className="min-w-0 flex-1" style={getSpotlightStyle(0)} {...bMotion(0)}>
          {editStatement(0, "text-3xl sm:text-4xl font-bold leading-[1.12] tracking-tight")}
          {supportingItems.length > 0 && <div className="mt-5">{editStatement(1, "text-base sm:text-lg leading-relaxed", { color: bodyColor })}</div>}
        </SB>
      </Container>
    );
  }

  // == SPOTLIGHT-STYLE-10: MARK ABOVE — a large decorative accent mark
  if (layoutId === "spotlight-style-10") {
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center text-center px-10 py-10 ${className}`} key={animationKey} {...cProps}>
        <SB className="max-w-3xl" style={getSpotlightStyle(0)} {...bMotion(0)}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white" style={{ background: `linear-gradient(150deg, ${accent}, ${alpha(accent, "b3")})`, boxShadow: `0 10px 26px -8px ${alpha(accent, "80")}` }}>
            {heroItem.icon || "✳"}
          </div>
          {editKicker("mb-3 text-sm font-medium uppercase tracking-[0.2em]")}
          {editStatement(0, "text-3xl sm:text-4xl font-bold leading-[1.12] tracking-tight")}
        </SB>
        {supportBlock("center")}
      </Container>
    );
  }

  return (
    <Container
      className={`w-full h-full flex flex-col items-center justify-center text-center px-8 py-10 sm:px-12 ${className}`}
      key={animationKey} {...containerProps}
    >
      {/* Kicker - small uppercase eyebrow from the hero label */}
      {heroItem.label && (
        <Block
          className="mb-4"
          style={getSpotlightStyle(0)}
          {...blockProps}
        >
          {onStartEditLabel ? (
            <EditableText
              value={heroItem.label}
              isEditing={
                isEditing && editingText?.field === `content-label-0`
              }
              onStartEdit={() => onStartEditLabel(0)}
              onChange={(val) => onUpdateLabel?.(0, val)}
              onFinish={onFinishEditing || (() => {})}
              onDelete={onDeleteItem ? () => onDeleteItem(0) : undefined}
              className="text-sm font-medium uppercase tracking-[0.2em]"
              style={{ color: themeStyles.accent }}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <p
              className="text-sm font-medium uppercase tracking-[0.2em]"
              style={{ color: themeStyles.accent }}
            >
              {heroItem.label}
            </p>
          )}
        </Block>
      )}

      {/* Hero statement - the single big idea */}
      <Block
        className="max-w-3xl"
        style={getSpotlightStyle(0)}
        {...blockProps}
      >
        {onStartEditText ? (
          <EditableText
            value={heroItem.text}
            isEditing={isEditing && editingText?.field === `content-text-0`}
            onStartEdit={() => onStartEditText(0)}
            onChange={(val) => onUpdateText?.(0, val)}
            onFinish={onFinishEditing || (() => {})}
            onDelete={onDeleteItem ? () => onDeleteItem(0) : undefined}
            className="text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight"
            style={{ color: themeStyles.titleColor }}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <h2
            className="text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight"
            style={{ color: themeStyles.titleColor }}
          >
            {heroItem.text}
          </h2>
        )}
      </Block>

      {/* Accent underline bar */}
      <Block
        className="mt-6 h-1 w-16 rounded-full"
        style={{ backgroundColor: themeStyles.accent, ...getSpotlightStyle(0) }}
        {...blockProps}
      />

      {/* Supporting context - kept minimal */}
      {supportingItems.length > 0 && (
        <Block
          className="mt-8"
          style={getSpotlightStyle(1)}
          {...blockProps}
        >
          {supportingItems.length === 1 ? (
            // Single muted supporting sentence
            onStartEditText ? (
              <div className="max-w-2xl">
                <EditableText
                  value={supportingItems[0]!.text}
                  isEditing={
                    isEditing && editingText?.field === `content-text-1`
                  }
                  onStartEdit={() => onStartEditText(1)}
                  onChange={(val) => onUpdateText?.(1, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(1) : undefined}
                  className="text-base sm:text-lg leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              </div>
            ) : (
              <p
                className="max-w-2xl text-base sm:text-lg leading-relaxed"
                style={{ color: themeStyles.bodyColor }}
              >
                {supportingItems[0]!.text}
              </p>
            )
          ) : (
            // Small horizontal row of accent-dotted supporting points
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {supportingItems.map((item, i) => {
                const itemIndex = i + 1;
                return (
                  <div
                    key={itemIndex}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: themeStyles.accent }}
                    />
                    {onStartEditText ? (
                      <EditableText
                        value={item.text}
                        isEditing={
                          isEditing &&
                          editingText?.field === `content-text-${itemIndex}`
                        }
                        onStartEdit={() => onStartEditText(itemIndex)}
                        onChange={(val) => onUpdateText?.(itemIndex, val)}
                        onFinish={onFinishEditing || (() => {})}
                        onDelete={
                          onDeleteItem
                            ? () => onDeleteItem(itemIndex)
                            : undefined
                        }
                        className="text-sm sm:text-base leading-snug"
                        style={{ color: themeStyles.bodyColor }}
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <span
                        className="text-sm sm:text-base leading-snug"
                        style={{ color: themeStyles.bodyColor }}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Block>
      )}
    </Container>
  );
}
