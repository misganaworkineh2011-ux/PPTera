"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { CascadingContentItem } from "~/lib/layouts/content/cascading";
import EditableText from "~/components/presentation/EditableText";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
  },
};

// --- Custom Colors ---
function getStepColors(index: number, accentColor?: string, secondaryColor?: string) {
  // If theme colors provided, use them
  if (accentColor) {
    // Create variations of the accent color
    return {
      main: accentColor,
      accent: accentColor,
      bg: `${accentColor}15`, // 15% opacity
    };
  }
  
  // Fallback: Original color scheme
  const STEP_COLORS = [
    { main: "#65a30d", accent: "#84cc16", bg: "#f7fee7" }, // Green
    { main: "#0891b2", accent: "#22d3ee", bg: "#ecfeff" }, // Cyan
    { main: "#0e7490", accent: "#06b6d4", bg: "#f0fdfa" }, // Dark Teal
    { main: "#1e1b4b", accent: "#312e81", bg: "#eef2ff" }, // Navy
  ];
  
  return STEP_COLORS[index % STEP_COLORS.length]!;
}

interface ConnectorLineProps {
  color: string;
  isLeft: boolean;
}

// Compact connector line
const ConnectorLine = ({ color, isLeft }: ConnectorLineProps) => (
  <svg
    className={`w-12 h-10 md:w-20 md:h-12 flex-shrink-0 ${isLeft ? "" : "transform scale-x-[-1]"}`}
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="5" cy="5" r="4" fill="white" stroke={color} strokeWidth="2.5" />
    <path
      d="M 10 5 L 40 5 L 90 55 H 100"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

interface ThemeStyles {
  titleColor: string;
  bodyColor: string;
}

function getThemeStyles(theme?: Theme): ThemeStyles {
  return {
    titleColor: theme?.colors.heading || "#1e293b",
    bodyColor: theme?.colors.textMuted || "#64748b",
  };
}

interface CascadingWorkflowRendererProps {
  items: CascadingContentItem[];
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

export function CascadingWorkflowRenderer({
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
}: CascadingWorkflowRendererProps) {
  const displayItems = items.slice(0, 4);
  const themeStyles = getThemeStyles(theme);

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      filter: isHighlighted ? 'none' : 'grayscale(80%)',
      // Ensure highlighted item pops to front
      zIndex: isHighlighted ? 50 : undefined, 
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const ItemWrapper = isPresenting ? motion.div : "div";

  // ---- Shared bits for the added styles (2-8) ----
  const accent = accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const surface = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const cardBorder = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const editLabel = (item: CascadingContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText
          value={item.label}
          isEditing={isEditing && editingText?.field === `content-label-${index}`}
          onStartEdit={() => onStartEditLabel(index)}
          onChange={(val) => onUpdateLabel?.(index, val)}
          onFinish={onFinishEditing || (() => {})}
          onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
          className={cls}
          style={{ color: themeStyles.titleColor, ...style }}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ) : (
        <h3 className={cls} style={{ color: themeStyles.titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  const editText = (item: CascadingContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)}
        onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls}
        style={{ color: themeStyles.bodyColor, ...style }}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <p className={cls} style={{ color: themeStyles.bodyColor, ...style }}>{item.text}</p>
    );

  // == CASCADING-STYLE-2: TERRACE STEPS — leading blocks grow row by row
  if (layoutId === "cascading-style-2") {
    const tItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-3 px-2 ${className}`} key={animationKey} {...cProps}>
        {tItems.map((item, index) => (
          <ItemWrapper key={index} className="flex items-center gap-4 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
            <div
              className="flex h-11 shrink-0 items-center justify-end rounded-r-lg pr-3"
              style={{
                width: 44 + index * 34,
                background: `linear-gradient(90deg, ${accent}33, ${accent})`,
                boxShadow: `0 3px 10px ${accent}26`,
              }}
            >
              <span className="text-sm font-extrabold tabular-nums text-white">{pad2(index + 1)}</span>
            </div>
            <div className="min-w-0 flex-1 pb-1" style={{ borderBottom: `1px solid ${cardBorder}` }}>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </div>
          </ItemWrapper>
        ))}
      </Container>
    );
  }

  // == CASCADING-STYLE-3: HANGING TAGS — cards on strings at staggered depths
  if (layoutId === "cascading-style-3") {
    const hItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-start pt-6 px-2 ${className}`} key={animationKey} {...cProps}>
        {/* The rail everything hangs from */}
        <div className="h-[3px] rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}33)` }} />
        <div className="flex items-start justify-between gap-3">
          {hItems.map((item, index) => (
            <ItemWrapper key={index} className="flex min-w-0 flex-1 flex-col items-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {/* String */}
              <div style={{ height: 16 + index * 22, borderLeft: `2px dashed ${accent}59` }} aria-hidden />
              {/* Tag with punched hole */}
              <div className="relative w-full rounded-xl px-3.5 pb-3 pt-5" style={{ background: surface, border: `1px solid ${cardBorder}`, boxShadow: `0 6px 16px ${accent}14` }}>
                <span
                  className="absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                  style={{ border: `2px solid ${accent}`, background: "transparent" }}
                  aria-hidden
                />
                <span className="font-mono text-[10px] font-bold tracking-[0.2em]" style={{ color: accent }}>
                  {pad2(index + 1)}
                </span>
                {editLabel(item, index, "mt-0.5 text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-1 text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == CASCADING-STYLE-4: ELBOW BRANCH — L-connectors stepping down-right
  if (layoutId === "cascading-style-4") {
    const eItems = items.slice(0, 5);
    const n = eItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-2.5 px-2 ${className}`} key={animationKey} {...cProps}>
        {eItems.map((item, index) => (
          <ItemWrapper
            key={index}
            className="relative flex items-center gap-3 min-w-0"
            style={{ marginLeft: `${(index * 36) / Math.max(n - 1, 1)}%`, width: "62%", minWidth: "48%", ...getSpotlightStyle(index) }}
            {...itemMotion(index)}
          >
            {index > 0 && (
              <div
                className="absolute rounded-bl-xl"
                style={{ left: 14, top: -22, width: 26, height: 30, borderLeft: `2.5px solid ${accent}66`, borderBottom: `2.5px solid ${accent}66` }}
                aria-hidden
              />
            )}
            <span
              className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums text-white"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 0 0 4px ${surface}` }}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-xl px-3.5 py-2" style={{ background: surface, border: `1px solid ${cardBorder}` }}>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </div>
          </ItemWrapper>
        ))}
      </Container>
    );
  }

  // == CASCADING-STYLE-5: DIAGONAL RAIL — cards docked along a diagonal
  if (layoutId === "cascading-style-5") {
    const dItems = items.slice(0, 4);
    const n = dItems.length;
    return (
      <Container className={`relative w-full h-full flex flex-col justify-between py-6 px-2 ${className}`} key={animationKey} {...cProps}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <line x1={7} y1={6} x2={93} y2={94} stroke={`${accent}40`} strokeWidth={1.2} />
        </svg>
        {dItems.map((item, index) => (
          <ItemWrapper
            key={index}
            className="relative flex items-start gap-3 min-w-0"
            style={{ marginLeft: `${(index * 58) / Math.max(n - 1, 1)}%`, width: "40%", minWidth: "34%", ...getSpotlightStyle(index) }}
            {...itemMotion(index)}
          >
            <span
              className="z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold tabular-nums"
              style={{ background: accent, color: "#ffffff", boxShadow: `0 3px 10px ${accent}40` }}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-xl px-3.5 py-2.5" style={{ background: surface, border: `1px solid ${cardBorder}` }}>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </div>
          </ItemWrapper>
        ))}
      </Container>
    );
  }

  // == CASCADING-STYLE-6: PAPER FAN — overlapping sheets stepping down-right
  if (layoutId === "cascading-style-6") {
    const pItems = items.slice(0, 4);
    const n = pItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center px-2 ${className}`} key={animationKey} {...cProps}>
        <div className="flex flex-col">
          {pItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative min-w-0 rounded-xl p-4 pr-12"
              style={{
                marginLeft: `${(index * 42) / Math.max(n - 1, 1)}%`,
                marginTop: index === 0 ? 0 : -18,
                width: "54%",
                minWidth: "46%",
                zIndex: index + 1,
                transform: `rotate(${(index - (n - 1) / 2) * 0.9}deg)`,
                background: surface,
                border: `1px solid ${cardBorder}`,
                boxShadow: `0 10px 24px ${accent}1f`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold tabular-nums"
                style={{ background: `${accent}1f`, color: accent, border: `1px solid ${accent}40` }}
              >
                {index + 1}
              </span>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == CASCADING-STYLE-7: INDENT RETURNS — code-style tab stops with ↳
  if (layoutId === "cascading-style-7") {
    const iItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-3.5 px-3 ${className}`} key={animationKey} {...cProps}>
        {iItems.map((item, index) => (
          <ItemWrapper
            key={index}
            className="flex items-start gap-3 min-w-0"
            style={{ marginLeft: `${index * 2.6}rem`, ...getSpotlightStyle(index) }}
            {...itemMotion(index)}
          >
            {index > 0 && (
              <span className="shrink-0 font-mono text-lg font-bold leading-none" style={{ color: `${accent}8c` }} aria-hidden>
                ↳
              </span>
            )}
            <span className="shrink-0 font-mono text-[11px] font-bold pt-1" style={{ color: accent }}>
              {pad2(index + 1)}
            </span>
            <div className="min-w-0">
              {editLabel(item, index, "font-mono text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </div>
          </ItemWrapper>
        ))}
      </Container>
    );
  }

  // == CASCADING-STYLE-8: RIPPLE DROP — ripple nodes descending diagonally
  if (layoutId === "cascading-style-8") {
    const rItems = items.slice(0, 5);
    const n = rItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-3 px-2 ${className}`} key={animationKey} {...cProps}>
        {rItems.map((item, index) => (
          <ItemWrapper
            key={index}
            className="flex items-center gap-4 min-w-0"
            style={{ marginLeft: `${(index * 30) / Math.max(n - 1, 1)}%`, width: "66%", minWidth: "54%", ...getSpotlightStyle(index) }}
            {...itemMotion(index)}
          >
            {/* Ripple node */}
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center" aria-hidden={false}>
              <span className="absolute inset-0 rounded-full" style={{ border: `1.5px solid ${accent}26` }} />
              <span className="absolute inset-[6px] rounded-full" style={{ border: `1.5px solid ${accent}59` }} />
              <span
                className="relative flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold tabular-nums text-white"
                style={{ background: accent }}
              >
                {index + 1}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </div>
          </ItemWrapper>
        ))}
      </Container>
    );
  }

  return (
    <Container
      className={`w-full max-w-5xl mx-auto py-8 px-4 ${className}`}
      key={animationKey}
      initial={isPresenting ? "hidden" : undefined}
      animate={isPresenting ? "visible" : undefined}
      variants={containerVariants}
    >
      {/* 
        Using -space-y-6 or -space-y-10 creates the overlap effect.
        This pulls the visual centers of the boxes much closer.
      */}
      <div className="flex flex-col relative">
        {displayItems.map((item, index) => {
          const isTextLeft = index % 2 === 0;
          const colorStep = getStepColors(index, accentColor, theme?.colors.secondary);
          const mainColor = colorStep.main;
          const bgColor = colorStep.bg;
          // Theme-aware node base (was hardcoded white — a bright box on dark themes)
          const nodeBg =
            theme?.cardBox?.background || theme?.colors.surface || "#ffffff";

          return (
            <ItemWrapper
              key={index}
              variants={itemVariants}
              // Negative margin top (-mt-10) pulls rows together. 
              // z-index ensures correct stacking order (usually top box over bottom, or vice versa)
              className={`grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 md:gap-4 items-center relative ${index !== 0 ? '-mt-10 md:-mt-12' : ''}`}
              style={{ 
                zIndex: displayItems.length - index, // Stack earlier items on top
                ...getSpotlightStyle(index)
              }}
            >
              
              {/* --- LEFT COLUMN --- */}
              <div className="flex justify-end items-center h-full pointer-events-none">
                {isTextLeft ? (
                  <div className="flex items-start gap-2 md:gap-4 text-right pointer-events-auto pb-8 md:pb-0">
                    <div className="flex flex-col items-end max-w-[280px]">
                      {item.label && (
                        <div className="mb-1">
                           {onStartEditLabel ? (
                            <EditableText
                              value={item.label}
                              isEditing={isEditing && editingText?.field === `content-label-${index}`}
                              onStartEdit={() => onStartEditLabel(index)}
                              onChange={(val) => onUpdateLabel?.(index, val)}
                              onFinish={onFinishEditing || (() => {})}
                              className="font-bold text-lg leading-tight"
                              style={{ color: themeStyles.titleColor }}
                              isOwner={isOwner}
                              isHovered={isHovered}
                            />
                          ) : (
                            <h3 className="font-bold text-lg leading-tight" style={{ color: themeStyles.titleColor }}>
                              {item.label}
                            </h3>
                          )}
                        </div>
                      )}
                      {onStartEditText ? (
                        <EditableText
                          value={item.text}
                          isEditing={isEditing && editingText?.field === `content-text-${index}`}
                          onStartEdit={() => onStartEditText(index)}
                          onChange={(val) => onUpdateText?.(index, val)}
                          onFinish={onFinishEditing || (() => {})}
                          className="text-sm leading-snug"
                          style={{ color: themeStyles.bodyColor }}
                          isOwner={isOwner}
                          isHovered={isHovered}
                        />
                      ) : (
                        <p className="text-sm leading-snug" style={{ color: themeStyles.bodyColor }}>
                          {item.text}
                        </p>
                      )}
                    </div>
                    <div className="pt-1 hidden md:block">
                       <ConnectorLine color={mainColor} isLeft={true} />
                    </div>
                  </div>
                ) : (
                  // Empty spacer for the left side when text is on right
                  <div className="hidden md:flex items-center justify-end pr-6 w-full opacity-10">
                     <span className="text-5xl font-black" style={{ color: mainColor }}>
                        {String(index + 1).padStart(2, '0')}
                     </span>
                  </div>
                )}
              </div>

              {/* --- CENTER COLUMN (The Box) --- */}
              <div className="flex justify-center relative z-10 my-2">
                <div
                  className="w-48 h-20 md:w-60 md:h-24 rounded border-[3px] flex items-center justify-center relative shadow-md"
                  style={{
                    borderColor: mainColor,
                    background: `linear-gradient(135deg, ${nodeBg} 40%, ${bgColor} 100%)`
                  }}
                >
                  {/* Icon */}
                  {item.icon && (
                    <div className="text-3xl md:text-4xl" style={{ color: mainColor }}>
                      {item.icon}
                    </div>
                  )}
                  {/* Inner border decoration */}
                  <div className="absolute inset-1 border opacity-30 rounded-sm pointer-events-none" style={{ borderColor: mainColor }} />
                </div>
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div className="flex justify-start items-center h-full pointer-events-none">
                {!isTextLeft ? (
                  <div className="flex items-start gap-2 md:gap-4 text-left pointer-events-auto pb-8 md:pb-0">
                    <div className="pt-1 hidden md:block">
                        <ConnectorLine color={mainColor} isLeft={false} />
                    </div>
                    <div className="flex flex-col items-start max-w-[280px]">
                      {item.label && (
                        <div className="mb-1">
                           {onStartEditLabel ? (
                            <EditableText
                              value={item.label}
                              isEditing={isEditing && editingText?.field === `content-label-${index}`}
                              onStartEdit={() => onStartEditLabel(index)}
                              onChange={(val) => onUpdateLabel?.(index, val)}
                              onFinish={onFinishEditing || (() => {})}
                              className="font-bold text-lg leading-tight"
                              style={{ color: themeStyles.titleColor }}
                              isOwner={isOwner}
                              isHovered={isHovered}
                            />
                          ) : (
                            <h3 className="font-bold text-lg leading-tight" style={{ color: themeStyles.titleColor }}>
                              {item.label}
                            </h3>
                          )}
                        </div>
                      )}
                      {onStartEditText ? (
                        <EditableText
                          value={item.text}
                          isEditing={isEditing && editingText?.field === `content-text-${index}`}
                          onStartEdit={() => onStartEditText(index)}
                          onChange={(val) => onUpdateText?.(index, val)}
                          onFinish={onFinishEditing || (() => {})}
                          className="text-sm leading-snug"
                          style={{ color: themeStyles.bodyColor }}
                          isOwner={isOwner}
                          isHovered={isHovered}
                        />
                      ) : (
                        <p className="text-sm leading-snug" style={{ color: themeStyles.bodyColor }}>
                          {item.text}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center justify-start pl-6 w-full opacity-10">
                     <span className="text-5xl font-black" style={{ color: mainColor }}>
                        {String(index + 1).padStart(2, '0')}
                     </span>
                  </div>
                )}
              </div>

            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}