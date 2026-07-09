"use client";

import type { Theme } from "~/lib/themes";
import type { SlideData, EmbedProvider } from "./types";

/**
 * Normalize a pasted URL into an embeddable iframe src for the providers we
 * recognize (YouTube, Vimeo, Loom, Figma); otherwise embed the URL as-is.
 */
export function toEmbedUrl(raw: string): string {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (url.pathname.startsWith("/embed/")) return raw;
      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === "player.vimeo.com") return raw;
    if (host === "loom.com") {
      if (url.pathname.startsWith("/share/")) {
        const id = url.pathname.split("/")[2];
        if (id) return `https://www.loom.com/embed/${id}`;
      }
      if (url.pathname.startsWith("/embed/")) return raw;
    }
    if (host === "figma.com" && !url.pathname.startsWith("/embed")) {
      return `https://www.figma.com/embed?embed_host=pptera&url=${encodeURIComponent(raw)}`;
    }
    return raw;
  } catch {
    return raw;
  }
}

export function detectProvider(raw: string): EmbedProvider {
  const u = raw.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.includes("loom.com")) return "loom";
  if (u.includes("figma.com")) return "figma";
  return "generic";
}

/**
 * Full-slide embed view. Rendered by SlideRenderer when a slide has `embed`.
 * Lives inside the fixed 1280x720 canvas, so px sizes scale with the slide.
 */
export default function EmbedSlideView({ slide, theme }: { slide: SlideData; theme: Theme }) {
  const embed = slide.embed!;
  const src = toEmbedUrl(embed.url);
  const heading = theme.colors?.heading || theme.colors?.text || "#0f172a";
  const muted = theme.colors?.textMuted || "#64748b";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-16 py-10">
      {slide.title && (
        <h2
          className="text-center font-bold leading-tight"
          style={{ color: heading, fontSize: 38, fontFamily: theme.fonts?.heading?.family, maxWidth: 1000 }}
        >
          {slide.title}
        </h2>
      )}
      <div className="relative w-full" style={{ maxWidth: 1000, aspectRatio: "16 / 9" }}>
        <iframe
          src={src}
          className="absolute inset-0 h-full w-full rounded-xl border-0 shadow-2xl"
          style={{ backgroundColor: "#000" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          loading="lazy"
          title={slide.title || "Embedded content"}
        />
      </div>
      {embed.caption && (
        <p className="text-center" style={{ color: muted, fontSize: 16, fontFamily: theme.fonts?.body?.family }}>
          {embed.caption}
        </p>
      )}
    </div>
  );
}
