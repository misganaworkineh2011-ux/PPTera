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
  // Strip HTML the editor/model sometimes leaves in (a stray <br> from
  // contentEditable, &nbsp;, etc.). Read-only views render labels/text as plain
  // strings, so without this a "<br>" shows up literally in fullscreen/present
  // while the editor (which interprets HTML) hides it — making the two differ.
  cleaned = cleaned.replace(/<br\s*\/?>/gi, " ");
  cleaned = cleaned.replace(/<\/?[a-z][^>]*>/gi, "");
  cleaned = cleaned.replace(/&nbsp;/gi, " ");
  cleaned = cleaned.replace(/\(max\s+\d+\s+words?[^)]*\)/gi, "").trim();
  cleaned = cleaned.replace(/\(\d+\s+words?[^)]*\)/gi, "").trim();
  cleaned = cleaned.replace(/\(visually\s+equal\s+length[^)]*\)/gi, "").trim();
  cleaned = cleaned.replace(/\(words?[^)]*\)/gi, "").trim();
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  // Drop an orphan leading separator left after stripping a tag (e.g. "— Foo").
  cleaned = cleaned.replace(/^[—–]\s+/, "").trim();
  return cleaned;
}

export function getBoxContentItems(slide: SlideData): BoxContentItem[] {
  if (slide.sections && slide.sections.length > 0) {
    return slide.sections.map((section, i) => ({
      label: removeWordCounts(section.heading || ""),
      text: removeWordCounts(section.description || ""),
      icon: slide.icons?.[i]?.placeholder,
    }));
  }
  if (slide.transformedContent?.items) {
    return slide.transformedContent.items
      .filter(item => item.label)
      .map((item, i) => ({
        label: removeWordCounts(item.label || ""),
        text: removeWordCounts(item.text || ""),
        icon: slide.icons?.[i]?.placeholder,
      }));
  }
  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    return slide.bulletPoints.map((bullet, i) => {
      const cleanBullet = removeWordCounts(bullet);
      const icon = slide.icons?.[i]?.placeholder;

      // Preferred format from the content transform: "Title — Description" (em dash)
      const emIdx = cleanBullet.indexOf(" — ");
      if (emIdx > 0) {
        const label = cleanBullet.slice(0, emIdx).trim();
        const text = cleanBullet.slice(emIdx + 3).trim();
        if (label && text) return { label, text, icon };
      }

      // "Title – Description" (en dash — same width separator, different glyph)
      const enIdx = cleanBullet.indexOf(" – ");
      if (enIdx > 0) {
        const label = cleanBullet.slice(0, enIdx).trim();
        const text = cleanBullet.slice(enIdx + 3).trim();
        if (label && text) return { label, text, icon };
      }

      // "Title - Description" (hyphen)
      const hyphenIdx = cleanBullet.indexOf(" - ");
      if (hyphenIdx > 0) {
        const label = cleanBullet.slice(0, hyphenIdx).trim();
        const text = cleanBullet.slice(hyphenIdx + 3).trim();
        if (label && text) return { label, text, icon };
      }

      // "Title: Description" (colon, when the title is short enough to be a heading)
      const colonIndex = cleanBullet.indexOf(":");
      if (colonIndex > 0 && colonIndex < 50) {
        const label = cleanBullet.substring(0, colonIndex).trim();
        const text = cleanBullet.substring(colonIndex + 1).trim();
        if (label && text) return { label, text, icon };
      }

      // No clear title — keep the whole bullet as the text, with NO fabricated label.
      return { label: undefined, text: cleanBullet, icon };
    });
  }
  return [];
}
