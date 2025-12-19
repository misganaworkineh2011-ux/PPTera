import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";
import PptxGenJS from "pptxgenjs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import archiver from "archiver";
import { Resvg } from "@resvg/resvg-js";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import fs from "fs";
import path from "path";

// Helper to get logo as buffer
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

// Helper to get logo as base64
function getLogoBase64(): string | null {
  const buffer = getLogoBuffer();
  if (buffer) {
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }
  return null;
}

// Helper to fetch image and convert to base64
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return { base64, mimeType: contentType };
  } catch {
    return null;
  }
}

// Helper to fetch image as buffer for PDF embedding
async function fetchImageBuffer(url: string): Promise<{ buffer: Buffer; type: "jpg" | "png" } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "";
    const type = contentType.includes("png") ? "png" : "jpg";
    return { buffer, type };
  } catch {
    return null;
  }
}

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
async function createPptx(
  slides: SlideData[],
  theme: Theme,
  title: string,
  addWatermark: boolean = false,
  logoDataUri?: string | null
): Promise<Buffer> {
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
    
    // Add watermark for free accounts
    if (addWatermark) {
      const wmX = 6.7;
      const wmY = 4.95;
      const wmW = 3.2;
      const wmH = 0.55;
      const logoData = logoDataUri;

      // Background panel
      pptSlide.addShape("rect", {
        x: wmX,
        y: wmY,
        w: wmW,
        h: wmH,
        fill: { color: "0D1117", transparency: 10 },
        line: { color: "0D1117", transparency: 100 },
        rectRadius: 0.1,
        shadow: { type: "outer", color: "000000", blur: 8, offset: 1, angle: 45, transparency: 70 },
      });

      // Logo
      if (logoData) {
        pptSlide.addImage({
          data: logoData,
          x: wmX + 0.16,
          y: wmY + 0.11,
          w: 0.35,
          h: 0.35,
        });
      } else {
        pptSlide.addShape("rect", {
          x: wmX + 0.16,
          y: wmY + 0.11,
          w: 0.35,
          h: 0.35,
          fill: { color: accentColor },
          line: { color: accentColor, transparency: 100 },
          rectRadius: 0.04,
        });
      }

      // Text
      pptSlide.addText("Made with PPTMaster", {
        x: wmX + 0.58,
        y: wmY + 0.11,
        w: 2.5,
        h: 0.35,
        fontSize: 14,
        fontFace: "Arial",
        color: "FFFFFF",
        bold: true,
        valign: "middle",
        align: "left",
      });
    }
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

    // Load logo once for all export formats
    const logoBuffer = getLogoBuffer();
    const logoBase64 = logoBuffer ? logoBuffer.toString("base64") : null;
    const logoDataUri = logoBase64 ? `data:image/png;base64,${logoBase64}` : null;

    if (format === "pptx") {
      // Check if user has paid plan for watermark
      const user = await db.user.findUnique({ where: { id: authUser.id }, select: { subscriptionPlan: true } });
      const isPaidPlan = user?.subscriptionPlan && ["plus", "pro", "ultra"].includes(user.subscriptionPlan);
      
      const pptxBuffer = await createPptx(slides, theme, presentation.title, !isPaidPlan, logoDataUri);
      
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

    if (format === "pdf") {
      // Check if user has paid plan for watermark
      const user = await db.user.findUnique({ where: { id: authUser.id }, select: { subscriptionPlan: true } });
      const isPaidPlan = user?.subscriptionPlan && ["plus", "pro", "ultra"].includes(user.subscriptionPlan);
      
      // Generate actual PDF using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const themeType = getThemeType(theme);
      
      // PDF page size (16:9 aspect ratio, similar to slides)
      const pageWidth = 960;
      const pageHeight = 540;
      
      // Theme colors for PDF
      const bgColors: Record<string, [number, number, number]> = {
        dark: [10/255, 10/255, 11/255],
        light: [248/255, 250/255, 252/255],
        sunset: [28/255, 16/255, 23/255],
        ocean: [10/255, 22/255, 40/255],
        aurora: [15/255, 10/255, 26/255],
        ember: [26/255, 10/255, 10/255],
        midnight: [12/255, 10/255, 29/255],
        cyber: [10/255, 10/255, 15/255],
        alien: [10/255, 15/255, 10/255],
        corporate: [255/255, 255/255, 255/255],
      };
      
      const textColors: Record<string, [number, number, number]> = {
        dark: [250/255, 250/255, 250/255],
        light: [15/255, 23/255, 42/255],
        sunset: [255/255, 255/255, 255/255],
        ocean: [255/255, 255/255, 255/255],
        aurora: [255/255, 255/255, 255/255],
        ember: [255/255, 255/255, 255/255],
        midnight: [255/255, 255/255, 255/255],
        cyber: [255/255, 255/255, 255/255],
        alien: [255/255, 255/255, 255/255],
        corporate: [31/255, 41/255, 55/255],
      };
      
      const bgColor = bgColors[themeType] || bgColors.dark!;
      const textColor = textColors[themeType] || textColors.dark!;
      const logoImage = logoBuffer ? await pdfDoc.embedPng(logoBuffer).catch(() => null) : null;
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]!;
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const images = getSlideImages(slide);
        const hasImage = images.length > 0;
        
        // Draw background
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          color: rgb(bgColor[0], bgColor[1], bgColor[2]),
        });
        
        // Draw slide number
        page.drawText(`${i + 1}`, {
          x: 30,
          y: pageHeight - 35,
          size: 12,
          font: boldFont,
          color: rgb(textColor[0], textColor[1], textColor[2]),
          opacity: 0.6,
        });
        
        // Embed and draw slide images
        if (hasImage) {
          const imgX = slide.type === "title" ? pageWidth - 280 : pageWidth - 320;
          const imgY = slide.type === "title" ? 150 : 120;
          const imgW = slide.type === "title" ? 220 : 260;
          const imgH = slide.type === "title" ? 240 : 280;
          
          // Try to embed the first image
          const firstImage = images[0];
          if (firstImage?.url) {
            const imgData = await fetchImageBuffer(firstImage.url);
            if (imgData) {
              try {
                const embeddedImg = imgData.type === "png" 
                  ? await pdfDoc.embedPng(imgData.buffer)
                  : await pdfDoc.embedJpg(imgData.buffer);
                
                // Calculate aspect ratio
                const aspectRatio = embeddedImg.width / embeddedImg.height;
                let drawW = imgW;
                let drawH = imgW / aspectRatio;
                if (drawH > imgH) {
                  drawH = imgH;
                  drawW = imgH * aspectRatio;
                }
                
                page.drawImage(embeddedImg, {
                  x: imgX + (imgW - drawW) / 2,
                  y: imgY + (imgH - drawH) / 2,
                  width: drawW,
                  height: drawH,
                });
              } catch {
                // Skip if image embedding fails
              }
            }
          }
        }
        
        const contentWidth = hasImage ? pageWidth - 340 : pageWidth - 120;
        
        if (slide.type === "title") {
          // Title slide
          const titleY = pageHeight / 2 + 30;
          page.drawText(slide.title, {
            x: 60,
            y: titleY,
            size: 36,
            font: boldFont,
            color: rgb(textColor[0], textColor[1], textColor[2]),
            maxWidth: contentWidth,
          });
          
          if (slide.subtitle) {
            page.drawText(slide.subtitle, {
              x: 60,
              y: titleY - 50,
              size: 18,
              font: font,
              color: rgb(textColor[0], textColor[1], textColor[2]),
              opacity: 0.8,
              maxWidth: contentWidth,
            });
          }
        } else {
          // Content slide
          page.drawText(slide.title, {
            x: 60,
            y: pageHeight - 80,
            size: 28,
            font: boldFont,
            color: rgb(textColor[0], textColor[1], textColor[2]),
            maxWidth: contentWidth,
          });
          
          // Draw bullet points
          const bullets = slide.bulletPoints || [];
          let bulletY = pageHeight - 140;
          
          for (const bullet of bullets) {
            if (bulletY < 60) break;
            
            // Draw bullet dot
            page.drawCircle({
              x: 70,
              y: bulletY + 5,
              size: 4,
              color: rgb(textColor[0], textColor[1], textColor[2]),
              opacity: 0.7,
            });
            
            // Draw bullet text
            page.drawText(bullet, {
              x: 90,
              y: bulletY,
              size: 14,
              font: font,
              color: rgb(textColor[0], textColor[1], textColor[2]),
              opacity: 0.9,
              maxWidth: contentWidth - 30,
            });
            
            bulletY -= 35;
          }
        }
        
        // Draw footer line
        page.drawLine({
          start: { x: 60, y: 30 },
          end: { x: pageWidth - 60, y: 30 },
          thickness: 1,
          color: rgb(textColor[0], textColor[1], textColor[2]),
          opacity: 0.2,
        });
        
        // Add watermark for free accounts
        if (!isPaidPlan) {
          const watermarkWidth = 210;
          const watermarkHeight = 36;
          const watermarkX = pageWidth - watermarkWidth - 18;
          const watermarkY = 16;
          
          // Background
          page.drawRectangle({
            x: watermarkX,
            y: watermarkY,
            width: watermarkWidth,
            height: watermarkHeight,
            color: rgb(13/255, 17/255, 23/255),
            opacity: 0.9,
            borderWidth: 0,
          });
          
          // Logo
          if (logoImage) {
            const desired = 24;
            page.drawImage(logoImage, {
              x: watermarkX + 10,
              y: watermarkY + (watermarkHeight - desired) / 2,
              width: desired,
              height: desired,
            });
          } else {
            page.drawRectangle({
              x: watermarkX + 10,
              y: watermarkY + 6,
              width: 24,
              height: 24,
              color: rgb(245/255, 158/255, 11/255),
            });
          }
          
          // Text
          page.drawText("Made with PPTMaster", {
            x: watermarkX + 44,
            y: watermarkY + 10,
            size: 13,
            font: boldFont,
            color: rgb(1, 1, 1),
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
          presentationId: id,
        },
      });
      
      return new NextResponse(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${presentation.title}.pdf"`,
        },
      });
    }

    if (format === "images") {
      // Check if user has paid plan for watermark
      const user = await db.user.findUnique({ where: { id: authUser.id }, select: { subscriptionPlan: true } });
      const isPaidPlan = user?.subscriptionPlan && ["plus", "pro", "ultra"].includes(user.subscriptionPlan);
      
      // Generate PNG images and pack them into a ZIP file
      // Create ZIP archive
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];
      
      // Collect chunks
      archive.on("data", (chunk: Buffer) => chunks.push(chunk));
      
      const archivePromise = new Promise<Buffer>((resolve, reject) => {
        archive.on("end", () => resolve(Buffer.concat(chunks)));
        archive.on("error", reject);
      });
      
      const themeType = getThemeType(theme);
      
      // Theme colors for SVG
      const bgColors: Record<string, string> = {
        dark: "#0a0a0b",
        light: "#f8fafc",
        sunset: "#1c1017",
        ocean: "#0a1628",
        aurora: "#0f0a1a",
        ember: "#1a0a0a",
        midnight: "#0c0a1d",
        cyber: "#0a0a0f",
        alien: "#0a0f0a",
        corporate: "#ffffff",
      };
      
      const textColors: Record<string, string> = {
        dark: "#fafafa",
        light: "#0f172a",
        sunset: "#ffffff",
        ocean: "#ffffff",
        aurora: "#ffffff",
        ember: "#ffffff",
        midnight: "#ffffff",
        cyber: "#ffffff",
        alien: "#ffffff",
        corporate: "#1f2937",
      };
      
      const bgColor = bgColors[themeType] || bgColors.dark!;
      const textColor = textColors[themeType] || textColors.dark!;
      
      // Generate PNG for each slide
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]!;
        const images = getSlideImages(slide);
        const hasImage = images.length > 0;
        
        // Fetch and embed image as base64 if available
        let imageElement = "";
        if (hasImage && images[0]?.url) {
          const imgData = await fetchImageAsBase64(images[0].url);
          if (imgData) {
            const imgX = slide.type === "title" ? 1400 : 1280;
            const imgY = slide.type === "title" ? 280 : 200;
            const imgW = slide.type === "title" ? 400 : 520;
            const imgH = slide.type === "title" ? 500 : 600;
            imageElement = `
  <image x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" 
         href="data:${imgData.mimeType};base64,${imgData.base64}" 
         preserveAspectRatio="xMidYMid slice"
         clip-path="inset(0 round 16px)"/>`;
          }
        }
        
        // Watermark for free accounts
        const watermark = !isPaidPlan ? `
  <g transform="translate(1540, 1016)">
    <rect x="0" y="0" width="350" height="48" rx="10" ry="10" fill="rgba(13,17,23,0.9)"/>
    ${logoDataUri ? `<image x="14" y="10" width="28" height="28" href="${logoDataUri}" />` : `<rect x="14" y="10" width="28" height="28" rx="6" fill="#f59e0b"/>`}
    <text x="52" y="32" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">Made with PPTMaster</text>
  </g>` : "";
        
        const contentWidth = hasImage ? 1200 : 1700;
        
        let svgContent: string;
        
        if (slide.type === "title") {
          svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="${bgColor}"/>
  <text x="60" y="60" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" opacity="0.6">${String(i + 1).padStart(2, "0")}</text>
  ${imageElement}
  <text x="${hasImage ? 120 : 960}" y="480" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="${textColor}" ${hasImage ? "" : 'text-anchor="middle"'}>${escapeHtml(slide.title.substring(0, 50))}${slide.title.length > 50 ? "..." : ""}</text>
  ${slide.subtitle ? `<text x="${hasImage ? 120 : 960}" y="580" font-family="Arial, sans-serif" font-size="32" fill="${textColor}" opacity="0.8" ${hasImage ? "" : 'text-anchor="middle"'}>${escapeHtml(slide.subtitle.substring(0, 80))}${slide.subtitle.length > 80 ? "..." : ""}</text>` : ""}
  <line x1="120" y1="1040" x2="1800" y2="1040" stroke="${textColor}" stroke-opacity="0.2" stroke-width="2"/>
  ${watermark}
</svg>`;
        } else {
          const bullets = slide.bulletPoints || [];
          const bulletsSvg = bullets.slice(0, 10).map((bullet, idx) => {
            const y = 280 + idx * 70;
            return `
  <circle cx="140" cy="${y + 10}" r="8" fill="${textColor}" opacity="0.7"/>
  <text x="180" y="${y + 16}" font-family="Arial, sans-serif" font-size="28" fill="${textColor}" opacity="0.9">${escapeHtml(bullet.substring(0, hasImage ? 60 : 100))}${bullet.length > (hasImage ? 60 : 100) ? "..." : ""}</text>`;
          }).join("");
          
          svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="${bgColor}"/>
  <text x="60" y="60" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" opacity="0.6">${String(i + 1).padStart(2, "0")}</text>
  ${imageElement}
  <text x="120" y="180" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="${textColor}">${escapeHtml(slide.title.substring(0, hasImage ? 35 : 50))}${slide.title.length > (hasImage ? 35 : 50) ? "..." : ""}</text>
  ${bulletsSvg}
  <line x1="120" y1="1040" x2="1800" y2="1040" stroke="${textColor}" stroke-opacity="0.2" stroke-width="2"/>
  ${watermark}
</svg>`;
        }
        
        // Convert SVG to PNG using resvg
        try {
          const resvg = new Resvg(svgContent, {
            fitTo: { mode: "width", value: 1920 },
          });
          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();
          
          archive.append(pngBuffer, { name: `slide-${String(i + 1).padStart(2, "0")}.png` });
        } catch (svgError) {
          console.error("SVG to PNG conversion error:", svgError);
          // Fallback: add SVG if PNG conversion fails
          archive.append(svgContent, { name: `slide-${String(i + 1).padStart(2, "0")}.svg` });
        }
      }
      
      // Finalize archive
      await archive.finalize();
      const zipBuffer = await archivePromise;
      
      // Log activity
      await db.activity.create({
        data: {
          userId: authUser.id,
          type: "export",
          description: `Exported "${presentation.title}" as Images (ZIP)`,
          presentationId: id,
        },
      });
      
      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${presentation.title}-slides.zip"`,
        },
      });
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
