import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";
import { PDFDocument, rgb } from "pdf-lib";
import archiver from "archiver";
import { generateFromTemplate } from "~/lib/export/pptx-template-engine";
import { getThemeById, getDefaultTheme } from "~/lib/themes";
import { isCustomThemeId, getCustomThemeDbId, convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import fs from "fs";
import path from "path";

function getLogoBuffer(): Buffer | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath);
    }
    return null;
  } catch {
    return null;
  }
}

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
  transformedContent?: TransformedContent;
}

async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { format, range, customRange } = body as {
      format: "pdf" | "pptx" | "images";
      range?: "all" | "current" | "custom";
      customRange?: { from: number; to: number };
    };

    if (!format || !["pdf", "pptx", "images"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    // Get presentation
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

    const allSlides = (presentation.slides as unknown as SlideData[]) || [];

    // Apply slide range filter
    let slideIndices: number[] = [];
    if (range === "current" && customRange?.from) {
      slideIndices = [customRange.from - 1];
    } else if (range === "custom" && customRange) {
      const from = Math.max(0, customRange.from - 1);
      const to = Math.min(allSlides.length, customRange.to);
      slideIndices = Array.from({ length: to - from }, (_, i) => from + i);
    } else {
      slideIndices = Array.from({ length: allSlides.length }, (_, i) => i);
    }

    if (slideIndices.length === 0) {
      slideIndices = Array.from({ length: allSlides.length }, (_, i) => i);
    }

    // Check subscription for watermark
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { subscriptionPlan: true },
    });
    const isPaidPlan = user?.subscriptionPlan && ["plus", "pro", "ultra"].includes(user.subscriptionPlan);
    const addWatermark = !isPaidPlan;

    // Get theme
    const themeId = (presentation.content as { theme?: string })?.theme || "elegant-noir";
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

    // Get slides to export
    const slidesToExport = slideIndices.map(i => allSlides[i]!);
    const logoBuffer = getLogoBuffer();

    console.log(`[Export] Starting ${format} export for presentation ${id}`);
    console.log(`[Export] Theme: ${theme.id}, Slides: ${slidesToExport.length}, Watermark: ${addWatermark}`);

    // Handle different export formats
    if (format === "pptx") {
      // Generate native PPTX using template system
      const pptxBuffer = await generateFromTemplate({
        slides: slidesToExport,
        theme,
        title: presentation.title,
        addWatermark,
        logoBuffer,
      });

      // Log activity
      await db.activity.create({
        data: {
          userId: authUser.id,
          type: "export",
          description: `Exported "${presentation.title}" as PPTX`,
          metadata: { presentationId: id, format: "pptx", slideCount: slidesToExport.length },
        },
      });

      return new NextResponse(new Uint8Array(pptxBuffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(presentation.title)}.pptx"`,
          "Content-Length": pptxBuffer.length.toString(),
        },
      });
    }

    if (format === "pdf") {
      // Generate PDF from slide content (text-based, not screenshot)
      const pdfDoc = await PDFDocument.create();
      const pageWidth = 960;
      const pageHeight = 540;

      for (const slide of slidesToExport) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Background color
        const bgColor = theme.colors.background.startsWith("#") 
          ? theme.colors.background 
          : "#0a0a0b";
        const bgRgb = hexToRgb(bgColor);
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          color: rgb(bgRgb.r / 255, bgRgb.g / 255, bgRgb.b / 255),
        });

        // Title
        const titleColor = hexToRgb(theme.colors.heading);
        page.drawText(slide.title || "", {
          x: 40,
          y: pageHeight - 80,
          size: slide.type === "title" ? 36 : 28,
          color: rgb(titleColor.r / 255, titleColor.g / 255, titleColor.b / 255),
        });

        // Subtitle for title slides
        if (slide.type === "title" && slide.subtitle) {
          const subtitleColor = hexToRgb(theme.colors.textMuted);
          page.drawText(slide.subtitle, {
            x: 40,
            y: pageHeight - 130,
            size: 18,
            color: rgb(subtitleColor.r / 255, subtitleColor.g / 255, subtitleColor.b / 255),
          });
        }

        // Bullet points for content slides
        if (slide.type === "content") {
          const textColor = hexToRgb(theme.colors.text);
          const items: TransformedBulletItem[] = slide.transformedContent?.items || 
            (slide.bulletPoints || []).map(bp => ({ text: bp }));
          
          let yPos = pageHeight - 140;
          for (const item of items.slice(0, 8)) {
            const text = item.label ? `${item.label}: ${item.text}` : item.text;
            // Truncate long text
            const displayText = text.length > 100 ? text.substring(0, 97) + "..." : text;
            page.drawText(`• ${displayText}`, {
              x: 50,
              y: yPos,
              size: 14,
              color: rgb(textColor.r / 255, textColor.g / 255, textColor.b / 255),
            });
            yPos -= 35;
          }
        }

        // Watermark
        if (addWatermark) {
          page.drawText("Made with PPTMaster", {
            x: pageWidth - 180,
            y: 20,
            size: 12,
            color: rgb(1, 1, 1),
            opacity: 0.7,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();

      // Log activity
      await db.activity.create({
        data: {
          userId: authUser.id,
          type: "export",
          description: `Exported "${presentation.title}" as PDF`,
          metadata: { presentationId: id, format: "pdf", slideCount: slidesToExport.length },
        },
      });

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(presentation.title)}.pdf"`,
          "Content-Length": pdfBytes.length.toString(),
        },
      });
    }

    if (format === "images") {
      // Export images as ZIP
      const chunks: Buffer[] = [];
      
      const archive = archiver("zip", { zlib: { level: 9 } });
      
      archive.on("data", (chunk: Buffer) => chunks.push(chunk));
      
      const archivePromise = new Promise<Buffer>((resolve, reject) => {
        archive.on("end", () => resolve(Buffer.concat(chunks)));
        archive.on("error", reject);
      });

      // Add slide images to archive
      for (let i = 0; i < slidesToExport.length; i++) {
        const slide = slidesToExport[i]!;
        const images = getSlideImages(slide);
        
        for (let j = 0; j < images.length; j++) {
          const img = images[j]!;
          const imgBuffer = await fetchImageAsBuffer(img.url);
          if (imgBuffer) {
            const ext = img.url.includes(".png") ? "png" : "jpg";
            archive.append(imgBuffer, { name: `slide_${i + 1}_image_${j + 1}.${ext}` });
          }
        }
      }

      // Add a text file with slide content
      const slideContent = slidesToExport.map((slide, i) => {
        const items: TransformedBulletItem[] = slide.transformedContent?.items || 
          (slide.bulletPoints || []).map(bp => ({ text: bp }));
        const bullets = items.map(item => 
          item.label ? `  - ${item.label}: ${item.text}` : `  - ${item.text}`
        ).join("\n");
        return `Slide ${i + 1}: ${slide.title}\n${slide.subtitle ? `Subtitle: ${slide.subtitle}\n` : ""}${bullets}`;
      }).join("\n\n---\n\n");
      
      archive.append(slideContent, { name: "slides_content.txt" });

      await archive.finalize();
      const zipBuffer = await archivePromise;

      // Log activity
      await db.activity.create({
        data: {
          userId: authUser.id,
          type: "export",
          description: `Exported "${presentation.title}" images as ZIP`,
          metadata: { presentationId: id, format: "images", slideCount: slidesToExport.length },
        },
      });

      return new NextResponse(new Uint8Array(zipBuffer), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(presentation.title)}_images.zip"`,
          "Content-Length": zipBuffer.length.toString(),
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });

  } catch (error) {
    console.error("[Export] Error:", error);
    return NextResponse.json(
      { error: "Export failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  const match = cleanHex.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(match[1]!, 16),
    g: parseInt(match[2]!, 16),
    b: parseInt(match[3]!, 16),
  };
}

function getSlideImages(slide: SlideData): SlideImage[] {
  const images: SlideImage[] = [];
  if (slide.images?.length) {
    images.push(...slide.images.filter((img) => img.url && img.source !== "placeholder"));
  }
  if (slide.image?.url && slide.image.source !== "placeholder") {
    if (!images.some((img) => img.url === slide.image?.url)) {
      images.unshift(slide.image);
    }
  }
  return images;
}
