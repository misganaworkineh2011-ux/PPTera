/**
 * Screenshot-based export for PDF and Images
 * Uses Puppeteer to render slides and capture high-quality screenshots
 */

import puppeteer, { Browser, Page } from "puppeteer";

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
  speakerNotes?: string[];
}

interface ExportOptions {
  presentationId: string;
  slides: SlideData[];
  themeId: string;
  title: string;
  baseUrl: string;
  addWatermark: boolean;
  format: "pdf" | "png";
  width?: number;
  height?: number;
}

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
        "--font-render-hinting=none",
      ],
    });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Capture a single slide as PNG buffer
 */
export async function captureSlideScreenshot(
  page: Page,
  slideIndex: number,
  options: {
    presentationId: string;
    baseUrl: string;
    width: number;
    height: number;
  }
): Promise<Buffer> {
  const { presentationId, baseUrl, width, height } = options;
  
  // Navigate to the export render page with slide index
  const url = `${baseUrl}/api/export-render/${presentationId}?slide=${slideIndex}`;
  
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(url, { 
    waitUntil: "networkidle0",
    timeout: 30000,
  });
  
  // Wait for slide to be fully rendered
  await page.waitForSelector("[data-slide-rendered]", { timeout: 10000 }).catch(() => {
    // If selector not found, wait a bit more
    return new Promise(resolve => setTimeout(resolve, 2000));
  });
  
  // Additional wait for images and fonts
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const screenshot = await page.screenshot({
    type: "png",
    fullPage: false,
    clip: { x: 0, y: 0, width, height },
  });
  
  return Buffer.from(screenshot);
}

/**
 * Export presentation slides as PNG images
 */
export async function exportSlidesAsPng(
  options: ExportOptions
): Promise<Buffer[]> {
  const { slides, presentationId, baseUrl, width = 1920, height = 1080 } = options;
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  const screenshots: Buffer[] = [];
  
  try {
    for (let i = 0; i < slides.length; i++) {
      const screenshot = await captureSlideScreenshot(page, i, {
        presentationId,
        baseUrl,
        width,
        height,
      });
      screenshots.push(screenshot);
    }
  } finally {
    await page.close();
  }
  
  return screenshots;
}

/**
 * Export presentation as PDF using Puppeteer
 */
export async function exportSlidesAsPdf(
  options: ExportOptions
): Promise<Buffer> {
  const { slides, presentationId, baseUrl, title, addWatermark, width = 1920, height = 1080 } = options;
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Create HTML document with all slides
    const slidesHtml = slides.map((_, index) => `
      <div class="slide-page" style="page-break-after: always; width: ${width}px; height: ${height}px; position: relative;">
        <iframe 
          src="${baseUrl}/api/export-render/${presentationId}?slide=${index}" 
          style="width: 100%; height: 100%; border: none;"
        ></iframe>
        ${addWatermark ? `
          <div style="position: absolute; bottom: 20px; right: 20px; font-size: 14px; color: rgba(255,255,255,0.7); font-family: sans-serif;">
            Made with PPTMaster
          </div>
        ` : ""}
      </div>
    `).join("");
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: white; }
            .slide-page { 
              width: ${width}px; 
              height: ${height}px; 
              overflow: hidden;
            }
            @media print {
              .slide-page { page-break-after: always; }
            }
          </style>
        </head>
        <body>${slidesHtml}</body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.setViewport({ width, height });
    
    // Wait for all iframes to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const pdfBuffer = await page.pdf({
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      preferCSSPageSize: true,
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
