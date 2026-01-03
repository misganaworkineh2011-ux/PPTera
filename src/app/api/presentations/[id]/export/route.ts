import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";
import { PDFDocument } from "pdf-lib";
import archiver from "archiver";
import { injectSlideMasterWatermark } from "~/lib/export/pptx-generator";
import {
  isAdobeConfigured,
  convertPdfToPptx,
} from "~/lib/export/adobe-pdf-services";
import { getThemeById, getDefaultTheme } from "~/lib/themes";
import {
  isCustomThemeId,
  getCustomThemeDbId,
  convertCustomThemeToTheme,
} from "~/lib/custom-theme-utils";

// Use puppeteer-core with @sparticuz/chromium for serverless compatibility
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Helper to get browser instance
async function getBrowser() {
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
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

async function exportPresentation(
  presentationId: string,
  userId: string,
  format: "pdf" | "pptx" | "images",
  range: "all" | "current" | "custom" = "all",
  customRange?: { from: number; to: number }
) {
  if (!format || !["pdf", "pptx", "images"].includes(format)) {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const presentation = await db.presentation.findFirst({
    where: {
      id: presentationId,
      OR: [
        { userId: userId },
        { collaborations: { some: { userId: userId } } },
      ],
    },
  });

  if (!presentation) {
    return NextResponse.json(
      { error: "Presentation not found" },
      { status: 404 }
    );
  }

  const allSlides = (presentation.slides as unknown as SlideData[]) || [];

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

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true },
  });
  const isPaidPlan =
    user?.subscriptionPlan &&
    ["plus", "pro", "ultra"].includes(user.subscriptionPlan);
  const addWatermark = !isPaidPlan;

  const themeId =
    (presentation.content as { theme?: string })?.theme || "sprout";
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

  const slidesToExport = slideIndices.map((i) => allSlides[i]!);

  console.log(
    `[Export] Starting ${format} export for presentation ${presentationId}`
  );
  console.log(
    `[Export] Theme: ${theme.id}, Slides: ${slidesToExport.length}, Watermark: ${addWatermark}`
  );

  // PPTX Export - Using Adobe PDF Services for pixel-perfect AND editable output
  if (format === "pptx") {
    // Check if Adobe is configured
    if (!isAdobeConfigured()) {
      return NextResponse.json(
        { error: "PPTX export requires Adobe PDF Services configuration" },
        { status: 503 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    let browser;
    try {
      // Generate the pixel-perfect PDF using Puppeteer
      console.log(`[Export PPTX] Generating PDF for Adobe conversion...`);
      browser = await getBrowser();

      const page = await browser.newPage();
      const pageWidth = 1920;
      const pageHeight = 1080;
      await page.setViewport({
        width: pageWidth,
        height: pageHeight,
        deviceScaleFactor: 1,
      });

      // Generate PDF for each slide and merge them
      const pdfBuffers: Buffer[] = [];

      for (let i = 0; i < slideIndices.length; i++) {
        const slideIndex = slideIndices[i]!;
        // DON'T render watermark in HTML - we'll inject it as uneditable Slide Master element after Adobe conversion
        const renderUrl = `${baseUrl}/export-slide/${presentationId}/${slideIndex}?theme=${encodeURIComponent(themeId)}&watermark=false`;

        console.log(`[Export PPTX] Rendering slide ${slideIndex + 1} to PDF...`);

        await page.goto(renderUrl, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });

        await page
          .waitForSelector('[data-slide-container="true"]', { timeout: 15000 })
          .catch(() => {});

        // Wait for images to load
        await page.evaluate(async () => {
          const images = document.querySelectorAll("img");
          await Promise.all(
            Array.from(images).map((img) => {
              if (img.complete) return Promise.resolve();
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
                setTimeout(resolve, 5000);
              });
            })
          );
        });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const pdfBuffer = await page.pdf({
          width: `${pageWidth}px`,
          height: `${pageHeight}px`,
          printBackground: true,
          preferCSSPageSize: false,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        pdfBuffers.push(Buffer.from(pdfBuffer));
      }

      await browser.close();
      browser = undefined;

      // Merge all PDF pages
      const mergedPdf = await PDFDocument.create();
      for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      }
      const finalPdfBytes = await mergedPdf.save();
      const pdfBuffer = Buffer.from(finalPdfBytes);

      // Convert PDF to PPTX using Adobe PDF Services
      console.log(`[Export PPTX] Using Adobe PDF Services for conversion...`);
      let pptxBuffer = await convertPdfToPptx(pdfBuffer);

      // Inject uneditable Slide Master watermark for free users
      if (addWatermark) {
        console.log(`[Export PPTX] Injecting uneditable Slide Master watermark...`);
        pptxBuffer = await injectSlideMasterWatermark(pptxBuffer);
      }

      await db.activity.create({
        data: {
          userId: userId,
          type: "export",
          description: `Exported "${presentation.title}" as PPTX`,
          metadata: {
            presentationId: presentationId,
            format: "pptx",
            slideCount: slidesToExport.length,
            method: "adobe",
          },
        },
      });

      return new NextResponse(new Uint8Array(pptxBuffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(presentation.title)}.pptx"`,
          "Content-Length": pptxBuffer.length.toString(),
        },
      });
    } catch (error) {
      console.error("[Export PPTX] Error:", error);
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.error("[Export PPTX] Error closing browser:", e);
        }
      }

      return NextResponse.json(
        {
          error: "PPTX export failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  // PDF Export - Using Puppeteer for pixel-perfect rendering with selectable text
  if (format === "pdf") {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    let browser;
    try {
      browser = await getBrowser();

      const page = await browser.newPage();
      
      // Set viewport for 16:9 aspect ratio
      const pageWidth = 1920;
      const pageHeight = 1080;
      await page.setViewport({
        width: pageWidth,
        height: pageHeight,
        deviceScaleFactor: 1,
      });

      // Generate PDF for each slide and merge them
      const pdfBuffers: Buffer[] = [];

      for (let i = 0; i < slideIndices.length; i++) {
        const slideIndex = slideIndices[i]!;
        // Use the export-slide page which renders actual React components
        const renderUrl = `${baseUrl}/export-slide/${presentationId}/${slideIndex}?theme=${encodeURIComponent(themeId)}&watermark=${addWatermark}`;

        console.log(`[Export PDF] Rendering slide ${slideIndex + 1}...`);

        await page.goto(renderUrl, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });

        // Wait for slide to render
        await page
          .waitForSelector('[data-slide-container="true"]', { timeout: 15000 })
          .catch(() => {});

        // Wait for images to load
        await page.evaluate(async () => {
          const images = document.querySelectorAll("img");
          await Promise.all(
            Array.from(images).map((img) => {
              if (img.complete) return Promise.resolve();
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
                setTimeout(resolve, 5000);
              });
            })
          );
        });

        // Wait for fonts and CSS
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate PDF with Puppeteer - this creates selectable text!
        const pdfBuffer = await page.pdf({
          width: `${pageWidth}px`,
          height: `${pageHeight}px`,
          printBackground: true,
          preferCSSPageSize: false,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        pdfBuffers.push(Buffer.from(pdfBuffer));
      }

      await browser.close();

      // Merge all PDF pages into one document
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      }

      const finalPdfBytes = await mergedPdf.save();

      await db.activity.create({
        data: {
          userId: userId,
          type: "export",
          description: `Exported "${presentation.title}" as PDF`,
          metadata: {
            presentationId: presentationId,
            format: "pdf",
            slideCount: slidesToExport.length,
          },
        },
      });

      return new NextResponse(Buffer.from(finalPdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(presentation.title)}.pdf"`,
          "Content-Length": finalPdfBytes.length.toString(),
        },
      });
    } catch (error) {
      console.error("[Export PDF] Puppeteer error:", error);
      if (browser) await browser.close();
      
      return NextResponse.json(
        { error: "PDF export failed", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  }

  // Image Export - Screenshots as PNG
  if (format === "images") {
    const chunks: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));

    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", reject);
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const pageWidth = 1920;
    const pageHeight = 1080;

    let browser;
    try {
      browser = await getBrowser();

      const page = await browser.newPage();
      await page.setViewport({
        width: pageWidth,
        height: pageHeight,
        deviceScaleFactor: 2, // High DPI for crisp images
      });

      for (let i = 0; i < slideIndices.length; i++) {
        const slideIndex = slideIndices[i]!;
        // Use the export-slide page which renders actual React components
        const renderUrl = `${baseUrl}/export-slide/${presentationId}/${slideIndex}?theme=${encodeURIComponent(themeId)}&watermark=${addWatermark}`;

        console.log(`[Export Images] Capturing slide ${slideIndex + 1}...`);

        await page.goto(renderUrl, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });

        await page
          .waitForSelector('[data-slide-container="true"]', { timeout: 15000 })
          .catch(() => {});

        // Wait for images to load
        await page.evaluate(async () => {
          const images = document.querySelectorAll("img");
          await Promise.all(
            Array.from(images).map((img) => {
              if (img.complete) return Promise.resolve();
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
                setTimeout(resolve, 5000);
              });
            })
          );
        });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const slideElement = await page.$('[data-slide-container="true"]');
        let screenshot: Buffer;

        if (slideElement) {
          screenshot = (await slideElement.screenshot({
            type: "png",
          })) as Buffer;
        } else {
          screenshot = (await page.screenshot({
            type: "png",
            fullPage: false,
            clip: { x: 0, y: 0, width: pageWidth, height: pageHeight },
          })) as Buffer;
        }

        archive.append(Buffer.from(screenshot), {
          name: `slide_${slideIndex + 1}.png`,
        });
      }

      await browser.close();
    } catch (puppeteerError) {
      console.error("[Export Images] Puppeteer error:", puppeteerError);
      if (browser) await browser.close();

      // Fallback: extract images from slides
      for (let i = 0; i < slidesToExport.length; i++) {
        const slide = slidesToExport[i]!;
        const images = getSlideImages(slide);

        for (let j = 0; j < images.length; j++) {
          const img = images[j]!;
          const imgBuffer = await fetchImageAsBuffer(img.url);
          if (imgBuffer) {
            const ext = img.url.includes(".png") ? "png" : "jpg";
            archive.append(imgBuffer, {
              name: `slide_${i + 1}_image_${j + 1}.${ext}`,
            });
          }
        }
      }
    }

    // Add text content file
    const slideContent = slidesToExport
      .map((slide, i) => {
        const items: TransformedBulletItem[] =
          slide.transformedContent?.items ||
          (slide.bulletPoints || []).map((bp) => ({ text: bp }));
        const bullets = items
          .map((item) =>
            item.label ? `  - ${item.label}: ${item.text}` : `  - ${item.text}`
          )
          .join("\n");
        return `Slide ${i + 1}: ${slide.title}\n${slide.subtitle ? `Subtitle: ${slide.subtitle}\n` : ""}${bullets}`;
      })
      .join("\n\n---\n\n");

    archive.append(slideContent, { name: "slides_content.txt" });

    await archive.finalize();
    const zipBuffer = await archivePromise;

    await db.activity.create({
      data: {
        userId: userId,
        type: "export",
        description: `Exported "${presentation.title}" images as ZIP`,
        metadata: {
          presentationId: presentationId,
          format: "images",
          slideCount: slidesToExport.length,
        },
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
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const format = searchParams.get("format") as "pdf" | "pptx" | "images";
    const range =
      (searchParams.get("range") as "all" | "current" | "custom") || "all";
    const from = parseInt(searchParams.get("from") || "0");
    const to = parseInt(searchParams.get("to") || "0");

    const customRange = from > 0 || to > 0 ? { from, to } : undefined;

    return exportPresentation(id, authUser.id, format, range, customRange);
  } catch (error) {
    console.error("[Export GET] Error:", error);
    return NextResponse.json(
      {
        error: "Export failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
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

    return exportPresentation(id, authUser.id, format, range || "all", customRange);
  } catch (error) {
    console.error("[Export POST] Error:", error);
    return NextResponse.json(
      {
        error: "Export failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getSlideImages(slide: SlideData): SlideImage[] {
  const images: SlideImage[] = [];
  if (slide.images?.length) {
    images.push(
      ...slide.images.filter((img) => img.url && img.source !== "placeholder")
    );
  }
  if (slide.image?.url && slide.image.source !== "placeholder") {
    if (!images.some((img) => img.url === slide.image?.url)) {
      images.unshift(slide.image);
    }
  }
  return images;
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
