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
 */
function defineSlideMasters(
  pptx: PptxGenJS,
  logoBase64: string | null,
  addWatermark: boolean
): void {
  if (addWatermark) {
    const masterObjects: PptxGenJS.SlideMasterProps["objects"] = [];

    // Add logo in bottom-right corner (uneditable) - smaller size
    if (logoBase64) {
      masterObjects.push({
        image: {
          x: 8.5,
          y: 5.0,
          w: 0.22,
          h: 0.22,
          data: logoBase64,
        },
      });
    }

    // Add "Made with PPTMaster" text watermark (uneditable) - smaller
    masterObjects.push({
      text: {
        text: "Made with PPTMaster",
        options: {
          x: logoBase64 ? 8.75 : 8.3,
          y: 5.0,
          w: 1.3,
          h: 0.22,
          fontSize: 8,
          fontFace: "Arial",
          color: "888888",
          align: "left",
          valign: "middle",
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

    // Generate unique relationship IDs
    const logoRId = "rIdLogo" + Date.now();
    const logoImagePath = "ppt/media/watermark_logo.png";

    // Add logo image to the PPTX package
    if (logoBuffer) {
      zip.file(logoImagePath, logoBuffer);
    }

    // Find and modify the slide master
    const slideMasterPath = "ppt/slideMasters/slideMaster1.xml";
    const slideMasterRelsPath = "ppt/slideMasters/_rels/slideMaster1.xml.rels";

    let slideMasterXml = await zip.file(slideMasterPath)?.async("string");
    let slideMasterRels = await zip.file(slideMasterRelsPath)?.async("string");

    if (slideMasterXml && slideMasterRels) {
      // Add relationship for logo image
      if (logoBuffer) {
        const newRel = `<Relationship Id="${logoRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/watermark_logo.png"/>`;
        slideMasterRels = slideMasterRels.replace(
          "</Relationships>",
          `${newRel}</Relationships>`
        );
        zip.file(slideMasterRelsPath, slideMasterRels);
      }

      // Create watermark shapes XML
      const watermarkShapes = createWatermarkShapesXml(logoRId, !!logoBuffer);

      // Insert watermark shapes into slide master's shape tree (spTree)
      if (slideMasterXml.includes("</p:spTree>")) {
        slideMasterXml = slideMasterXml.replace(
          "</p:spTree>",
          `${watermarkShapes}</p:spTree>`
        );
      } else if (slideMasterXml.includes("</p:cSld>")) {
        const spTreeWithWatermark = `<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${watermarkShapes}</p:spTree>`;
        slideMasterXml = slideMasterXml.replace(
          "</p:cSld>",
          `${spTreeWithWatermark}</p:cSld>`
        );
      }

      zip.file(slideMasterPath, slideMasterXml);
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
 * Smaller size with "Made with PPTMaster" text
 */
function createWatermarkShapesXml(logoRId: string, hasLogo: boolean): string {
  const shapes: string[] = [];

  // EMU conversions (1 inch = 914400 EMUs)
  const inchToEmu = (inches: number) => Math.round(inches * 914400);

  // Logo position: bottom-right corner - smaller
  const logoX = inchToEmu(8.5);
  const logoY = inchToEmu(5.0);
  const logoW = inchToEmu(0.22);
  const logoH = inchToEmu(0.22);

  // Text position: next to logo - smaller
  const textX = hasLogo ? inchToEmu(8.75) : inchToEmu(8.3);
  const textY = inchToEmu(5.0);
  const textW = inchToEmu(1.3);
  const textH = inchToEmu(0.22);

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

  // Add "Made with PPTMaster" text shape - smaller font
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
        <a:bodyPr wrap="square" anchor="ctr"/>
        <a:lstStyle/>
        <a:p>
          <a:pPr algn="l"/>
          <a:r>
            <a:rPr lang="en-US" sz="800" dirty="0">
              <a:solidFill>
                <a:srgbClr val="888888"/>
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
