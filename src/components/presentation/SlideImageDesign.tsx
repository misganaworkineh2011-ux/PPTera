"use client";

import type { CSSProperties, ReactNode } from "react";
import type { SlideImage } from "./types";
import type { ImageShape } from "~/lib/layouts/slide";
import { isDesignImageShape } from "~/lib/layouts/slide";
import SlideImg from "./SlideImage";

/**
 * SlideImageDesign — creative framed treatments for the slide image column.
 *
 * Legacy edge shapes (rectangle/rounded/arc/wave) render the image full-bleed
 * and let the host column's clip-path shape the content-facing edge. The design
 * shapes float the image inside the column with a styled, theme-accent frame:
 * gallery frame, arch window, portal ring, layered echo, polaroid, slats,
 * organic blob, corner cut, duotone wash, editorial L-frame.
 */
interface SlideImageDesignProps {
  image: SlideImage;
  alt: string;
  shape: ImageShape;
  /** Where the image column sits relative to content. top/bottom = wide banner. */
  orientation: "left" | "right" | "top" | "bottom";
  /** Theme accent color (hex, e.g. "#f59e0b"). */
  accent: string;
  isDark: boolean;
  imgCursor?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLImageElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLImageElement>) => void;
}

export default function SlideImageDesign({
  image,
  alt,
  shape,
  orientation,
  accent,
  isDark,
  imgCursor = "default",
  draggable,
  onDragStart,
  onDragEnd,
}: SlideImageDesignProps) {
  const isBanner = orientation === "top" || orientation === "bottom";

  const img = (extraClass = "", extraStyle?: CSSProperties) => (
    <SlideImg
      image={image}
      alt={alt}
      className={`absolute inset-0 w-full h-full object-cover ${extraClass}`}
      style={{ cursor: imgCursor, ...extraStyle }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );

  // Legacy edge shapes: full-bleed, host clip-path does the styling.
  if (!isDesignImageShape(shape)) {
    return (
      <SlideImg
        image={image}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ display: "block", minHeight: "100%", cursor: imgCursor }}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    );
  }

  const deepShadow = isDark
    ? "0 24px 60px -18px rgba(0,0,0,0.65)"
    : "0 24px 55px -20px rgba(15,23,42,0.35)";

  // Side columns are stretched by the host flex row, so `absolute inset-0`
  // treatments fill them. Banner (top/bottom) hosts are auto-height — an
  // absolute-only child would collapse them to 0, so give banners an in-flow
  // aspect box (~38% of a 16:9 slide at full width) for the treatment to fill.
  const wrap = (node: ReactNode) =>
    isBanner ? <div className="relative w-full aspect-[40/9]">{node}</div> : node;

  // ---- Gallery Frame: inset, rounded, hairline accent border + offset outline
  if (shape === "frame") {
    return wrap(
      <div className={`absolute inset-0 flex items-center justify-center ${isBanner ? "px-[6%] py-[7%]" : "p-[8%]"}`}>
        <div className="relative w-full h-full">
          <div
            className="absolute -inset-2.5 rounded-[22px] border pointer-events-none"
            style={{ borderColor: `${accent}38` }}
          />
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${accent}55`, boxShadow: deepShadow }}
          >
            {img()}
          </div>
        </div>
      </div>
    );
  }

  // ---- Arch Window: fully rounded top (side) / wide arch (banner)
  if (shape === "archway") {
    const radius = isBanner
      ? orientation === "top"
        ? "24px 24px 240px 240px"
        : "240px 240px 24px 24px"
      : "999px 999px 22px 22px";
    return wrap(
      <div className={`absolute inset-0 flex items-center justify-center ${isBanner ? "px-[8%] py-[6%]" : "px-[9%] py-[6%]"}`}>
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 border-[1.5px] pointer-events-none"
            style={{
              borderColor: `${accent}59`,
              borderRadius: radius,
              transform: isBanner ? "translate(0px, 8px)" : "translate(10px, -10px)",
            }}
          />
          <div
            className="relative w-full h-full overflow-hidden"
            style={{ borderRadius: radius, boxShadow: deepShadow }}
          >
            {img()}
          </div>
        </div>
      </div>
    );
  }

  // ---- Portal: circle (side) / capsule (banner) with accent ring + dot
  if (shape === "portal") {
    return wrap(
      <div className="absolute inset-0 flex items-center justify-center p-[6%]">
        <div
          className={`relative ${isBanner ? "h-[86%] w-[64%]" : "w-[78%] aspect-square max-h-[86%]"}`}
        >
          <div
            className="absolute -inset-3 rounded-full border-2 pointer-events-none"
            style={{ borderColor: `${accent}59` }}
          />
          <div
            className="absolute -inset-3 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(closest-side, transparent 78%, ${accent}1F 100%)` }}
          />
          <div
            className="absolute top-[4%] right-[4%] w-3 h-3 rounded-full z-10 pointer-events-none"
            style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}99` }}
          />
          <div className="relative w-full h-full rounded-full overflow-hidden" style={{ boxShadow: deepShadow }}>
            {img()}
          </div>
        </div>
      </div>
    );
  }

  // ---- Layered Echo: solid accent panel + outline echo offset behind
  if (shape === "layered") {
    return wrap(
      <div className={`absolute inset-0 ${isBanner ? "px-[7%] py-[9%]" : "p-[10%]"}`}>
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ backgroundColor: `${accent}30`, transform: "translate(5.5%, 7%)" }}
          />
          <div
            className="absolute inset-0 rounded-xl border pointer-events-none"
            style={{ borderColor: `${accent}66`, transform: "translate(-4%, -5.5%)" }}
          />
          <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ boxShadow: deepShadow }}>
            {img()}
          </div>
        </div>
      </div>
    );
  }

  // ---- Polaroid: white matte, thick bottom, slight tilt
  if (shape === "polaroid") {
    return wrap(
      <div className="absolute inset-0 flex items-center justify-center p-[6%]">
        <div
          className={`relative bg-white rounded-[6px] ${isBanner ? "w-[88%] h-[86%] p-[1.6%] pb-[4.5%]" : "w-[86%] h-[84%] p-[4%] pb-[13%]"}`}
          style={{
            transform: `rotate(${isBanner ? 0.8 : 1.8}deg)`,
            boxShadow: isDark
              ? "0 26px 60px -16px rgba(0,0,0,0.75)"
              : "0 26px 55px -18px rgba(15,23,42,0.4)",
          }}
        >
          <div className="relative w-full h-full overflow-hidden rounded-[2px]">{img()}</div>
        </div>
      </div>
    );
  }

  // ---- Slats: the image split into three parallel strips
  if (shape === "slats") {
    const positions = ["12% 50%", "50% 50%", "88% 50%"];
    return wrap(
      <div className={`absolute inset-0 flex flex-row items-stretch gap-[4%] ${isBanner ? "px-[7%] py-[8%]" : "p-[8%]"}`}>
        {positions.map((pos, i) => (
          <div
            key={i}
            className={`relative flex-1 overflow-hidden rounded-[14px] ${i === 1 ? "" : "self-center h-[84%]"}`}
            style={{
              boxShadow: deepShadow,
              border: `1px solid ${accent}${i === 1 ? "55" : "2E"}`,
            }}
          >
            {img("", { objectPosition: pos })}
          </div>
        ))}
      </div>
    );
  }

  // ---- Organic: soft blob mask with blurred accent echo
  if (shape === "organic") {
    const blob = "58% 42% 55% 45% / 52% 48% 60% 40%";
    return wrap(
      <div className="absolute inset-0 flex items-center justify-center p-[6%]">
        <div className={`relative ${isBanner ? "w-[80%] h-[88%]" : "w-[92%] h-[82%]"}`}>
          <div
            className="absolute inset-0 blur-2xl pointer-events-none"
            style={{ backgroundColor: `${accent}40`, borderRadius: blob, transform: "translate(6%, 9%) scale(0.98)" }}
          />
          <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: blob }}>
            {img()}
          </div>
        </div>
      </div>
    );
  }

  // ---- Corner Cut: bold diagonal corner + accent wedge
  if (shape === "cornercut") {
    // Cut the bottom corner nearest the content side.
    const cutLeft = orientation === "right" || orientation === "bottom";
    const clip = cutLeft
      ? "polygon(0 0, 100% 0, 100% 100%, 24% 100%, 0 78%)"
      : "polygon(0 0, 100% 0, 100% 78%, 76% 100%, 0 100%)";
    const wedgeClip = cutLeft
      ? "polygon(0 0, 0 100%, 100% 100%)"
      : "polygon(100% 0, 100% 100%, 0 100%)";
    return wrap(
      <div className={`absolute inset-0 ${isBanner ? "px-[6%] py-[8%]" : "p-[7%]"}`}>
        <div className="relative w-full h-full">
          <div
            className={`absolute bottom-0 w-[26%] h-[24%] pointer-events-none ${cutLeft ? "left-0" : "right-0"}`}
            style={{ backgroundColor: `${accent}B3`, clipPath: wedgeClip }}
          />
          <div
            className="relative w-full h-full overflow-hidden rounded-lg"
            style={{ clipPath: clip, boxShadow: deepShadow }}
          >
            {img()}
          </div>
        </div>
      </div>
    );
  }

  // ---- Duotone: accent gradient wash + signature bar
  if (shape === "duotone") {
    return wrap(
      <div className={`absolute inset-0 ${isBanner ? "px-[6%] py-[7%]" : "p-[7%]"}`}>
        <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ boxShadow: deepShadow }}>
          {img("", { filter: "saturate(0.85)" })}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${accent}D9 0%, ${accent}40 42%, transparent 72%)`,
              mixBlendMode: isDark ? "screen" : "multiply",
              opacity: 0.8,
            }}
          />
          <div
            className="absolute bottom-[7%] left-[7%] h-1.5 w-[32%] rounded-full pointer-events-none"
            style={{ backgroundColor: accent }}
          />
        </div>
      </div>
    );
  }

  // ---- L-Frame: editorial thick accent L on two edges + corner mark
  if (shape === "lframe") {
    return wrap(
      <div className={`absolute inset-0 ${isBanner ? "px-[7%] py-[10%]" : "p-[10%]"}`}>
        <div className="relative w-full h-full">
          <div
            className="absolute -left-3 -bottom-3 w-[9px] h-[74%] pointer-events-none"
            style={{ backgroundColor: accent }}
          />
          <div
            className="absolute -left-3 -bottom-3 h-[9px] w-[64%] pointer-events-none"
            style={{ backgroundColor: accent }}
          />
          <div
            className="absolute -right-2 -top-2 w-4 h-4 border-t-2 border-r-2 pointer-events-none"
            style={{ borderColor: `${accent}80` }}
          />
          <div className="relative w-full h-full overflow-hidden rounded-[4px]" style={{ boxShadow: deepShadow }}>
            {img()}
          </div>
        </div>
      </div>
    );
  }

  // Unknown design shape: safe full-bleed fallback.
  return (
    <SlideImg
      image={image}
      alt={alt}
      className="w-full h-full object-cover"
      style={{ display: "block", minHeight: "100%", cursor: imgCursor }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
}
