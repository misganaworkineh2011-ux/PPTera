"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { CircleContentItem } from "~/lib/layouts/content/circles";
import EditableText from "~/components/presentation/EditableText";

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
    y: 20,
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

interface ThemeStyles {
  segmentColors: string[];
  centerBg: string;
  centerBorder: string;
  cardBg: string;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
  numberColor: string;
}

function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const defaultAccent = accentColor || "#10b981";

  if (!theme) {
    return {
      segmentColors: [
        defaultAccent,
        `${defaultAccent}dd`,
        `${defaultAccent}bb`,
        `${defaultAccent}99`,
        `${defaultAccent}77`,
        `${defaultAccent}55`,
      ],
      centerBg: "#ffffff",
      centerBorder: "#e5e7eb",
      cardBg: "#ffffff",
      accentColor: defaultAccent,
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      numberColor: "#1e293b",
    };
  }

  const accent = accentColor || theme.colors.accent;
  
  // Generate gradient-like colors based on theme accent for workflow progression
  const segmentColors = [
    accent,
    theme.colors.secondary || `${accent}dd`,
    theme.colors.primary || `${accent}bb`,
    `${accent}99`,
    `${accent}77`,
    `${accent}55`,
  ];
  
  return {
    segmentColors,
    centerBg: theme.colors.background,
    centerBorder: theme.colors.border,
    cardBg: theme.cardBox?.background || theme.colors.background,
    accentColor: accent,
    titleColor: theme.colors.heading,
    bodyColor: theme.colors.textMuted,
    numberColor: theme.colors.heading,
  };
}

interface CircularWorkflowRendererProps {
  items: CircleContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  isPresenting?: boolean;
  animationKey?: string;
  centerText?: string;
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

export function CircularWorkflowRenderer({
  items,
  theme,
  accentColor = "#10b981",
  className = "",
  isPresenting = false,
  animationKey,
  centerText = "Workflow\nProcess\nStages",
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
}: CircularWorkflowRendererProps) {
  const displayItems = items.slice(0, 6);
  const themeStyles = getThemeStyles(theme, accentColor);
  const itemCount = Math.max(2, displayItems.length);

  // Layout constants
  const svgSize = 500;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const outerRadius = 200;
  const innerRadius = 130;
  const gapAngle = 4;
  const arrowHeadAngle = 25; // Degrees for the arrow head
  const arrowHeadOverhang = 15; // Head width matches shaft width in the image? 
  // In the image, the arrow head looks flush or slightly larger. Let's make it flush (0 overhang) but pointed.
  
  // Calculate segment paths (Arc Arrows)
  const getArrowPath = (index: number) => {
    const totalAngle = 360;
    const span = totalAngle / itemCount;
    const startAngle = index * span + gapAngle / 2 - 90;
    const endAngle = (index + 1) * span - gapAngle / 2 - 90;
    
    // Convert to radians
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    
    // Points
    // We want an arrow head at the END of the segment (clockwise).
    // The shaft ends at `endAngle - arrowHeadAngle`.
    
    const shaftEndAngle = endAngle - arrowHeadAngle;
    
    // Outer Arc Start
    const p1 = {
      x: centerX + outerRadius * Math.cos(toRad(startAngle)),
      y: centerY + outerRadius * Math.sin(toRad(startAngle))
    };
    
    // Outer Shaft End
    const p2 = {
      x: centerX + outerRadius * Math.cos(toRad(shaftEndAngle)),
      y: centerY + outerRadius * Math.sin(toRad(shaftEndAngle))
    };
    
    // Arrow Head Outer (can be same radius or larger)
    const p3 = {
      x: centerX + (outerRadius + arrowHeadOverhang) * Math.cos(toRad(shaftEndAngle)),
      y: centerY + (outerRadius + arrowHeadOverhang) * Math.sin(toRad(shaftEndAngle))
    };
    
    // Arrow Tip (at middle radius)
    const midRadius = (innerRadius + outerRadius) / 2;
    const p4 = {
      x: centerX + midRadius * Math.cos(toRad(endAngle)),
      y: centerY + midRadius * Math.sin(toRad(endAngle))
    };
    
    // Arrow Head Inner
    const p5 = {
      x: centerX + (innerRadius - arrowHeadOverhang) * Math.cos(toRad(shaftEndAngle)),
      y: centerY + (innerRadius - arrowHeadOverhang) * Math.sin(toRad(shaftEndAngle))
    };
    
    // Inner Shaft End
    const p6 = {
      x: centerX + innerRadius * Math.cos(toRad(shaftEndAngle)),
      y: centerY + innerRadius * Math.sin(toRad(shaftEndAngle))
    };
    
    // Inner Arc Start
    const p7 = {
      x: centerX + innerRadius * Math.cos(toRad(startAngle)),
      y: centerY + innerRadius * Math.sin(toRad(startAngle))
    };
    
    const largeArc = (shaftEndAngle - startAngle) > 180 ? 1 : 0;
    
    return `
      M ${p1.x} ${p1.y}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${p2.x} ${p2.y}
      L ${p3.x} ${p3.y}
      L ${p4.x} ${p4.y}
      L ${p5.x} ${p5.y}
      L ${p6.x} ${p6.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${p7.x} ${p7.y}
      Z
    `;
  };

  const getIconPosition = (index: number) => {
    const span = 360 / itemCount;
    // Icon at the start/tail of the arrow? Image shows icons near the tail.
    const angle = (index * span + span * 0.25) - 90; 
    const r = (innerRadius + outerRadius) / 2;
    return {
      x: centerX + r * Math.cos((angle * Math.PI) / 180),
      y: centerY + r * Math.sin((angle * Math.PI) / 180)
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? {
    key: animationKey,
    variants: containerVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: 'all 0.4s ease-out',
    };
  };

  return (
    <Container
      className={`w-full h-full flex items-center justify-center p-8 gap-12 ${className}`}
      {...containerProps}
    >
      {/* Left Side: Circular Arrow Diagram */}
      <div className="flex-shrink-0 relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ overflow: "visible" }}
        >
          {/* Segments */}
          {displayItems.map((item, index) => {
            const path = getArrowPath(index);
            const color = themeStyles.segmentColors[index % themeStyles.segmentColors.length];
            const iconPos = getIconPosition(index);
            
            return (
              <g key={`seg-${index}`} style={getSpotlightStyle(index)}>
                <path
                  d={path}
                  fill={color}
                  stroke={themeStyles.centerBg}
                  strokeWidth="3"
                />
                {/* Icon */}
                <g transform={`translate(${iconPos.x}, ${iconPos.y})`}>
                   {/* Circle background for icon? Image uses white outline icon on color background. */}
                   {item.icon ? (
                     <text
                       x="0"
                       y="0"
                       textAnchor="middle"
                       dominantBaseline="central"
                       fontSize="32"
                       fill={themeStyles.centerBg}
                       style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))" }}
                     >
                       {item.icon}
                     </text>
                   ) : (
                     <circle r="6" fill={themeStyles.centerBg} fillOpacity="0.8" />
                   )}
                </g>
              </g>
            );
          })}

          {/* Center Content */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius - 10}
            fill={themeStyles.centerBg}
            fillOpacity="0.9"
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="28"
            fontWeight="800"
            fill={themeStyles.titleColor}
            className="select-none"
          >
            {centerText.split('\n').map((line, i, arr) => (
              <tspan
                key={i}
                x={centerX}
                dy={i === 0 ? -(arr.length - 1) * 16 : 32}
              >
                {line}
              </tspan>
            ))}
          </text>
        </svg>
      </div>

      {/* Right Side: Grid Content */}
      <div 
        className="flex-1 h-full max-h-[600px] grid gap-x-8 gap-y-4 content-center"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "start",
        }}
      >
        {displayItems.map((item, index) => {
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};
          const color = themeStyles.segmentColors[index % themeStyles.segmentColors.length];
          
          return (
            <ItemWrapper
              key={index}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-100 flex flex-col gap-3 h-fit w-auto"
              style={{
                backgroundColor: themeStyles.cardBg,
                ...getSpotlightStyle(index)
              }}
              {...variantsProps}
            >
              <div className="flex items-center gap-3">
                {/* Arrow Header Badge */}
                <div 
                  className="relative h-10 px-4 pr-8 flex items-center font-bold text-sm uppercase tracking-wide shadow-sm"
                  style={{ 
                    backgroundColor: color,
                    color: themeStyles.centerBg,
                    clipPath: "polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)",
                    width: "fit-content",
                    minWidth: "120px"
                  }}
                >
                  {item.label && (
                    onStartEditLabel ? (
                       <div className="w-full">
                         <EditableText
                           value={item.label}
                           isEditing={isEditing && editingText?.field === `content-label-${index}`}
                           onStartEdit={() => onStartEditLabel(index)}
                           onChange={(val) => onUpdateLabel?.(index, val)}
                           onFinish={onFinishEditing || (() => {})}
                           className="w-full"
                           style={{ color: themeStyles.centerBg }}
                           isOwner={isOwner}
                         />
                       </div>
                    ) : (
                      <span className="truncate w-full">{item.label}</span>
                    )
                  )}
                </div>
                
                {/* Number */}
                <span 
                  className="text-2xl font-black opacity-80"
                  style={{ color: themeStyles.numberColor }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Body */}
              <div className="pl-1">
                {onStartEditText ? (
                  <EditableText
                    value={item.text}
                    isEditing={isEditing && editingText?.field === `content-text-${index}`}
                    onStartEdit={() => onStartEditText(index)}
                    onChange={(val) => onUpdateText?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="text-sm leading-relaxed"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                  />
                ) : (
                  <p className="text-sm leading-relaxed" style={{ color: themeStyles.bodyColor }}>
                    {item.text}
                  </p>
                )}
              </div>
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
