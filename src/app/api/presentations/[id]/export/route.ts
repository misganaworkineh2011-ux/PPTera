import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";
import PptxGenJS from "pptxgenjs";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";

interface SlideImage {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: string;
}

interface SlideData {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  image?: SlideImage | null;
  images?: SlideImage[];
  layout?: string;
}

// Helper to get all images from a slide
function getSlideImages(slide: SlideData): SlideImage[] {
  const images = [...(slide.images || [])];
  if (slide.image?.url && slide.image.source !== "placeholder" && !images.some(img => img.url === slide.image?.url)) {
    images.unshift(slide.image);
  }
  return images.filter(img => img.url && img.source !== "placeholder");
}

// Convert hex color to RGB for pptxgenjs
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? hex.replace("#", "") : "000000";
}

// Get theme type
function getThemeType(theme: Theme): "dark" | "light" | "sunset" | "ocean" | "aurora" | "ember" | "midnight" | "cyber" | "alien" | "corporate" {
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sunset-gradient") return "sunset";
  if (theme.id === "ocean-depths") return "ocean";
  if (theme.id === "aurora-borealis") return "aurora";
  if (theme.id === "ember-forge") return "ember";
  if (theme.id === "midnight-garden") return "midnight";
  if (theme.id === "cyber-neon") return "cyber";
  if (theme.id === "alien-tech") return "alien";
  if (theme.id === "corporate-clean") return "corporate";
  return "dark";
}

// Create PPTX presentation with theme styling
async function createPptx(slides: SlideData[], theme: Theme, title: string): Promise<Buffer> {
  const pptx = new PptxGenJS();
  const themeType = getThemeType(theme);
  
  // Set presentation properties
  pptx.author = "PPT Master";
  pptx.title = title;
  pptx.subject = "Presentation";
  pptx.company = "PPT Master";
  
  // Define master slides based on theme
  const bgColorMap: Record<string, string> = { light: "F8FAFC", sunset: "1C1017", ocean: "0A1628", aurora: "0F0A1A", ember: "1A0A0A", midnight: "0C0A1D", cyber: "0A0A0F", alien: "0A0F0A", corporate: "FFFFFF", dark: "0A0A0B" };
  const bgColor = bgColorMap[themeType] || "0A0A0B";
  const textColor = hexToRgb(theme.colors.heading);
  const mutedColor = hexToRgb(theme.colors.textMuted);
  const accentColor = hexToRgb(theme.colors.primary);
  
  pptx.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: bgColor },
  });

  for (const slideData of slides) {
    const pptSlide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    const images = getSlideImages(slideData);
    const hasImage = images.length > 0;
    
    if (slideData.type === "title") {
      // Title slide layout
      // Add decorative accent line
      pptSlide.addShape("rect", {
        x: 0.5,
        y: 0.5,
        w: 1.5,
        h: 0.05,
        fill: { color: accentColor },
      });
      
      // Title
      pptSlide.addText(slideData.title, {
        x: 0.5,
        y: 2.0,
        w: hasImage ? 5.5 : 9,
        h: 1.5,
        fontSize: 44,
        fontFace: "Arial",
        color: textColor,
        bold: true,
        valign: "middle",
      });
      
      // Subtitle
      if (slideData.subtitle) {
        pptSlide.addText(slideData.subtitle, {
          x: 0.5,
          y: 3.5,
          w: hasImage ? 5.5 : 9,
          h: 0.8,
          fontSize: 20,
          fontFace: "Arial",
          color: mutedColor,
          valign: "top",
        });
      }
      
      // Image on title slide
      if (hasImage && images[0]) {
        try {
          pptSlide.addImage({
            path: images[0].url,
            x: 6.5,
            y: 1,
            w: 3,
            h: 3.5,
            rounding: true,
          });
        } catch {
          // Skip image if it fails to load
        }
      }
    } else {
      // Content slide layout
      const bulletPoints = slideData.bulletPoints || [];
      
      // Slide number indicator
      pptSlide.addText(`${slides.indexOf(slideData) + 1}`, {
        x: 0.3,
        y: 0.3,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        fontFace: "Arial",
        color: accentColor,
        bold: true,
      });
      
      // Title
      pptSlide.addText(slideData.title, {
        x: 0.5,
        y: 0.7,
        w: hasImage ? 5.5 : 9,
        h: 0.8,
        fontSize: 32,
        fontFace: "Arial",
        color: textColor,
        bold: true,
      });
      
      // Bullet points
      if (bulletPoints.length > 0) {
        const bulletText = bulletPoints.map(point => ({
          text: point,
          options: {
            bullet: { type: "bullet" as const, color: accentColor },
            color: mutedColor,
            fontSize: 18,
            fontFace: "Arial",
            paraSpaceAfter: 12,
          },
        }));
        
        pptSlide.addText(bulletText, {
          x: 0.5,
          y: 1.6,
          w: hasImage ? 5 : 9,
          h: 3.5,
          valign: "top",
        });
      }
      
      // Images
      if (hasImage) {
        if (images.length === 1 && images[0]) {
          try {
            pptSlide.addImage({
              path: images[0].url,
              x: 6,
              y: 1,
              w: 3.5,
              h: 3.8,
              rounding: true,
            });
          } catch {
            // Skip image if it fails
          }
        } else if (images.length >= 2) {
          // Multiple images - grid layout
          const imgWidth = 1.6;
          const imgHeight = 1.8;
          const startX = 6;
          const startY = 1;
          
          images.slice(0, 4).forEach((img, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            try {
              pptSlide.addImage({
                path: img.url,
                x: startX + col * (imgWidth + 0.2),
                y: startY + row * (imgHeight + 0.2),
                w: imgWidth,
                h: imgHeight,
                rounding: true,
              });
            } catch {
              // Skip image if it fails
            }
          });
        }
      }
    }
    
    // Add footer with accent line
    pptSlide.addShape("rect", {
      x: 0,
      y: 5.4,
      w: 10,
      h: 0.02,
      fill: { color: accentColor, transparency: 70 },
    });
  }
  
  // Generate the PPTX file
  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}

// Generate HTML for a slide (for PDF/image export)
function generateSlideHtml(slide: SlideData, index: number, totalSlides: number, theme: Theme): string {
  const themeType = getThemeType(theme);
  const images = getSlideImages(slide);
  const hasImage = images.length > 0;
  
  // Theme colors
  const colors: Record<string, { bg: string; text: string; muted: string; accent: string; surface: string }> = {
    dark: {
      bg: "linear-gradient(135deg, #0a0a0b 0%, #1a1a1d 50%, #0a0a0b 100%)",
      text: "#fafafa",
      muted: "#a1a1aa",
      accent: "#f59e0b",
      surface: "#1a1a1d",
    },
    light: {
      bg: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%)",
      text: "#0f172a",
      muted: "#64748b",
      accent: "#0891b2",
      surface: "#ffffff",
    },
    sunset: {
      bg: "linear-gradient(135deg, #1c1017 0%, #2d1a24 30%, #1c1017 100%)",
      text: "#ffffff",
      muted: "#f9a8d4",
      accent: "#f472b6",
      surface: "#2d1a24",
    },
    ocean: {
      bg: "linear-gradient(135deg, #0a1628 0%, #0d1f35 40%, #122a45 100%)",
      text: "#ffffff",
      muted: "#7dd3fc",
      accent: "#14b8a6",
      surface: "#122a45",
    },
    aurora: {
      bg: "linear-gradient(135deg, #0f0a1a 0%, #1a1030 40%, #150d24 100%)",
      text: "#ffffff",
      muted: "#b8a8d0",
      accent: "#a855f7",
      surface: "#1a1030",
    },
    ember: {
      bg: "linear-gradient(135deg, #1a0a0a 0%, #2a1010 40%, #3a1515 100%)",
      text: "#ffffff",
      muted: "#fca5a5",
      accent: "#ef4444",
      surface: "#3a1515",
    },
    midnight: {
      bg: "linear-gradient(135deg, #0c0a1d 0%, #1a1735 40%, #12102a 100%)",
      text: "#ffffff",
      muted: "#c4b5fd",
      accent: "#e879a9",
      surface: "#1a1735",
    },
    cyber: {
      bg: "linear-gradient(135deg, #0a0a0f 0%, #0f0f18 40%, #151520 100%)",
      text: "#ffffff",
      muted: "#80d4ff",
      accent: "#00ffff",
      surface: "#151520",
    },
  };
  
  const c = colors[themeType] ?? colors.dark!;
  const bulletPoints = slide.bulletPoints || [];
  
  if (slide.type === "title") {
    // Title slide with optional background image
    const titleBgStyle = hasImage && images[0] 
      ? `background-image: url('${images[0].url}'); background-size: cover; background-position: center;`
      : `background: ${c.bg};`;
    const overlayStyle = hasImage 
      ? `<div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.3) 100%);"></div>`
      : "";
    const titleTextColor = hasImage ? "#ffffff" : c.text;
    const subtitleTextColor = hasImage ? "rgba(255,255,255,0.8)" : c.muted;
    
    return `
      <div style="width: 1920px; height: 1080px; ${titleBgStyle} position: relative; font-family: 'Inter', Arial, sans-serif; overflow: hidden;">
        ${overlayStyle}
        <div style="position: absolute; top: 40px; left: 40px; display: flex; align-items: center; gap: 12px; z-index: 10;">
          <span style="font-family: monospace; font-size: 14px; font-weight: 600; color: ${c.accent};">${String(index + 1).padStart(2, "0")}</span>
          <div style="width: 48px; height: 2px; background: linear-gradient(to right, ${c.accent}, transparent);"></div>
          <span style="font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; color: ${hasImage ? "rgba(255,255,255,0.6)" : c.muted};">/ ${String(totalSlides).padStart(2, "0")}</span>
        </div>
        <div style="position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px; text-align: center;">
          <h1 style="font-size: 72px; font-weight: 700; color: ${titleTextColor}; margin: 0 0 32px 0; letter-spacing: -0.03em; max-width: 1400px; line-height: 1.1;">${escapeHtml(slide.title)}</h1>
          ${slide.subtitle ? `<p style="font-size: 28px; color: ${subtitleTextColor}; margin: 0; max-width: 1000px;">${escapeHtml(slide.subtitle)}</p>` : ""}
          <div style="display: flex; align-items: center; gap: 16px; margin-top: 60px;">
            <div style="width: 80px; height: 2px; background: linear-gradient(to right, transparent, ${c.accent}50, transparent);"></div>
            <div style="width: 8px; height: 8px; transform: rotate(45deg); background: ${c.accent}99;"></div>
            <div style="width: 80px; height: 2px; background: linear-gradient(to right, transparent, ${c.accent}50, transparent);"></div>
          </div>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(to right, transparent, ${hasImage ? "rgba(255,255,255,0.2)" : c.muted + "40"}, transparent); z-index: 10;"></div>
      </div>
    `;
  }
  
  // Content slide
  return `
    <div style="width: 1920px; height: 1080px; background: ${c.bg}; position: relative; font-family: 'Inter', Arial, sans-serif; overflow: hidden;">
      <div style="position: absolute; top: 40px; left: 40px; display: flex; align-items: center; gap: 12px;">
        <span style="font-family: monospace; font-size: 14px; font-weight: 600; color: ${c.accent};">${String(index + 1).padStart(2, "0")}</span>
        <div style="width: 48px; height: 2px; background: linear-gradient(to right, ${c.accent}, transparent);"></div>
        <span style="font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; color: ${c.muted};">/ ${String(totalSlides).padStart(2, "0")}</span>
      </div>
      <div style="height: 100%; display: flex; padding: 100px 80px 80px 80px;">
        <div style="flex: ${hasImage ? "0 0 55%" : "1"}; display: flex; flex-direction: column; justify-content: center;">
          <h2 style="font-size: 52px; font-weight: 700; color: ${c.text}; margin: 0 0 40px 0; letter-spacing: -0.02em; line-height: 1.2;">${escapeHtml(slide.title)}</h2>
          ${bulletPoints.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${bulletPoints.map(point => `
                <div style="display: flex; align-items: flex-start; gap: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-shrink: 0;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${c.accent};"></div>
                    <div style="width: 32px; height: 2px; background: ${c.muted}40;"></div>
                  </div>
                  <p style="font-size: 22px; color: ${c.muted}; margin: 0; line-height: 1.6;">${escapeHtml(point)}</p>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
        ${hasImage ? `
          <div style="flex: 0 0 40%; display: flex; align-items: center; justify-content: center; padding-left: 40px;">
            ${images.length === 1 ? `
              <div style="width: 100%; height: 80%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.4);">
                <img src="${images[0]!.url}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; width: 100%;">
                ${images.slice(0, 4).map(img => `
                  <div style="aspect-ratio: 4/3; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <img src="${img.url}" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                `).join("")}
              </div>
            `}
          </div>
        ` : ""}
      </div>
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(to right, transparent, ${c.muted}40, transparent);"></div>
    </div>
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth();
    const { id } = params;
    const body = await request.json();
    const { format } = body as { format: "pdf" | "pptx" | "images" };

    if (!format || !["pdf", "pptx", "images"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    // Get presentation - check if user owns it or is a collaborator
    const presentation = await db.presentation.findFirst({
      where: {
        id,
        OR: [
          { userId: authUser.id },
          { collaborations: { some: { userId: authUser.id } } },
        ],
      },
    });

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    const content = presentation.content as { theme?: string };
    const slides = (presentation.slides as unknown as SlideData[]) || [];
    const theme = getThemeById(content.theme || "") || getDefaultTheme();

    if (format === "pptx") {
      const pptxBuffer = await createPptx(slides, theme, presentation.title);
      
      // Log activity
      await db.activity.create({
        data: {
          userId: authUser.id,
          type: "export",
          description: `Exported "${presentation.title}" as PPTX`,
          presentationId: id,
        },
      });
      
      return new NextResponse(new Uint8Array(pptxBuffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${presentation.title}.pptx"`,
        },
      });
    }

    if (format === "pdf" || format === "images") {
      // For PDF and images, we generate HTML that can be rendered client-side
      // Since we don't have puppeteer, we'll return HTML that the client can print to PDF
      const htmlSlides = slides.map((slide, index) => 
        generateSlideHtml(slide, index, slides.length, theme)
      );
      
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${escapeHtml(presentation.title)}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: 1920px 1080px; margin: 0; }
            @media print {
              .slide { page-break-after: always; }
              .slide:last-child { page-break-after: avoid; }
            }
            body { margin: 0; padding: 0; }
            .slide { width: 1920px; height: 1080px; overflow: hidden; }
          </style>
        </head>
        <body>
          ${htmlSlides.map(html => `<div class="slide">${html}</div>`).join("")}
        </body>
        </html>
      `;
      
      return new NextResponse(fullHtml, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="${presentation.title}.html"`,
        },
      });
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
