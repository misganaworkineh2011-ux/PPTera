/**
 * Export Render API - Renders a single slide for screenshot capture
 * This endpoint returns HTML that can be captured by Puppeteer
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { getThemeById, getDefaultTheme } from "~/lib/themes";
import {
  isCustomThemeId,
  getCustomThemeDbId,
  convertCustomThemeToTheme,
} from "~/lib/custom-theme-utils";

interface SlideImage {
  url: string;
  alt: string;
  source: string;
}

interface TransformedBulletItem {
  label?: string;
  text: string;
}

interface TransformedContent {
  intro?: string;
  items: TransformedBulletItem[];
}

interface SlideData {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  image?: SlideImage | null;
  images?: SlideImage[];
  layout?: string;
  slideLayout?: string;
  contentLayout?: string;
  transformedContent?: TransformedContent;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const slideIndex = parseInt(searchParams.get("slide") || "0");
    const addWatermark = searchParams.get("watermark") === "true";

    // Get presentation (no auth required for internal render)
    const presentation = await db.presentation.findUnique({
      where: { id },
    });

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    const slides = (presentation.slides as unknown as SlideData[]) || [];
    const slide = slides[slideIndex];

    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    // Get theme
    const themeId = (presentation.content as { theme?: string })?.theme || "corporate-clean";
    let theme = getDefaultTheme();

    if (isCustomThemeId(themeId)) {
      try {
        const customThemeDbId = getCustomThemeDbId(themeId);
        const customThemeData = await db.theme.findUnique({
          where: { id: customThemeDbId },
        });
        if (customThemeData) {
          theme = convertCustomThemeToTheme(customThemeData);
        }
      } catch {
        // Use default theme
      }
    } else {
      theme = getThemeById(themeId) || getDefaultTheme();
    }

    // Generate simple HTML for the slide (server-side renderable)
    const html = generateSlideHtml(slide, slideIndex, slides.length, theme, addWatermark);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[Export Render] Error:", error);
    return NextResponse.json(
      { error: "Render failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function generateSlideHtml(
  slide: SlideData,
  index: number,
  totalSlides: number,
  theme: ReturnType<typeof getDefaultTheme>,
  addWatermark: boolean = false
): string {
  const isTitle = slide.type === "title";
  const hasImage = !!(slide.image?.url || (slide.images && slide.images.length > 0));
  const imageUrl = slide.image?.url || slide.images?.[0]?.url;

  // Get theme colors
  const bgColor = theme.cardBox?.background || theme.colors.background;
  const titleColor = theme.cardBox?.titleColor || theme.colors.heading;
  const bodyColor = theme.cardBox?.bodyColor || theme.colors.textMuted;
  const accentColor = theme.cardBox?.accentColor || theme.colors.accent;
  const borderColor = theme.cardBox?.borderColor || theme.colors.border;

  // Background image handling
  const backgroundImage = theme.backgroundImage;
  const pageBackground = theme.pageBackgroundGradient || theme.pageBackground || theme.colors.background;

  // Get bullet items
  const items = slide.transformedContent?.items ||
    (slide.bulletPoints || []).map(bp => {
      const colonIndex = bp.indexOf(":");
      if (colonIndex > 0 && colonIndex < 50) {
        return { label: bp.substring(0, colonIndex).trim(), text: bp.substring(colonIndex + 1).trim() };
      }
      return { text: bp };
    });

  const bulletHtml = items.map((item, i) => `
    <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
      <div style="width: 8px; height: 8px; border-radius: 50%; background: ${accentColor}; margin-top: 8px; flex-shrink: 0;"></div>
      <div style="flex: 1;">
        ${item.label ? `<div style="font-weight: 600; color: ${titleColor}; margin-bottom: 4px; font-size: 18px;">${escapeHtml(item.label)}</div>` : ""}
        <div style="color: ${bodyColor}; font-size: 16px; line-height: 1.5;">${escapeHtml(item.text)}</div>
      </div>
    </div>
  `).join("");

  // Layout based on slide type and image presence
  let contentHtml = "";

  if (isTitle) {
    // Title slide - centered
    contentHtml = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 60px;">
        ${hasImage ? `
          <div style="position: absolute; inset: 0; z-index: 0;">
            <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2));"></div>
          </div>
        ` : ""}
        <div style="position: relative; z-index: 1;">
          <h1 style="font-size: 56px; font-weight: 700; color: ${hasImage ? "#ffffff" : titleColor}; margin-bottom: 24px; font-family: ${theme.fonts.heading.family};">
            ${escapeHtml(slide.title)}
          </h1>
          ${slide.subtitle ? `
            <p style="font-size: 24px; color: ${hasImage ? "rgba(255,255,255,0.9)" : bodyColor}; font-family: ${theme.fonts.body.family};">
              ${escapeHtml(slide.subtitle)}
            </p>
          ` : ""}
        </div>
      </div>
    `;
  } else if (hasImage) {
    // Content slide with image - split layout
    contentHtml = `
      <div style="display: flex; height: 100%;">
        <div style="flex: 1; padding: 48px; display: flex; flex-direction: column; justify-content: center;">
          <h2 style="font-size: 36px; font-weight: 700; color: ${titleColor}; margin-bottom: 32px; font-family: ${theme.fonts.heading.family};">
            ${escapeHtml(slide.title)}
          </h2>
          <div style="font-family: ${theme.fonts.body.family};">
            ${bulletHtml}
          </div>
        </div>
        <div style="width: 45%; position: relative;">
          <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>
    `;
  } else {
    // Content slide without image
    contentHtml = `
      <div style="padding: 48px; height: 100%; display: flex; flex-direction: column;">
        <h2 style="font-size: 36px; font-weight: 700; color: ${titleColor}; margin-bottom: 32px; font-family: ${theme.fonts.heading.family};">
          ${escapeHtml(slide.title)}
        </h2>
        <div style="flex: 1; font-family: ${theme.fonts.body.family};">
          ${bulletHtml}
        </div>
      </div>
    `;
  }

  // Slide number indicator
  const slideIndicator = `
    <div style="position: absolute; top: 24px; left: 24px; display: flex; align-items: center; gap: 8px; z-index: 10;">
      <span style="font-family: monospace; font-weight: 500; color: ${accentColor}; font-size: 14px;">${String(index + 1).padStart(2, "0")}</span>
      <div style="width: 32px; height: 1px; background: linear-gradient(to right, ${accentColor}, transparent);"></div>
      <span style="font-size: 12px; color: ${bodyColor}; text-transform: uppercase; letter-spacing: 0.1em;">/ ${String(totalSlides).padStart(2, "0")}</span>
    </div>
  `;

  // Watermark for free users
  const watermarkHtml = addWatermark ? `
    <div style="position: absolute; bottom: 20px; right: 24px; display: flex; align-items: center; gap: 8px; z-index: 10; opacity: 0.7;">
      <img src="/logo.png" style="height: 20px; width: auto;" alt="PPTMaster" />
      <span style="font-size: 12px; color: #666; font-family: ${theme.fonts.body.family};">Made with PPTMaster</span>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=1920, height=1080">
        <title>Slide ${index + 1}</title>
        ${theme.fonts.googleFontsUrls?.map(url => `<link href="${url}" rel="stylesheet">`).join("\n") || ""}
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            width: 1920px; 
            height: 1080px; 
            overflow: hidden;
            font-family: ${theme.fonts.body.family};
            background: #000;
          }
          .slide-container {
            width: 1920px;
            height: 1080px;
            position: relative;
            background: ${pageBackground};
            ${backgroundImage ? `background-image: url(${backgroundImage}); background-size: cover; background-position: center;` : ""}
          }
          .slide-content {
            position: absolute;
            inset: 40px;
            background: ${bgColor}cc;
            border: 1px solid ${borderColor};
            border-radius: 16px;
            overflow: hidden;
            backdrop-filter: blur(12px);
          }
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div class="slide-container" data-slide-container="true">
          <div class="slide-content">
            ${slideIndicator}
            ${contentHtml}
            ${watermarkHtml}
          </div>
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
