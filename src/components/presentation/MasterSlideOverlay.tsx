"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Theme } from "~/lib/themes";
import type {
  MasterSlideSettings,
  MasterPosition,
  FooterAlign,
  NumberFormat,
  MasterTextSize,
} from "~/components/presentation/types";

interface MasterSlideOverlayProps {
  settings?: MasterSlideSettings | null;
  /** 1-based number of this slide. */
  slideNumber: number;
  totalSlides: number;
  theme: Theme;
  /** When true (title slide), master elements are hidden if hideOnTitle is set. */
  isTitle?: boolean;
}

// Canvas is a fixed 1280x720; positions are absolute in that coordinate space and
// scale uniformly with the slide (SlideScaler's displayScale).
const DEFAULT_MARGIN = 40;

function positionStyle(position: MasterPosition, margin: number): CSSProperties {
  const style: CSSProperties = { position: "absolute" };
  const vert = position.startsWith("top") ? "top" : position.startsWith("bottom") ? "bottom" : "middle";
  const horiz = position.endsWith("left") ? "left" : position.endsWith("right") ? "right" : "center";
  const transforms: string[] = [];

  if (vert === "top") style.top = margin;
  else if (vert === "bottom") style.bottom = margin;
  else {
    style.top = "50%";
    transforms.push("translateY(-50%)");
  }

  if (horiz === "left") style.left = margin;
  else if (horiz === "right") style.right = margin;
  else {
    style.left = "50%";
    transforms.push("translateX(-50%)");
  }

  if (transforms.length) style.transform = transforms.join(" ");
  return style;
}

function alignToX(align: FooterAlign, margin: number): CSSProperties {
  switch (align) {
    case "left":
      return { left: margin, textAlign: "left" };
    case "right":
      return { right: margin, textAlign: "right" };
    case "center":
    default:
      return { left: "50%", transform: "translateX(-50%)", textAlign: "center" };
  }
}

const SIZE_PX: Record<MasterTextSize, number> = { sm: 14, md: 16, lg: 19 };

function resolve(color: string | undefined, fallback: string): string {
  return color && color !== "auto" ? color : fallback;
}

function formatNumber(
  format: NumberFormat | undefined,
  n: number,
  last: number,
): string {
  switch (format) {
    case "fraction":
      return `${n} / ${last}`;
    case "padded":
      return String(n).padStart(2, "0");
    case "labeled":
      return `Slide ${n}`;
    case "plain":
    default:
      return String(n);
  }
}

/**
 * Renders the persistent master-slide elements (accent bar, logo, footer, date,
 * slide number) on top of a slide. Lives inside SlideScaler's fixed 1280x720
 * canvas so it scales with the slide but is never shrunk by content fit-scaling.
 */
export default function MasterSlideOverlay({
  settings,
  slideNumber,
  totalSlides,
  theme,
  isTitle = false,
}: MasterSlideOverlayProps) {
  // Resolve "today" on the client only, to avoid SSR/client hydration mismatch.
  const [autoDate, setAutoDate] = useState("");
  useEffect(() => {
    setAutoDate(
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  if (!settings) return null;
  if (isTitle && settings.hideOnTitle) return null;

  const { logo, footer, slideNumbers, date, accentBar, statusTag } = settings;
  const margin = settings.margin ?? DEFAULT_MARGIN;

  const textColor = theme.colors?.text || "#334155";
  const themeAccent = theme.colors?.accent || theme.colors?.primary || "#6366f1";
  const bodyFont = theme.fonts?.body?.family || "inherit";

  const hasLogo = !!logo?.url;
  const hasFooter = !!footer?.show && !!footer.text?.trim();
  const hasNumbers = !!slideNumbers?.show;
  const hasDate = !!date?.show && (date.mode === "auto" || !!date.text?.trim());
  const hasBar = !!accentBar?.show;
  const hasTag = !!statusTag?.show && !!statusTag.text?.trim();

  if (!hasLogo && !hasFooter && !hasNumbers && !hasDate && !hasBar && !hasTag) return null;

  const startAt = slideNumbers?.startAt ?? 1;
  const displayNumber = slideNumber - 1 + startAt;
  const lastNumber = totalSlides - 1 + startAt;

  const dateText = date?.mode === "custom" ? date.text || "" : autoDate;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none">
      {/* Brand accent bar */}
      {hasBar && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            [accentBar!.position === "top" ? "top" : "bottom"]: 0,
            height: accentBar!.thickness ?? 6,
            backgroundColor: resolve(accentBar!.color, themeAccent),
          }}
        />
      )}

      {/* Logo */}
      {hasLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo!.url}
          alt="Logo"
          style={{
            ...positionStyle(logo!.position, margin),
            height: logo!.size,
            width: "auto",
            maxWidth: 340,
            objectFit: "contain",
            opacity: logo!.opacity,
          }}
        />
      )}

      {/* Footer */}
      {hasFooter && (
        <div
          style={{
            position: "absolute",
            bottom: margin,
            ...alignToX(footer!.align, margin),
            color: resolve(footer!.color, textColor),
            opacity: footer!.color && footer!.color !== "auto" ? 1 : 0.72,
            fontSize: footer!.fontSize ?? SIZE_PX[footer!.size || "md"],
            fontWeight: 500,
            letterSpacing: "0.01em",
            maxWidth: footer!.align === "center" ? "50%" : "40%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: bodyFont,
          }}
        >
          {footer!.text}
        </div>
      )}

      {/* Date */}
      {hasDate && (
        <div
          style={{
            position: "absolute",
            bottom: margin,
            ...alignToX(date!.align, margin),
            color: resolve(date!.color, textColor),
            opacity: date!.color && date!.color !== "auto" ? 1 : 0.66,
            fontSize: date!.fontSize ?? 15,
            fontWeight: 500,
            fontFamily: bodyFont,
            whiteSpace: "nowrap",
          }}
        >
          {dateText}
        </div>
      )}

      {/* Slide number */}
      {hasNumbers && (
        <div
          style={{
            position: "absolute",
            bottom: margin,
            ...alignToX(slideNumbers!.align, margin),
            color: resolve(slideNumbers!.color, textColor),
            opacity: slideNumbers!.color && slideNumbers!.color !== "auto" ? 1 : 0.6,
            fontSize: slideNumbers!.fontSize ?? 15,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            fontFamily: bodyFont,
            whiteSpace: "nowrap",
          }}
        >
          {formatNumber(slideNumbers!.format, displayNumber, lastNumber)}
        </div>
      )}

      {/* Status / confidentiality tag */}
      {hasTag && (
        <div
          style={{
            ...positionStyle(statusTag!.position, margin),
            backgroundColor: resolve(statusTag!.color, themeAccent),
            color: "#ffffff",
            padding: "7px 16px",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: bodyFont,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          {statusTag!.text}
        </div>
      )}
    </div>
  );
}
