"use client";

import type { IconPlaceholder } from "~/lib/presentation/types";
import { type Theme } from "~/lib/themes";

interface IconRendererProps {
  icons: IconPlaceholder[];
  theme: Theme;
  size?: "sm" | "md" | "lg";
  layout?: "inline" | "vertical" | "grid";
}

/**
 * Renders icon placeholders for presentations
 * These placeholders can be replaced with actual icons from an API later
 */
export default function IconRenderer({ 
  icons, 
  theme, 
  size = "md",
  layout = "inline"
}: IconRendererProps) {
  if (!icons || icons.length === 0) {
    return null;
  }

  const accentColor = theme.colors.accent;

  // Size configurations
  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-base",
    lg: "w-10 h-10 text-lg",
  };

  // Layout configurations
  const layoutClasses = {
    inline: "flex flex-wrap gap-2",
    vertical: "flex flex-col gap-2",
    grid: "grid grid-cols-3 gap-2",
  };

  return (
    <div className={layoutClasses[layout]}>
      {icons.map((icon, i) => (
        <IconPlaceholderComponent 
          key={i}
          icon={icon}
          accentColor={accentColor}
          sizeClass={sizeClasses[size]}
        />
      ))}
    </div>
  );
}

// Individual icon placeholder component
function IconPlaceholderComponent({
  icon,
  accentColor,
  sizeClass
}: {
  icon: IconPlaceholder;
  accentColor: string;
  sizeClass: string;
}) {
  return (
    <div 
      className={`${sizeClass} rounded-lg flex items-center justify-center cursor-default`}
      style={{ 
        backgroundColor: `${accentColor}15`,
        border: `1px solid ${accentColor}30`,
      }}
      title={icon.name}
    >
      <span 
        className="select-none"
        style={{ color: accentColor }}
      >
        {icon.placeholder}
      </span>
    </div>
  );
}

/**
 * Render icons inline with bullet points
 */
export function IconsWithBullets({
  icons,
  bulletPoints,
  theme,
  renderBullet
}: {
  icons?: IconPlaceholder[];
  bulletPoints?: string[];
  theme: Theme;
  renderBullet: (point: string, icon?: IconPlaceholder) => React.ReactNode;
}) {
  const points = bulletPoints || [];
  const iconList = icons || [];

  return (
    <div className="space-y-2">
      {points.map((point, i) => (
        <div key={i} className="flex items-start gap-3">
          {iconList[i] && (
            <IconPlaceholderComponent 
              icon={iconList[i]}
              accentColor={theme.colors.accent}
              sizeClass="w-6 h-6 text-sm shrink-0 mt-0.5"
            />
          )}
          {renderBullet(point, iconList[i])}
        </div>
      ))}
    </div>
  );
}

