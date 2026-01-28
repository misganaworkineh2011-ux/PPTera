import type { SlideData } from "./types";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";

export function getSlideImages(slide: SlideData) {
  const images = [...(slide.images || [])];
  if (slide.image && !images.some(img => 
    img.url === slide.image?.url && 
    img.source === slide.image?.source &&
    img.source === "placeholder"
  )) {
    images.unshift(slide.image);
  }
  return images;
}

export function removeWordCounts(text: string): string {
  if (!text) return text;
  let cleaned = text;
  cleaned = cleaned.replace(/\(max\s+\d+\s+words?[^)]*\)/gi, "").trim();
  cleaned = cleaned.replace(/\(\d+\s+words?[^)]*\)/gi, "").trim();
  cleaned = cleaned.replace(/\(visually\s+equal\s+length[^)]*\)/gi, "").trim();
  cleaned = cleaned.replace(/\(words?[^)]*\)/gi, "").trim();
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

export function getBoxContentItems(slide: SlideData): BoxContentItem[] {
  if (slide.sections && slide.sections.length > 0) {
    return slide.sections.map((section, i) => ({
      label: section.heading,
      text: removeWordCounts(section.description || ""),
      icon: slide.icons?.[i]?.placeholder,
    }));
  }
  if (slide.transformedContent?.items) {
    return slide.transformedContent.items
      .filter(item => item.label)
      .map((item, i) => ({
        label: item.label,
        text: removeWordCounts(item.text || ""),
        icon: slide.icons?.[i]?.placeholder,
      }));
  }
  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    return slide.bulletPoints.map((bullet, i) => {
      let cleanBullet = removeWordCounts(bullet);

      const colonIndex = cleanBullet.indexOf(":");
      if (colonIndex > 0 && colonIndex < 50) {
        const label = cleanBullet.substring(0, colonIndex).trim();
        const text = cleanBullet.substring(colonIndex + 1).trim();
        if (label && text) {
          return {
            label,
            text,
            icon: slide.icons?.[i]?.placeholder,
          };
        }
      }

      return {
        label: `Item ${i + 1}`,
        text: cleanBullet,
        icon: slide.icons?.[i]?.placeholder,
      };
    });
  }
  return [];
}
