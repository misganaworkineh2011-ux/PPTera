import { Prisma } from "@prisma/client";

/**
 * Denormalized deck metadata for dashboard cards: slide count, a few slide
 * image URLs, and the first (cover) slide so cards can render the REAL slide.
 * Computed whenever slides are written so the dashboard never has to load the
 * heavy slides JSON.
 */
export function computeDeckMeta(slides: unknown): {
  slideCount: number;
  previewImages: string[];
  coverSlide: Prisma.InputJsonValue | typeof Prisma.JsonNull;
} {
  const arr = Array.isArray(slides) ? slides : [];
  const urls: string[] = [];
  outer: for (const s of arr) {
    const slide = s as {
      image?: { url?: unknown } | null;
      images?: Array<{ url?: unknown } | null> | null;
    };
    const candidates: unknown[] = [
      slide?.image?.url,
      ...(Array.isArray(slide?.images) ? slide.images.map((i) => i?.url) : []),
    ];
    for (const u of candidates) {
      if (typeof u === "string" && u.startsWith("http") && !urls.includes(u)) {
        urls.push(u);
        if (urls.length >= 4) break outer;
      }
    }
  }
  return {
    slideCount: arr.length,
    previewImages: urls,
    coverSlide:
      arr.length > 0
        ? (JSON.parse(JSON.stringify(arr[0])) as Prisma.InputJsonValue)
        : Prisma.JsonNull,
  };
}
