import PptxGenJS from "pptxgenjs";
import { type Theme } from "~/lib/themes";
import { generateSlideLayout, type SlideData } from "./pptx-layout-generators";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

/**
 * PPTX Generator using pptxgenjs
 * 
 * WATERMARK SYSTEM:
 * Uses Slide Master to make watermarks "uneditable" - users cannot click/select/move
 * the watermark elements in normal slide view. They would need to open Slide Master View
 * to modify them, which most users don't know how to do.
 * 
 * For Adobe-converted PPTX files, we post-process them to inject the Slide Master watermark.
 */

export interface ExportOptions {
  slides: SlideData[];
  theme: Theme;
  title: string;
  addWatermark: boolean;
}

// Slide Master names
const WATERMARK_MASTER = "PPTERA_BRANDED";
const PLAIN_MASTER = "PLAIN_SLIDE";

// Helper to load logo as base64
async function getLogoBase64(): Promise<string | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoBuffer.toString("base64")}`;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to load logo as raw buffer for XML injection
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

/**
 * Define Slide Masters for the presentation
 * Elements on Slide Masters are "uneditable" in normal view
 * Watermark positioned in bottom-right corner with dark background and white text
 */
function defineSlideMasters(
  pptx: PptxGenJS,
  logoBase64: string | null,
  addWatermark: boolean
): void {
  if (addWatermark) {
    const masterObjects: PptxGenJS.SlideMasterProps["objects"] = [];

    // Standard 16:9 slide is 10" x 5.625"
    // Position watermark in bottom-right corner using absolute inches
    const badgeWidth = logoBase64 ? 2.2 : 1.8;
    const badgeHeight = 0.35;
    const badgeX = 10 - badgeWidth - 0.15; // 0.15" from right edge
    const badgeY = 5.625 - badgeHeight - 0.12; // 0.12" from bottom edge

    // Add dark pill background for watermark - fully rounded, no border
    masterObjects.push({
      rect: {
        x: badgeX,
        y: badgeY,
        w: badgeWidth,
        h: badgeHeight,
        fill: { color: "000000" },
        rectRadius: 0.175, // Half of height for pill shape
      },
    });

    // Add logo inside the pill
    if (logoBase64) {
      masterObjects.push({
        image: {
          x: badgeX + 0.1,
          y: badgeY + 0.05,
          w: 0.25,
          h: 0.25,
          data: logoBase64,
        },
      });
    }

    // Add "Made with PPTera" text - white bold, centered vertically
    masterObjects.push({
      text: {
        text: "Made with PPTera",
        options: {
          x: logoBase64 ? badgeX + 0.4 : badgeX + 0.15,
          y: badgeY,
          w: logoBase64 ? 1.7 : 1.5,
          h: badgeHeight,
          fontSize: 10,
          fontFace: "Arial",
          bold: true,
          color: "FFFFFF",
          align: "left",
          valign: "middle",
          wrap: false,
        },
      },
    });

    pptx.defineSlideMaster({
      title: WATERMARK_MASTER,
      objects: masterObjects,
    });
  }

  pptx.defineSlideMaster({
    title: PLAIN_MASTER,
    objects: [],
  });
}

/**
 * Post-process an Adobe-converted PPTX to inject watermark into Slide Master
 * This makes the watermark "uneditable" in normal view - users would need to
 * go to View > Slide Master to modify it, which most users don't know how to do.
 */
export async function injectSlideMasterWatermark(
  pptxBuffer: Buffer
): Promise<Buffer> {
  const logoBuffer = getLogoBuffer();

  try {
    const zip = await JSZip.loadAsync(pptxBuffer);

    // Get slide dimensions from presentation.xml
    let slideWidth = 10;
    let slideHeight = 5.625;

    const presentationXml = await zip
      .file("ppt/presentation.xml")
      ?.async("string");
    if (presentationXml) {
      const sldSzTagMatch = presentationXml.match(/<(?:\w+:)?sldSz\s+[^>]*>/);
      if (sldSzTagMatch) {
        const sldSzTag = sldSzTagMatch[0];
        const cxMatch = sldSzTag.match(/cx=["'](\d+)["']/);
        const cyMatch = sldSzTag.match(/cy=["'](\d+)["']/);

        if (cxMatch && cxMatch[1] && cyMatch && cyMatch[1]) {
          const cx = parseInt(cxMatch[1]);
          const cy = parseInt(cyMatch[1]);
          slideWidth = cx / 914400;
          slideHeight = cy / 914400;
        }
      }
    }

    console.log(
      `[injectSlideMasterWatermark] Slide dimensions: ${slideWidth}" x ${slideHeight}"`
    );

    // Generate unique relationship IDs
    const logoRId = "rIdWatermarkLogo";
    const logoImagePath = "ppt/media/watermark_logo.png";

    // Add logo image to the PPTX package
    if (logoBuffer) {
      zip.file(logoImagePath, logoBuffer);
    }

    // Find all slide masters and inject watermark
    const slideMasterFiles: string[] = [];
    zip.folder("ppt/slideMasters")?.forEach((relativePath) => {
      if (relativePath.match(/^slideMaster\d+\.xml$/)) {
        slideMasterFiles.push(relativePath);
      }
    });

    console.log(
      `[injectSlideMasterWatermark] Found ${slideMasterFiles.length} slide masters`
    );

    for (const masterFile of slideMasterFiles) {
      const masterPath = `ppt/slideMasters/${masterFile}`;
      const masterRelsPath = `ppt/slideMasters/_rels/${masterFile}.rels`;

      let masterXml = await zip.file(masterPath)?.async("string");
      let masterRels = await zip.file(masterRelsPath)?.async("string");

      if (masterXml) {
        // Skip if watermark already exists
        if (masterXml.includes('name="Watermark Background"')) {
          continue;
        }

        // Add relationship for logo image if needed
        if (logoBuffer) {
          if (!masterRels) {
            masterRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
          }
          if (!masterRels.includes(`Id="${logoRId}"`)) {
            const newRel = `<Relationship Id="${logoRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/watermark_logo.png"/>`;
            masterRels = masterRels.replace(
              "</Relationships>",
              `${newRel}</Relationships>`
            );
            zip.file(masterRelsPath, masterRels);
          }
        }

        // Create watermark shapes XML
        const watermarkShapes = createSimpleWatermarkXml(
          logoRId,
          !!logoBuffer,
          slideWidth,
          slideHeight
        );

        // Insert watermark shapes into slide master's shape tree (spTree)
        if (masterXml.includes("</p:spTree>")) {
          masterXml = masterXml.replace(
            "</p:spTree>",
            `${watermarkShapes}</p:spTree>`
          );
          zip.file(masterPath, masterXml);
          console.log(
            `[injectSlideMasterWatermark] Injected watermark into ${masterPath}`
          );
        }
      }
    }

    // Also inject into slide layouts to ensure watermark appears
    const slideLayoutFiles: string[] = [];
    zip.folder("ppt/slideLayouts")?.forEach((relativePath) => {
      if (relativePath.match(/^slideLayout\d+\.xml$/)) {
        slideLayoutFiles.push(relativePath);
      }
    });

    for (const layoutFile of slideLayoutFiles) {
      const layoutPath = `ppt/slideLayouts/${layoutFile}`;
      const layoutRelsPath = `ppt/slideLayouts/_rels/${layoutFile}.rels`;

      let layoutXml = await zip.file(layoutPath)?.async("string");
      let layoutRels = await zip.file(layoutRelsPath)?.async("string");

      if (layoutXml) {
        // Skip if watermark already exists
        if (layoutXml.includes('name="Watermark Background"')) {
          continue;
        }

        // Add relationship for logo image if needed
        if (logoBuffer) {
          if (!layoutRels) {
            layoutRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
          }
          if (!layoutRels.includes(`Id="${logoRId}"`)) {
            const newRel = `<Relationship Id="${logoRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/watermark_logo.png"/>`;
            layoutRels = layoutRels.replace(
              "</Relationships>",
              `${newRel}</Relationships>`
            );
            zip.file(layoutRelsPath, layoutRels);
          }
        }

        // Create watermark shapes XML
        const watermarkShapes = createSimpleWatermarkXml(
          logoRId,
          !!logoBuffer,
          slideWidth,
          slideHeight
        );

        // Insert watermark shapes into slide layout's shape tree (spTree)
        if (layoutXml.includes("</p:spTree>")) {
          layoutXml = layoutXml.replace(
            "</p:spTree>",
            `${watermarkShapes}</p:spTree>`
          );
          zip.file(layoutPath, layoutXml);
        }
      }
    }

    // Ensure all slides show master shapes (showMasterSp="1")
    const slideFiles: string[] = [];
    zip.folder("ppt/slides")?.forEach((relativePath) => {
      if (relativePath.match(/^slide\d+\.xml$/)) {
        slideFiles.push(relativePath);
      }
    });

    for (const slideFile of slideFiles) {
      const slidePath = `ppt/slides/${slideFile}`;
      let slideXml = await zip.file(slidePath)?.async("string");

      if (slideXml) {
        // Enable showing master shapes if disabled
        if (slideXml.match(/showMasterSp=["']0["']/)) {
          slideXml = slideXml.replace(/showMasterSp=["']0["']/, 'showMasterSp="1"');
          zip.file(slidePath, slideXml);
        }
      }
    }

    // Generate the modified PPTX
    const modifiedBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    return modifiedBuffer;
  } catch (error) {
    console.error("[injectSlideMasterWatermark] Error:", error);
    return pptxBuffer;
  }
}

/**
 * Create simple watermark XML for direct slide injection
 * Positioned in bottom-right corner with dark pill background and white bold text
 */
function createSimpleWatermarkXml(
  logoRId: string,
  hasLogo: boolean,
  slideWidthInches: number,
  slideHeightInches: number
): string {
  const shapes: string[] = [];

  // EMU conversions (1 inch = 914400 EMUs)
  const inchToEmu = (inches: number) => Math.round(inches * 914400);

  // Badge dimensions and position (in inches)
  const badgeWidth = hasLogo ? 2.2 : 1.8;
  const badgeHeight = 0.35;
  const badgeX = slideWidthInches - badgeWidth - 0.15; // 0.15" from right edge
  const badgeY = slideHeightInches - badgeHeight - 0.12; // 0.12" from bottom edge

  // Add dark pill background shape
  shapes.push(`
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="99900" name="Watermark Background"/>
        <p:cNvSpPr/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="${inchToEmu(badgeX)}" y="${inchToEmu(badgeY)}"/>
          <a:ext cx="${inchToEmu(badgeWidth)}" cy="${inchToEmu(badgeHeight)}"/>
        </a:xfrm>
        <a:prstGeom prst="roundRect">
          <a:avLst>
            <a:gd name="adj" fmla="val 50000"/>
          </a:avLst>
        </a:prstGeom>
        <a:solidFill>
          <a:srgbClr val="000000"/>
        </a:solidFill>
        <a:ln>
          <a:noFill/>
        </a:ln>
      </p:spPr>
      <p:txBody>
        <a:bodyPr/>
        <a:lstStyle/>
        <a:p/>
      </p:txBody>
    </p:sp>
  `);

  // Logo position inside the pill
  if (hasLogo) {
    shapes.push(`
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="99901" name="Watermark Logo"/>
          <p:cNvPicPr>
            <a:picLocks noChangeAspect="1"/>
          </p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="${logoRId}"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="${inchToEmu(badgeX + 0.1)}" y="${inchToEmu(badgeY + 0.05)}"/>
            <a:ext cx="${inchToEmu(0.25)}" cy="${inchToEmu(0.25)}"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
        </p:spPr>
      </p:pic>
    `);
  }

  // Text position inside the pill
  const textX = hasLogo ? badgeX + 0.4 : badgeX + 0.15;
  const textW = hasLogo ? 1.7 : 1.5;

  // Add "Made with PPTera" text shape
  shapes.push(`
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="99902" name="Watermark Text"/>
        <p:cNvSpPr txBox="1"/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="${inchToEmu(textX)}" y="${inchToEmu(badgeY)}"/>
          <a:ext cx="${inchToEmu(textW)}" cy="${inchToEmu(badgeHeight)}"/>
        </a:xfrm>
        <a:prstGeom prst="rect">
          <a:avLst/>
        </a:prstGeom>
        <a:noFill/>
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="none" anchor="ctr"/>
        <a:lstStyle/>
        <a:p>
          <a:pPr algn="l"/>
          <a:r>
            <a:rPr lang="en-US" sz="1000" b="1" dirty="0">
              <a:solidFill>
                <a:srgbClr val="FFFFFF"/>
              </a:solidFill>
              <a:latin typeface="Arial"/>
            </a:rPr>
            <a:t>Made with PPTera</a:t>
          </a:r>
        </a:p>
      </p:txBody>
    </p:sp>
  `);

  return shapes.join("\n");
}

/**
 * Main export function - generates PPTX with editable content
 * Watermark is embedded in Slide Master (uneditable)
 */
export async function generatePptx(options: ExportOptions): Promise<Buffer> {
  const { slides, theme, title, addWatermark } = options;
  const pptx = new PptxGenJS();

  pptx.title = title;
  pptx.author = "PPTera";
  pptx.layout = "LAYOUT_16x9";

  const logoBase64 = addWatermark ? await getLogoBase64() : null;
  defineSlideMasters(pptx, logoBase64, addWatermark);

  const total = slides.length;

  for (let i = 0; i < total; i++) {
    const slideData = slides[i]!;
    await generateSlideLayoutWithMaster(
      pptx,
      slideData,
      theme,
      i,
      total,
      addWatermark ? WATERMARK_MASTER : undefined
    );
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer as Buffer;
}

/**
 * Wrapper that generates slide layout with master applied
 */
async function generateSlideLayoutWithMaster(
  pptx: PptxGenJS,
  slide: SlideData,
  theme: Theme,
  index: number,
  total: number,
  masterName?: string
): Promise<void> {
  const originalAddSlide = pptx.addSlide.bind(pptx);

  if (masterName) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pptx as any).addSlide = (options?: PptxGenJS.AddSlideProps | string) => {
      const opts =
        typeof options === "string" ? { masterName: options } : options;
      return originalAddSlide({
        ...opts,
        masterName: masterName,
      });
    };
  }

  try {
    await generateSlideLayout(pptx, slide, theme, index, total);
  } finally {
    pptx.addSlide = originalAddSlide;
  }
}
