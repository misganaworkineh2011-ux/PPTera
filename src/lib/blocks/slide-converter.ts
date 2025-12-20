/**
 * Utility to convert legacy SlideData to block-based content
 * This enables backward compatibility while transitioning to the new block system
 */

import type { SlideData, SlideImage } from "~/components/presentation/types";
import type { ContentBlock, TextBlock, ListBlock, ImageBlock } from "./types";
import { generateBlockId } from "./types";

/**
 * Convert a legacy slide to block-based content
 */
export function convertSlideToBlocks(slide: SlideData): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  // Add title as heading block
  if (slide.title) {
    const titleBlock: TextBlock = {
      id: generateBlockId(),
      type: "heading",
      content: slide.title,
      level: 1,
    };
    blocks.push(titleBlock);
  }

  // Add subtitle as paragraph or smaller heading
  if (slide.subtitle) {
    const subtitleBlock: TextBlock = {
      id: generateBlockId(),
      type: slide.type === "title" ? "heading" : "paragraph",
      content: slide.subtitle,
      level: slide.type === "title" ? 2 : undefined,
    };
    blocks.push(subtitleBlock);
  }

  // Convert bullet points to list block
  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    const listBlock: ListBlock = {
      id: generateBlockId(),
      type: "list",
      listType: "bullet",
      items: slide.bulletPoints.map(point => ({
        id: generateBlockId(),
        content: point,
      })),
    };
    blocks.push(listBlock);
  }

  // Convert images to image blocks
  const images = getSlideImages(slide);
  for (const img of images) {
    const imageBlock: ImageBlock = {
      id: generateBlockId(),
      type: "image",
      url: img.url,
      alt: img.alt || "Slide image",
      caption: img.photographer ? `Photo by ${img.photographer}` : undefined,
    };
    blocks.push(imageBlock);
  }

  return blocks;
}

/**
 * Convert blocks back to legacy SlideData format
 * Useful for saving to database in legacy format
 */
export function convertBlocksToSlide(blocks: ContentBlock[], originalSlide?: Partial<SlideData>): SlideData {
  const slide: SlideData = {
    type: "content",
    title: "",
    ...originalSlide,
  };

  const bulletPoints: string[] = [];
  const images: SlideImage[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        if ((block as TextBlock).level === 1 && !slide.title) {
          slide.title = (block as TextBlock).content;
        } else if ((block as TextBlock).level === 2 && !slide.subtitle) {
          slide.subtitle = (block as TextBlock).content;
        }
        break;

      case "paragraph":
        // First paragraph without title becomes subtitle
        if (!slide.subtitle && slide.title) {
          slide.subtitle = (block as TextBlock).content;
        }
        break;

      case "list":
        const listBlock = block as ListBlock;
        for (const item of listBlock.items) {
          bulletPoints.push(item.content);
        }
        break;

      case "image":
        const imgBlock = block as ImageBlock;
        images.push({
          url: imgBlock.url,
          alt: imgBlock.alt,
          source: "block",
        });
        break;
    }
  }

  if (bulletPoints.length > 0) {
    slide.bulletPoints = bulletPoints;
  }

  if (images.length > 0) {
    slide.images = images;
    slide.image = images[0];
  }

  return slide;
}

/**
 * Helper to get all images from a slide
 */
function getSlideImages(slide: SlideData): SlideImage[] {
  const images = [...(slide.images || [])];
  if (slide.image?.url && slide.image.source !== "placeholder" && !images.some(img => img.url === slide.image?.url)) {
    images.unshift(slide.image);
  }
  return images.filter(img => img.url && img.source !== "placeholder");
}

/**
 * Check if a slide uses block-based content
 */
export function isBlockBasedSlide(slide: SlideData): boolean {
  return slide.layoutMode === "flow" || slide.layoutMode === "canvas" || Boolean(slide.blocks && slide.blocks.length > 0);
}

/**
 * Ensure a slide has blocks (convert if needed)
 */
export function ensureSlideHasBlocks(slide: SlideData): SlideData {
  if (isBlockBasedSlide(slide) && slide.blocks) {
    return slide;
  }

  return {
    ...slide,
    blocks: convertSlideToBlocks(slide),
    layoutMode: "flow",
  };
}
