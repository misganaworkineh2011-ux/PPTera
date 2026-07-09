"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";

// Animation variants
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

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface DataTableRendererProps {
  items: BoxContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  isPresenting?: boolean;
  animationKey?: string;
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

export function DataTableRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId,
  isPresenting = false,
  animationKey,
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
}: DataTableRendererProps) {
  // Cap at 7 rows for a readable, premium table.
  const displayItems = items.slice(0, 7);

  // Defensive color resolution.
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor ||
    theme?.colors.accent ||
    theme?.colors.primary ||
    "#6366f1";
  const border = theme?.colors.border || "rgba(0,0,0,0.1)";
  const surface =
    theme?.cardBox?.background ||
    theme?.colors.surface ||
    "rgba(255,255,255,0.04)";

  // Derive sensible header labels. Prefer obvious headers from the data;
  // otherwise fall back to simple, robust generics.
  const hasLabels = displayItems.some(
    (item) => item.label && item.label.trim().length > 0,
  );
  const leftHeader = hasLabels ? "Item" : "Item";
  const rightHeader = hasLabels ? "Details" : "Details";

  // Accent-tinted header background at low opacity (robust regardless of
  // whether the accent is hex or rgb/named).
  const headerBg = `color-mix(in srgb, ${accent} 12%, transparent)`;
  const zebraBg = `color-mix(in srgb, ${surface} 50%, transparent)`;

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

  // Editable-or-static cell helpers shared by all table variants
  const labelCell = (
    item: BoxContentItem,
    index: number,
    cls: string,
    style: React.CSSProperties,
  ) =>
    onStartEditLabel ? (
      <EditableText
        value={item.label ?? ""}
        isEditing={isEditing && editingText?.field === `content-label-${index}`}
        onStartEdit={() => onStartEditLabel(index)}
        onChange={(val) => onUpdateLabel?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls}
        style={style}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <span className={cls} style={style}>
        {item.label}
      </span>
    );

  const textCell = (
    item: BoxContentItem,
    index: number,
    cls: string,
    style: React.CSSProperties,
  ) =>
    onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)}
        onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls}
        style={style}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <span className={cls} style={style}>
        {item.text}
      </span>
    );

  /* ------------------ table-style-2: Numbered Ledger ------------------ */
  if (layoutId === "table-style-2") {
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center px-8 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex w-full flex-col">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="flex items-baseline gap-5 py-3"
              style={{
                borderBottom:
                  index === displayItems.length - 1 ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
            >
              <span
                className="w-10 shrink-0 text-right text-2xl font-extrabold leading-none tabular-nums"
                style={{ color: `${accent}59` }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="w-[30%] shrink-0">
                {labelCell(item, index, "text-sm font-bold leading-snug break-words", {
                  color: titleColor,
                })}
              </div>
              <div className="min-w-0 flex-1">
                {textCell(item, index, "text-sm leading-relaxed break-words", {
                  color: bodyColor,
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------ table-style-3: Split Panels ------------------ */
  if (layoutId === "table-style-3") {
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center gap-2.5 px-8 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="flex overflow-hidden rounded-xl"
            style={{ border: `1px solid ${border}`, ...getSpotlightStyle(index) }}
          >
            <div
              className="flex w-[32%] shrink-0 items-center px-4 py-3"
              style={{ backgroundColor: `${accent}14`, borderRight: `1px solid ${border}` }}
            >
              {labelCell(item, index, "text-sm font-bold leading-snug break-words", {
                color: titleColor,
              })}
            </div>
            <div className="flex min-w-0 flex-1 items-center px-4 py-3" style={{ backgroundColor: surface }}>
              {textCell(item, index, "text-sm leading-relaxed break-words", {
                color: bodyColor,
              })}
            </div>
          </div>
        ))}
      </Container>
    );
  }

  /* ------------------ table-style-4: Accent Rail ------------------ */
  if (layoutId === "table-style-4") {
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center px-8 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="w-full overflow-hidden rounded-xl"
          style={{ border: `1px solid ${border}` }}
        >
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="flex"
              style={{
                borderTop: index === 0 ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
            >
              <div
                className="flex w-[28%] shrink-0 items-center px-4 py-3"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                }}
              >
                {labelCell(item, index, "text-sm font-bold leading-snug break-words", {
                  color: "#ffffff",
                })}
              </div>
              <div className="flex min-w-0 flex-1 items-center px-4 py-3" style={{ backgroundColor: surface }}>
                {textCell(item, index, "text-sm leading-relaxed break-words", {
                  color: bodyColor,
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------ table-style-5: Floating Rows ------------------ */
  if (layoutId === "table-style-5") {
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center gap-3 px-8 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl px-5 py-3.5"
            style={{
              backgroundColor: surface,
              border: `1px solid ${border}`,
              boxShadow: "0 1px 2px rgba(15,23,42,0.05), 0 6px 18px rgba(15,23,42,0.07)",
              ...getSpotlightStyle(index),
            }}
          >
            <div
              className="flex shrink-0 items-center rounded-full px-3.5 py-1.5"
              style={{
                background: `linear-gradient(135deg, ${accent}26, ${accent}0d)`,
                border: `1px solid ${accent}3d`,
              }}
            >
              {labelCell(item, index, "text-xs font-bold tracking-tight whitespace-nowrap", {
                color: accent,
              })}
            </div>
            <div className="min-w-0 flex-1">
              {textCell(item, index, "text-sm leading-relaxed break-words", {
                color: bodyColor,
              })}
            </div>
          </div>
        ))}
      </Container>
    );
  }

  /* ------------------ table-style-6: Print Minimal ------------------ */
  if (layoutId === "table-style-6") {
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center px-10 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col gap-6">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="flex items-baseline gap-6"
              style={getSpotlightStyle(index)}
            >
              <div className="w-[26%] shrink-0 text-right">
                {labelCell(
                  item,
                  index,
                  "text-[0.7rem] font-bold uppercase tracking-[0.16em] break-words",
                  { color: accent },
                )}
              </div>
              <span
                className="mt-1 h-1.5 w-1.5 shrink-0 self-start rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 0 3px ${accent}1f` }}
              />
              <div className="min-w-0 flex-1">
                {textCell(item, index, "text-base leading-relaxed break-words", {
                  color: titleColor,
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------ table-style-7: Duo Tone ------------------ */
  if (layoutId === "table-style-7") {
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center gap-2 px-8 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        {displayItems.map((item, index) => {
          const tinted = index % 2 === 0;
          return (
            <div
              key={index}
              className="flex items-baseline gap-3 rounded-xl px-5 py-3"
              style={{
                backgroundColor: tinted ? `${accent}14` : surface,
                border: `1px solid ${tinted ? `${accent}26` : border}`,
                ...getSpotlightStyle(index),
              }}
            >
              {labelCell(item, index, "shrink-0 text-sm font-bold tracking-tight", {
                color: tinted ? accent : titleColor,
              })}
              <span className="shrink-0 text-sm" style={{ color: bodyColor }}>
                —
              </span>
              <div className="min-w-0 flex-1">
                {textCell(item, index, "text-sm leading-relaxed break-words", {
                  color: bodyColor,
                })}
              </div>
            </div>
          );
        })}
      </Container>
    );
  }

  /* ------------------ table-style-8: Grid Cells ------------------ */
  if (layoutId === "table-style-8") {
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center px-8 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full grid-cols-2 overflow-hidden rounded-xl"
          style={{ border: `1px solid ${border}`, backgroundColor: surface }}
        >
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="px-5 py-4"
              style={{
                borderTop: index >= 2 ? `1px solid ${border}` : "none",
                borderLeft: index % 2 === 1 ? `1px solid ${border}` : "none",
                ...getSpotlightStyle(index),
              }}
            >
              {labelCell(
                item,
                index,
                "text-[0.65rem] font-bold uppercase tracking-[0.14em] break-words",
                { color: accent },
              )}
              <div className="mt-1.5">
                {textCell(item, index, "text-sm leading-relaxed break-words", {
                  color: titleColor,
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------ table-style-9: Spec Sheet ------------------ */
  if (layoutId === "table-style-9") {
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center px-10 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="flex flex-col gap-4 rounded-2xl px-7 py-6"
          style={{ backgroundColor: surface, border: `1px solid ${border}` }}
        >
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="flex items-baseline gap-3"
              style={getSpotlightStyle(index)}
            >
              <div className="shrink-0 max-w-[38%]">
                {labelCell(
                  item,
                  index,
                  "font-mono text-xs font-bold uppercase tracking-[0.1em] break-words",
                  { color: titleColor },
                )}
              </div>
              {/* Dotted leader line */}
              <span
                aria-hidden="true"
                className="mx-1 min-w-8 flex-1 self-center border-b-2 border-dotted"
                style={{ borderColor: `${accent}59`, transform: "translateY(-3px)" }}
              />
              <div className="min-w-0 max-w-[50%] text-right">
                {textCell(item, index, "text-sm font-medium leading-snug break-words", {
                  color: bodyColor,
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------ table-style-10: Hero Row ------------------ */
  if (layoutId === "table-style-10") {
    const [heroItem, ...restItems] = displayItems;
    return (
      <Container
        className={`w-full h-full flex flex-col justify-center gap-2.5 px-8 py-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        {heroItem && (
          <div
            className="flex items-baseline gap-4 rounded-2xl px-6 py-4"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              boxShadow: `0 8px 22px ${accent}40`,
              ...getSpotlightStyle(0),
            }}
          >
            {labelCell(heroItem, 0, "shrink-0 text-base font-extrabold tracking-tight", {
              color: "#ffffff",
            })}
            <div className="min-w-0 flex-1">
              {textCell(heroItem, 0, "text-sm leading-relaxed break-words", {
                color: "rgba(255,255,255,0.9)",
              })}
            </div>
          </div>
        )}
        <div className="flex flex-col px-2">
          {restItems.map((item, i) => {
            const index = i + 1;
            return (
              <div
                key={index}
                className="flex items-baseline gap-4 py-2.5"
                style={{
                  borderBottom:
                    i === restItems.length - 1 ? "none" : `1px solid ${border}`,
                  ...getSpotlightStyle(index),
                }}
              >
                <div className="w-[28%] shrink-0">
                  {labelCell(item, index, "text-sm font-bold leading-snug break-words", {
                    color: titleColor,
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  {textCell(item, index, "text-sm leading-relaxed break-words", {
                    color: bodyColor,
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ------------------ table-style-1 (default): Editorial Table ------------------ */
  return (
    <Container
      className={`w-full h-full flex flex-col justify-center px-8 py-6 ${className}`}
      key={animationKey} {...containerProps}
    >
      {/* Rounded outer corners via overflow-hidden wrapper + 1px border.
          Premium: thick accent rule across the top + soft ambient depth. */}
      <div
        className="w-full overflow-hidden rounded-xl"
        style={{
          border: `1px solid ${border}`,
          borderTop: `3px solid ${accent}`,
          boxShadow:
            "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.07)",
        }}
      >
        <table
          className="w-full text-left"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ backgroundColor: headerBg }}>
              <th
                className="px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.12em]"
                style={{
                  color: titleColor,
                  width: "32%",
                  borderBottom: `1px solid ${border}`,
                }}
              >
                {leftHeader}
              </th>
              <th
                className="px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.12em]"
                style={{
                  color: titleColor,
                  borderBottom: `1px solid ${border}`,
                }}
              >
                {rightHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, index) => {
              const RowWrapper = isPresenting ? motion.tr : "tr";
              const variantsProps = isPresenting
                ? { variants: rowVariants }
                : {};
              const isLast = index === displayItems.length - 1;
              // Very subtle zebra striping on alternate rows.
              const rowBg = index % 2 === 1 ? zebraBg : "transparent";
              const labelValue = item.label ?? "";

              return (
                <RowWrapper
                  key={index}
                  style={{
                    backgroundColor: rowBg,
                    ...getSpotlightStyle(index),
                  }}
                  {...variantsProps}
                >
                  {/* Left cell: label (bold, titleColor) */}
                  <td
                    className="px-4 py-3 align-top text-sm font-semibold leading-snug"
                    style={{
                      color: titleColor,
                      borderBottom: isLast
                        ? "none"
                        : `1px solid ${border}`,
                    }}
                  >
                    {onStartEditLabel ? (
                      <EditableText
                        value={labelValue}
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
                        className="font-semibold leading-snug"
                        style={{ color: titleColor }}
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <span>{labelValue}</span>
                    )}
                  </td>

                  {/* Right cell: text (bodyColor) */}
                  <td
                    className="px-4 py-3 align-top text-sm leading-relaxed"
                    style={{
                      color: bodyColor,
                      borderBottom: isLast
                        ? "none"
                        : `1px solid ${border}`,
                    }}
                  >
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
                        className="leading-relaxed"
                        style={{ color: bodyColor }}
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <span>{item.text}</span>
                    )}
                  </td>
                </RowWrapper>
              );
            })}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
