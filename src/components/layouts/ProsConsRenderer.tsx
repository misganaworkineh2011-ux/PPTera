"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { ProsConsContentItem } from "~/lib/layouts/content/proscons";
import { splitProsAndCons } from "~/lib/layouts/content/proscons";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
};

// --- Styles & Colors ---
interface ThemeStyles {
  prosColor: string;
  consColor: string;
  titleColor: string;
  bodyColor: string;
  trackBg: string;
  trackBorder: string;
}

function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  // Use theme colors instead of hardcoded values
  const primaryColor = accentColor || theme?.colors.accent || "#009688";
  const secondaryColor = theme?.colors.secondary || theme?.colors.primary || "#ff8a65";

  return {
    prosColor: primaryColor,
    consColor: secondaryColor,
    titleColor: theme?.colors.heading || "#1e293b",
    bodyColor: theme?.colors.textMuted || "#64748b",
    // Theme-aware pill track (was hardcoded bg-gray-100 — broke on dark themes)
    trackBg:
      theme?.cardBox?.background ||
      theme?.colors.surface ||
      "rgba(148,163,184,0.14)",
    trackBorder: theme?.colors.border || "rgba(0,0,0,0.06)",
  };
}

// --- Icons for Center Diagram ---
const ChatIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="9" cy="10" r="1" fill="white" stroke="none" />
    <circle cx="12" cy="10" r="1" fill="white" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="white" stroke="none" />
  </svg>
);

const MobileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <path d="M12 18h.01" />
    <path d="M17 6H7" /> 
    {/* Added a small chat bubble overlay to match reference feeling */}
    <path d="M17 14l3-3V8a2 2 0 0 0-2-2h-2" strokeWidth="1.5" className="opacity-80"/> 
  </svg>
);

interface ProsConsRendererProps {
  items: ProsConsContentItem[];
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

export function ProsConsRenderer({
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
}: ProsConsRendererProps) {
  const themeStyles = getThemeStyles(theme, accentColor);
  const { pros, cons } = splitProsAndCons(items);

  // Ensure we display enough items to fill the lists (up to 6 per side to match layout)
  const displayPros = pros.slice(0, 6);
  const displayCons = cons.slice(0, 6);

  if (layoutId && layoutId.startsWith("proscons-style-")) {
    return (
      <ExtendedProsCons
        layoutId={layoutId}
        pros={displayPros}
        cons={displayCons}
        themeStyles={themeStyles}
        className={className}
        isPresenting={isPresenting}
        animationKey={animationKey}
        itemAnimation={itemAnimation}
        revealCount={revealCount}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        onDeleteItem={onDeleteItem}
        isOwner={isOwner}
        isHovered={isHovered}
        spotlightIndex={spotlightIndex}
        isSpotlightMode={isSpotlightMode}
      />
    );
  }

  const Container = isPresenting ? motion.div : "div";
  const ItemWrapper = isPresenting ? motion.div : "div";

  // --- SVG Paths for Puzzle Circle ---
  // Size 300x300. 
  // Left side (Teal): Has a "male" bump on top, "female" slot on bottom.
  // Right side (Orange): Has "female" slot on top, "male" bump on bottom.
  const center = 150;
  const r = 150;
  
  // Left Path (Teal)
  // Start Top Center -> Bump Out (Right) -> Center -> Bump In (Left) -> Bottom Center -> Arc around left
  const leftPath = `
    M ${center},0 
    L ${center},50 
    C ${center + 40},50 ${center + 40},100 ${center},100
    L ${center},200
    C ${center - 40},200 ${center - 40},250 ${center},250
    L ${center},300
    A ${r},${r} 0 0 1 ${center},0
    Z
  `;

  // Right Path (Orange)
  // Exact inverse of the left path logic for the middle seam
  const rightPath = `
    M ${center},0 
    L ${center},50 
    C ${center + 40},50 ${center + 40},100 ${center},100
    L ${center},200
    C ${center - 40},200 ${center - 40},250 ${center},250
    L ${center},300
    A ${r},${r} 0 0 0 ${center},0
    Z
  `;

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
    };
  };

  return (
    <Container 
      className={`w-full max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 ${className}`}
      key={animationKey}
      variants={containerVariants}
      initial={isPresenting ? "hidden" : undefined}
      animate={isPresenting ? "visible" : undefined}
    >
      
      {/* --- LEFT SECTION (Pros) --- */}
      <div className="flex-1 flex gap-4 w-full justify-end">
        {/* Text Column */}
        <div className="flex flex-col gap-6 py-4 flex-1">
          {displayPros.map((item, index) => (
            <ItemWrapper 
              key={`pro-text-${index}`}
              variants={itemVariants}
              className="flex flex-col items-end text-right h-12 justify-center" // Fixed height to align with pills
              style={getSpotlightStyle(index)}
            >
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-bold text-xs md:text-sm leading-tight text-gray-800"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h4
                    className="font-bold text-xs md:text-sm leading-tight"
                    style={{ color: themeStyles.titleColor }}
                  >
                    {item.label}
                  </h4>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${index}`}
                  onStartEdit={() => onStartEditText(index)}
                  onChange={(val) => onUpdateText?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-[10px] md:text-xs leading-tight opacity-75 mt-0.5"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-[10px] md:text-xs leading-tight opacity-75 mt-0.5" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </ItemWrapper>
          ))}
        </div>

        {/* Number Pill Column (Left) */}
        <div
          className="hidden md:flex flex-col items-center rounded-full py-4 px-1.5 gap-6 h-fit shrink-0 border"
          style={{
            backgroundColor: themeStyles.trackBg,
            borderColor: themeStyles.trackBorder,
          }}
        >
          {displayPros.map((_, index) => (
            <ItemWrapper
              key={`pro-num-${index}`}
              variants={itemVariants}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 tabular-nums"
              style={{
                background: `linear-gradient(135deg, ${themeStyles.prosColor}, ${alpha(themeStyles.prosColor, "cc")})`,
                boxShadow: `0 4px 12px ${alpha(themeStyles.prosColor, "59")}`,
                letterSpacing: "-0.02em",
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </ItemWrapper>
          ))}
        </div>
      </div>


      {/* --- CENTER SECTION (Diagram) --- */}
      <div 
        className="shrink-0 relative w-[220px] h-[220px] md:w-[300px] md:h-[300px]"
      >
        <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-xl">
          {/* Left Piece (Teal) */}
          <path d={leftPath} fill={themeStyles.prosColor} />
          
          {/* Right Piece (Orange) */}
          <path d={rightPath} fill={themeStyles.consColor} />
          
          {/* Center Hole */}
          <circle cx={center} cy={center} r="50" fill="white" />
        </svg>

        {/* Labels Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Pros Label */}
          <div className="absolute top-[35%] left-[20%] text-center flex flex-col items-center">
            <div className="mb-2"><ChatIcon /></div>
            <span className="text-white text-xl md:text-2xl font-bold tracking-wide">Pros</span>
          </div>

          {/* Cons Label */}
          <div className="absolute bottom-[35%] right-[20%] text-center flex flex-col items-center">
            <span className="text-white text-xl md:text-2xl font-bold tracking-wide mb-2">Cons</span>
            <div><MobileIcon /></div>
          </div>
        </div>
      </div>


      {/* --- RIGHT SECTION (Cons) --- */}
      <div className="flex-1 flex gap-4 w-full justify-start">
        {/* Number Pill Column (Right) */}
        <div
          className="hidden md:flex flex-col items-center rounded-full py-4 px-1.5 gap-6 h-fit shrink-0 border"
          style={{
            backgroundColor: themeStyles.trackBg,
            borderColor: themeStyles.trackBorder,
          }}
        >
          {displayCons.map((_, index) => (
            <ItemWrapper
              key={`con-num-${index}`}
              variants={itemVariants}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 tabular-nums"
              style={{
                background: `linear-gradient(135deg, ${themeStyles.consColor}, ${alpha(themeStyles.consColor, "cc")})`,
                boxShadow: `0 4px 12px ${alpha(themeStyles.consColor, "59")}`,
                letterSpacing: "-0.02em",
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </ItemWrapper>
          ))}
        </div>

        {/* Text Column */}
        <div className="flex flex-col gap-6 py-4 flex-1">
          {displayCons.map((item, index) => (
            <ItemWrapper 
              key={`con-text-${index}`}
              variants={itemVariants}
              className="flex flex-col items-start text-left h-12 justify-center"
              style={getSpotlightStyle(displayPros.length + index)}
            >
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${displayPros.length + index}`}
                    onStartEdit={() => onStartEditLabel(displayPros.length + index)}
                    onChange={(val) => onUpdateLabel?.(displayPros.length + index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-bold text-xs md:text-sm leading-tight text-gray-800"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h4
                    className="font-bold text-xs md:text-sm leading-tight"
                    style={{ color: themeStyles.titleColor }}
                  >
                    {item.label}
                  </h4>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${displayPros.length + index}`}
                  onStartEdit={() => onStartEditText(displayPros.length + index)}
                  onChange={(val) => onUpdateText?.(displayPros.length + index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-[10px] md:text-xs leading-tight opacity-75 mt-0.5"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-[10px] md:text-xs leading-tight opacity-75 mt-0.5" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </ItemWrapper>
          ))}
        </div>
      </div>

    </Container>
  );
}

// Styles 2-12: additional pros/cons treatments (columns, scale, ledger, VS, etc.)
function ExtendedProsCons({
  layoutId,
  pros,
  cons,
  themeStyles,
  className,
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
}: {
  layoutId: string;
  pros: ProsConsContentItem[];
  cons: ProsConsContentItem[];
  themeStyles: ThemeStyles;
  className: string;
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
}) {
  const proC = themeStyles.prosColor;
  const conC = themeStyles.consColor;
  const titleColor = themeStyles.titleColor;
  const bodyColor = themeStyles.bodyColor;
  const surface = themeStyles.trackBg;
  const border = themeStyles.trackBorder;

  const Container = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const CItem = isPresenting ? motion.div : "div";
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const spot = (i: number): React.CSSProperties =>
    isSpotlightMode && spotlightIndex !== undefined ? { opacity: spotlightIndex === i ? 1 : 0.3, transition: "all 0.4s ease-out" } : {};

  const gPro = (i: number) => i;
  const gCon = (i: number) => pros.length + i;

  const eLabel = (item: ProsConsContentItem, g: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${g}`}
          onStartEdit={() => onStartEditLabel(g)} onChange={(val) => onUpdateLabel?.(g, val)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(g) : undefined}
          className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h4 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h4>
      )
    ) : null;
  const eText = (item: ProsConsContentItem, g: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${g}`}
        onStartEdit={() => onStartEditText(g)} onChange={(val) => onUpdateText?.(g, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(g) : undefined}
        className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );

  const marker = (side: "pros" | "cons", cls = "h-5 w-5 text-[11px]") => (
    <span className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${cls}`} style={{ background: side === "pros" ? proC : conC }}>
      {side === "pros" ? "✓" : "✕"}
    </span>
  );

  const rows = (arr: ProsConsContentItem[], side: "pros" | "cons", opts: { markerCls?: string; rowCls?: string } = {}) =>
    arr.map((item, i) => {
      const g = side === "pros" ? gPro(i) : gCon(i);
      return (
        <CItem key={i} className={`flex items-start gap-2.5 min-w-0 ${opts.rowCls || ""}`} style={spot(g)} {...itemMotion(g)}>
          {marker(side, opts.markerCls)}
          <div className="min-w-0 flex-1">{eLabel(item, g, "text-sm font-bold leading-tight")}{eText(item, g, "text-xs leading-snug break-words")}</div>
        </CItem>
      );
    });

  const header = (side: "pros" | "cons", label: string) => (
    <div className="mb-3 flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: alpha(side === "pros" ? proC : conC, "1a") }}>
      {marker(side, "h-5 w-5 text-[11px]")}
      <span className="text-sm font-extrabold uppercase tracking-wide" style={{ color: side === "pros" ? proC : conC }}>{label}</span>
    </div>
  );

  const frame = `w-full h-full flex flex-col justify-center px-6 ${className}`;

  // == STYLE-2: TWO COLUMNS
  if (layoutId === "proscons-style-2") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-8">
          <div>{header("pros", "Pros")}<div className="flex flex-col gap-3">{rows(pros, "pros")}</div></div>
          <div>{header("cons", "Cons")}<div className="flex flex-col gap-3">{rows(cons, "cons")}</div></div>
        </div>
      </Container>
    );
  }

  // == STYLE-3: BALANCE SCALE
  if (layoutId === "proscons-style-3") {
    const tilt = Math.max(-8, Math.min(8, (cons.length - pros.length) * 4));
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto mb-4 w-full max-w-md">
          <svg viewBox="0 0 200 90" className="w-full" aria-hidden>
            <line x1={100} y1={16} x2={100} y2={78} stroke={alpha(titleColor, "40")} strokeWidth={3} strokeLinecap="round" />
            <g transform={`rotate(${tilt} 100 16)`}>
              <line x1={30} y1={16} x2={170} y2={16} stroke={titleColor} strokeWidth={3} strokeLinecap="round" />
              <line x1={30} y1={16} x2={30} y2={34} stroke={alpha(proC, "80")} strokeWidth={1.5} />
              <line x1={170} y1={16} x2={170} y2={34} stroke={alpha(conC, "80")} strokeWidth={1.5} />
              <path d="M 14 34 A 16 10 0 0 0 46 34 Z" fill={proC} />
              <path d="M 154 34 A 16 10 0 0 0 186 34 Z" fill={conC} />
              <text x={30} y={30} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff">{pros.length}</text>
              <text x={170} y={30} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff">{cons.length}</text>
            </g>
            <circle cx={100} cy={80} r={5} fill={titleColor} />
          </svg>
        </div>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-8">
          <div className="flex flex-col gap-2.5">{rows(pros, "pros")}</div>
          <div className="flex flex-col gap-2.5">{rows(cons, "cons")}</div>
        </div>
      </Container>
    );
  }

  // == STYLE-4: LEDGER
  if (layoutId === "proscons-style-4") {
    const ledgerRows = (arr: ProsConsContentItem[], side: "pros" | "cons") =>
      arr.map((item, i) => {
        const g = side === "pros" ? gPro(i) : gCon(i);
        return (
          <CItem key={i} className="flex items-start gap-3 border-b py-2.5 min-w-0" style={{ borderColor: alpha(bodyColor, "1a"), ...spot(g) }} {...itemMotion(g)}>
            <span className="text-lg font-black leading-none" style={{ color: side === "pros" ? proC : conC }}>{side === "pros" ? "+" : "–"}</span>
            <div className="min-w-0 flex-1">{eLabel(item, g, "text-sm font-bold leading-tight")}{eText(item, g, "text-xs leading-snug break-words")}</div>
          </CItem>
        );
      });
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-8">
          <div><div className="mb-1 text-sm font-extrabold uppercase tracking-wider" style={{ color: proC }}>Pros</div>{ledgerRows(pros, "pros")}</div>
          <div><div className="mb-1 text-sm font-extrabold uppercase tracking-wider" style={{ color: conC }}>Cons</div>{ledgerRows(cons, "cons")}</div>
        </div>
      </Container>
    );
  }

  // == STYLE-5: VS SPLIT
  if (layoutId === "proscons-style-5") {
    return (
      <Container className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`} key={animationKey} {...cProps}>
        <div className="absolute inset-0" style={{ background: alpha(proC, "14"), clipPath: "polygon(0 0, 58% 0, 42% 100%, 0 100%)" }} aria-hidden />
        <div className="absolute inset-0" style={{ background: alpha(conC, "14"), clipPath: "polygon(58% 0, 100% 0, 100% 100%, 42% 100%)" }} aria-hidden />
        <div className="relative grid w-full max-w-4xl grid-cols-2 gap-10 px-8">
          <div className="flex flex-col gap-2.5">{header("pros", "Pros")}{rows(pros, "pros")}</div>
          <div className="flex flex-col gap-2.5">{header("cons", "Cons")}{rows(cons, "cons")}</div>
        </div>
        <span className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${proC}, ${conC})`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>VS</span>
      </Container>
    );
  }

  // == STYLE-6: THUMBS
  if (layoutId === "proscons-style-6") {
    const col = (arr: ProsConsContentItem[], side: "pros" | "cons", emoji: string, label: string) => (
      <div className="flex-1">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="text-base font-extrabold uppercase tracking-wide" style={{ color: side === "pros" ? proC : conC }}>{label}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {arr.map((item, i) => {
            const g = side === "pros" ? gPro(i) : gCon(i);
            return (
              <CItem key={i} className="rounded-xl px-4 py-2.5 min-w-0" style={{ background: alpha(side === "pros" ? proC : conC, "14"), border: `1px solid ${alpha(side === "pros" ? proC : conC, "2e")}`, ...spot(g) }} {...itemMotion(g)}>
                {eLabel(item, g, "text-sm font-bold leading-tight")}{eText(item, g, "text-xs leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </div>
    );
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl gap-8">{col(pros, "pros", "👍", "Pros")}{col(cons, "cons", "👎", "Cons")}</div>
      </Container>
    );
  }

  // == STYLE-7: CHECKLIST DUO
  if (layoutId === "proscons-style-7") {
    const card = (arr: ProsConsContentItem[], side: "pros" | "cons", label: string) => (
      <div className="ppt-tile flex-1 rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}`, borderTop: `3px solid ${side === "pros" ? proC : conC}` }}>
        {header(side, label)}
        <div className="flex flex-col gap-3">{rows(arr, side)}</div>
      </div>
    );
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl gap-6">{card(pros, "pros", "Pros")}{card(cons, "cons", "Cons")}</div>
      </Container>
    );
  }

  // == STYLE-8: WEIGHTED BARS
  if (layoutId === "proscons-style-8") {
    const total = Math.max(pros.length + cons.length, 1);
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-5 flex h-8 overflow-hidden rounded-full" style={{ border: `1px solid ${border}` }}>
            <div className="flex items-center justify-center text-xs font-extrabold text-white" style={{ width: `${(pros.length / total) * 100}%`, background: proC }}>{pros.length}</div>
            <div className="flex items-center justify-center text-xs font-extrabold text-white" style={{ width: `${(cons.length / total) * 100}%`, background: conC }}>{cons.length}</div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2.5">{rows(pros, "pros")}</div>
            <div className="flex flex-col gap-2.5">{rows(cons, "cons")}</div>
          </div>
        </div>
      </Container>
    );
  }

  // == STYLE-9: CARD STACKS
  if (layoutId === "proscons-style-9") {
    const stack = (arr: ProsConsContentItem[], side: "pros" | "cons", label: string) => (
      <div className="flex-1">
        <div className="mb-3 text-sm font-extrabold uppercase tracking-wider" style={{ color: side === "pros" ? proC : conC }}>{label}</div>
        <div className="flex flex-col gap-2">
          {arr.map((item, i) => {
            const g = side === "pros" ? gPro(i) : gCon(i);
            return (
              <CItem key={i} className="rounded-xl px-4 py-2.5 min-w-0" style={{ background: `linear-gradient(135deg, ${alpha(side === "pros" ? proC : conC, "24")}, ${alpha(side === "pros" ? proC : conC, "0d")})`, border: `1px solid ${alpha(side === "pros" ? proC : conC, "33")}`, marginLeft: `${i * 6}px`, ...spot(g) }} {...itemMotion(g)}>
                {eLabel(item, g, "text-sm font-bold leading-tight")}{eText(item, g, "text-xs leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </div>
    );
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl gap-8">{stack(pros, "pros", "Pros")}{stack(cons, "cons", "Cons")}</div>
      </Container>
    );
  }

  // == STYLE-10: PLUS/MINUS GRID
  if (layoutId === "proscons-style-10") {
    const n = Math.max(pros.length, cons.length);
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2.5">
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              {pros[i] ? (
                <CItem className="flex items-start gap-2.5 rounded-lg px-3 py-2 min-w-0" style={{ background: alpha(proC, "12"), ...spot(gPro(i)) }} {...itemMotion(gPro(i))}>{marker("pros")}<div className="min-w-0">{eLabel(pros[i]!, gPro(i), "text-sm font-bold leading-tight")}{eText(pros[i]!, gPro(i), "text-xs leading-snug break-words")}</div></CItem>
              ) : <div />}
              {cons[i] ? (
                <CItem className="flex items-start gap-2.5 rounded-lg px-3 py-2 min-w-0" style={{ background: alpha(conC, "12"), ...spot(gCon(i)) }} {...itemMotion(gCon(i))}>{marker("cons")}<div className="min-w-0">{eLabel(cons[i]!, gCon(i), "text-sm font-bold leading-tight")}{eText(cons[i]!, gCon(i), "text-xs leading-snug break-words")}</div></CItem>
              ) : <div />}
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-11: TUG OF WAR
  if (layoutId === "proscons-style-11") {
    const total = Math.max(pros.length + cons.length, 1);
    const knot = (pros.length / total) * 100;
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative mb-6 flex items-center">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: proC }}>{pros.length}</span>
            <div className="relative mx-2 h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${proC}, ${conC})` }}>
              <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${knot}%`, background: titleColor, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: conC }}>{cons.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2.5">{rows(pros, "pros")}</div>
            <div className="flex flex-col gap-2.5">{rows(cons, "cons")}</div>
          </div>
        </div>
      </Container>
    );
  }

  // == STYLE-12: STICKY COLUMNS
  if (layoutId === "proscons-style-12") {
    const rot = ["-1.2deg", "1deg", "-0.8deg", "1.4deg", "-1deg", "0.8deg"];
    const col = (arr: ProsConsContentItem[], side: "pros" | "cons", label: string) => (
      <div className="flex-1">
        <div className="mb-3 text-sm font-extrabold uppercase tracking-wider" style={{ color: side === "pros" ? proC : conC }}>{label}</div>
        <div className="flex flex-col gap-3">
          {arr.map((item, i) => {
            const g = side === "pros" ? gPro(i) : gCon(i);
            return (
              <CItem key={i} className="px-4 py-3 min-w-0" style={{ background: `linear-gradient(160deg, ${alpha(side === "pros" ? proC : conC, "2e")}, ${alpha(side === "pros" ? proC : conC, "14")})`, borderRadius: 4, transform: `rotate(${rot[i % 6]})`, boxShadow: "0 6px 14px -8px rgba(0,0,0,0.4)", ...spot(g) }} {...itemMotion(g)}>
                {eLabel(item, g, "text-sm font-bold leading-tight")}{eText(item, g, "text-xs leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </div>
    );
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="mx-auto flex w-full max-w-4xl gap-8">{col(pros, "pros", "Pros")}{col(cons, "cons", "Cons")}</div>
      </Container>
    );
  }

  return null;
}