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
const WATERMARK_MASTER = "PPTMASTER_BRANDED";
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

    // Add "Made with PPTMaster" text - white bold, centered vertically
    masterObjects.push({
      text: {
        text: "Made with PPTMaster",
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
 * Post-process an Adobe-converted PPTX to inject uneditable Slide Master watermark
 * This modifies the PPTX XML directly to add watermark elements to the slide master
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
      // Match sldSz tag with any namespace prefix (e.g. p:sldSz, a:sldSz, or just sldSz)
      const sldSzTagMatch = presentationXml.match(/<(?:\w+:)?sldSz\s+[^>]*>/);
      if (sldSzTagMatch) {
        const sldSzTag = sldSzTagMatch[0];
        // Match cx and cy with single or double quotes
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

    // Generate unique relationship IDs
    const logoRId = "rIdLogo" + Date.now();
    const logoImagePath = "ppt/media/watermark_logo.png";

    // Add logo image to the PPTX package
    if (logoBuffer) {
      zip.file(logoImagePath, logoBuffer);
    }

    // Find all slide masters
    const slideMasterFiles: string[] = [];
    zip.folder("ppt/slideMasters")?.forEach((relativePath, file) => {
      if (relativePath.match(/^slideMaster\d+\.xml$/)) {
        slideMasterFiles.push(relativePath);
      }
    });

    console.log(`[injectSlideMasterWatermark] Found ${slideMasterFiles.length} slide masters`);

    for (const slideMasterFile of slideMasterFiles) {
      const slideMasterPath = `ppt/slideMasters/${slideMasterFile}`;
      const slideMasterRelsPath = `ppt/slideMasters/_rels/${slideMasterFile}.rels`;

      let slideMasterXml = await zip.file(slideMasterPath)?.async("string");
      let slideMasterRels = await zip.file(slideMasterRelsPath)?.async("string");

      if (slideMasterXml) {
        // Add relationship for logo image
        if (logoBuffer) {
          // If rels file doesn't exist, create it
          if (!slideMasterRels) {
            slideMasterRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
          }

          // Check if relationship already exists to avoid duplicates
          if (!slideMasterRels.includes(`Target="../media/watermark_logo.png"`)) {
            const newRel = `<Relationship Id="${logoRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/watermark_logo.png"/>`;
            slideMasterRels = slideMasterRels.replace(
              "</Relationships>",
              `${newRel}</Relationships>`
            );
            zip.file(slideMasterRelsPath, slideMasterRels);
          }
        }

        // Create watermark shapes XML
        const watermarkShapes = createWatermarkShapesXml(
          logoRId,
          !!logoBuffer,
          slideWidth,
          slideHeight,
          slideMasterXml
        );

        // Insert watermark shapes into slide master's shape tree (spTree)
        // We need to be careful not to break the XML structure
        // The spTree usually ends with </p:spTree>
        if (slideMasterXml.includes("</p:spTree>")) {
          // Check if we already injected watermark (simple check)
          if (!slideMasterXml.includes('name="Watermark Background"')) {
             slideMasterXml = slideMasterXml.replace(
              "</p:spTree>",
              `${watermarkShapes}</p:spTree>`
            );
            zip.file(slideMasterPath, slideMasterXml);
            console.log(`[injectSlideMasterWatermark] Injected watermark into ${slideMasterPath}`);
          }
        } else if (slideMasterXml.includes("</p:cSld>")) {
           if (!slideMasterXml.includes('name="Watermark Background"')) {
            const spTreeWithWatermark = `<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${watermarkShapes}</p:spTree>`;
            slideMasterXml = slideMasterXml.replace(
              "</p:cSld>",
              `${spTreeWithWatermark}</p:cSld>`
            );
            zip.file(slideMasterPath, slideMasterXml);
            console.log(`[injectSlideMasterWatermark] Injected watermark into ${slideMasterPath} (created spTree)`);
           }
        }
      }
    }

    // Ensure all slides show master shapes
    const slideFiles: string[] = [];
    zip.folder("ppt/slides")?.forEach((relativePath, file) => {
      if (relativePath.match(/^slide\d+\.xml$/)) {
        slideFiles.push(relativePath);
      }
    });

    for (const slideFile of slideFiles) {
      const slidePath = `ppt/slides/${slideFile}`;
      let slideXml = await zip.file(slidePath)?.async("string");
      if (slideXml) {
        // Check for showMasterSp="0" or "false" and enable it
        if (slideXml.match(/showMasterSp=["'](?:0|false)["']/)) {
          slideXml = slideXml.replace(/showMasterSp=["'](?:0|false)["']/, 'showMasterSp="1"');
          zip.file(slidePath, slideXml);
          console.log(`[injectSlideMasterWatermark] Enabled master shapes on ${slidePath}`);
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
 * Create XML for watermark shapes to inject into slide master
 * These shapes will be uneditable in normal slide view
 * Positioned in bottom-right corner with dark pill background and white bold text
 */
function createWatermarkShapesXml(
  logoRId: string,
  hasLogo: boolean,
  physicalWidthInches: number,
  physicalHeightInches: number,
  slideMasterXml: string
): string {
  const shapes: string[] = [];

  // Determine coordinate system from slide master
  let layoutWidthEmu = physicalWidthInches * 914400;
  let layoutHeightEmu = physicalHeightInches * 914400;

  // Try to find custom coordinate system in spTree
  const spTreeStart = slideMasterXml.indexOf("<p:spTree>");
  if (spTreeStart !== -1) {
    // Look for the first grpSpPr after spTree start, which belongs to the root group
    const afterSpTree = slideMasterXml.substring(spTreeStart);
    const grpSpPrMatch = afterSpTree.match(/<p:grpSpPr>([\s\S]*?)<\/p:grpSpPr>/);
    
    if (grpSpPrMatch && grpSpPrMatch[1]) {
      const xfrmContent = grpSpPrMatch[1];
      // Look for chExt inside the xfrm of grpSpPr
      const chExtMatch = xfrmContent.match(/<a:chExt\s+([^>]+)>/);
      if (chExtMatch && chExtMatch[1]) {
        const cxMatch = chExtMatch[1].match(/cx=["'](\d+)["']/);
        const cyMatch = chExtMatch[1].match(/cy=["'](\d+)["']/);
        if (cxMatch && cxMatch[1] && cyMatch && cyMatch[1]) {
          layoutWidthEmu = parseInt(cxMatch[1]);
          layoutHeightEmu = parseInt(cyMatch[1]);
        }
      }
    }
  }

  // Calculate scaling factors
  const emuPerInchX = layoutWidthEmu / physicalWidthInches;
  const emuPerInchY = layoutHeightEmu / physicalHeightInches;

  const inchToEmuX = (inches: number) => Math.round(inches * emuPerInchX);
  const inchToEmuY = (inches: number) => Math.round(inches * emuPerInchY);

  // Badge dimensions and position (in inches)
  const badgeWidth = hasLogo ? 2.2 : 1.8;
  const badgeHeight = 0.35;
  
  // Calculate position in inches first
  const badgeXInch = physicalWidthInches - badgeWidth - 0.15; // 0.15" from right edge
  const badgeYInch = physicalHeightInches - badgeHeight - 0.12; // 0.12" from bottom edge

  // Convert to coordinate system units
  const badgeX = inchToEmuX(badgeXInch);
  const badgeY = inchToEmuY(badgeYInch);
  const badgeW = inchToEmuX(badgeWidth);
  const badgeH = inchToEmuY(badgeHeight);

  // Add dark pill background shape - fully rounded, no border
  shapes.push(`
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="99900" name="Watermark Background"/>
        <p:cNvSpPr/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="${badgeX}" y="${badgeY}"/>
          <a:ext cx="${badgeW}" cy="${badgeH}"/>
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
  const logoX = inchToEmuX(badgeXInch + 0.1);
  const logoY = inchToEmuY(badgeYInch + 0.05);
  const logoW = inchToEmuX(0.25);
  const logoH = inchToEmuY(0.25);

  // Text position inside the pill
  const textX = inchToEmuX(hasLogo ? badgeXInch + 0.4 : badgeXInch + 0.15);
  const textY = inchToEmuY(badgeYInch);
  const textW = inchToEmuX(hasLogo ? 1.7 : 1.5);
  const textH = inchToEmuY(badgeHeight);

  // Add logo image shape
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
            <a:off x="${logoX}" y="${logoY}"/>
            <a:ext cx="${logoW}" cy="${logoH}"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
        </p:spPr>
      </p:pic>
    `);
  }

  // Add "Made with PPTMaster" text shape - white bold text, centered vertically
  shapes.push(`
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="99902" name="Watermark Text"/>
        <p:cNvSpPr txBox="1"/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="${textX}" y="${textY}"/>
          <a:ext cx="${textW}" cy="${textH}"/>
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
            <a:t>Made with PPTMaster</a:t>
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
  pptx.author = "PPTMaster";
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
