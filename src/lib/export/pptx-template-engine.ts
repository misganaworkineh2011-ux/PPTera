import { type Theme } from "~/lib/themes";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

/**
 * Simple Template-Based PPTX Engine
 * Loads PPTX templates and replaces text placeholders
 */

interface SlideData {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  image?: { url: string; alt: string; source: string } | null;
  images?: { url: string; alt: string; source: string }[];
  layout?: string;
  transformedContent?: {
    intro?: string;
    items: { label?: string; text: string }[];
  };
}

interface ExportOptions {
  slides: SlideData[];
  theme: Theme;
  title: string;
  addWatermark: boolean;
  logoBuffer?: Buffer | null;
}

const THEME_MAP: Record<string, string> = {
  "elegant-noir": "dark",
  "arctic-frost": "light",
  "sunset-gradient": "sunset",
  "ocean-depths": "ocean",
  "aurora-borealis": "aurora",
  "ember-forge": "ember",
  "midnight-garden": "midnight",
  "cyber-neon": "cyber",
  "alien-tech": "alien",
  "corporate-clean": "corporate",
  "cosmic-voyage": "cosmic",
  "architectural-mono": "architectural",
  "anime-dreamscape": "anime",
  "hacker-terminal": "hacker",
};

const LAYOUT_SEQUENCES: Record<string, string[]> = {
  hacker: ["terminal-window", "matrix-cards", "code-block", "shell-prompt", "cyber-grid", "hack-split"],
  dark: ["left-content", "image-focus", "right-content", "split-diagonal", "minimal-left", "centered"],
  light: ["centered", "left-content", "cards-grid", "right-content", "quote-style", "minimal-left"],
  // Add other themes as needed
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function loadTemplateZip(themeType: string, layout: string): Promise<JSZip | null> {
  try {
    const templatePath = path.join(process.cwd(), "templates", "pptx", themeType, `${layout}.pptx`);
    
    if (!fs.existsSync(templatePath)) {
      return null;
    }

    const templateBuffer = await fs.promises.readFile(templatePath);
    return await JSZip.loadAsync(templateBuffer);
  } catch (error) {
    console.error(`Error loading template ${themeType}/${layout}:`, error);
    return null;
  }
}

async function replaceTextInXml(xml: string, replacements: Record<string, string>): Promise<string> {
  let result = xml;
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    const escapedValue = escapeXml(value);
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, escapedValue);
  }
  
  return result;
}

export async function generateFromTemplate(options: ExportOptions): Promise<Buffer> {
  const { slides, theme, title } = options;
  const themeType = THEME_MAP[theme.id] || "dark";
  const layouts = LAYOUT_SEQUENCES[themeType] || LAYOUT_SEQUENCES["dark"] || ["left-content"];

  // Load the first template as base
  const firstLayout = slides[0]?.layout || layouts[0] || "left-content";
  const baseZip = await loadTemplateZip(themeType, firstLayout);

  if (!baseZip) {
    throw new Error(`Base template not found: ${themeType}/${firstLayout}`);
  }

  // Process first slide
  const firstSlide = slides[0];
  if (firstSlide) {
    const items = firstSlide.transformedContent?.items || 
                  (firstSlide.bulletPoints || []).map(bp => ({ text: bp }));

    const replacements: Record<string, string> = {
      "{{TITLE}}": firstSlide.title,
      "{{SUBTITLE}}": firstSlide.subtitle || "",
      "{{SLIDE_NUMBER}}": "01",
      "{{TOTAL_SLIDES}}": String(slides.length).padStart(2, "0"),
    };

    // Add bullets
    items.forEach((item, idx) => {
      replacements[`{{BULLET${idx + 1}}}`] = item.text;
      const itemWithLabel = item as { text: string; label?: string };
      if (itemWithLabel.label) {
        replacements[`{{LABEL${idx + 1}}}`] = itemWithLabel.label;
      }
    });

    // Replace in slide1.xml
    const slide1Path = "ppt/slides/slide1.xml";
    const slide1File = baseZip.file(slide1Path);
    
    if (slide1File) {
      const slide1Xml = await slide1File.async("string");
      const modifiedXml = await replaceTextInXml(slide1Xml, replacements);
      baseZip.file(slide1Path, modifiedXml);
    }
  }

  // For now, we'll just export the first slide
  // Full implementation would duplicate slides for each content slide
  
  // Update presentation properties
  const corePropsPath = "docProps/core.xml";
  const corePropsFile = baseZip.file(corePropsPath);
  
  if (corePropsFile) {
    let coreXml = await corePropsFile.async("string");
    coreXml = coreXml.replace(/<dc:title>.*?<\/dc:title>/, `<dc:title>${escapeXml(title)}</dc:title>`);
    coreXml = coreXml.replace(/<dc:creator>.*?<\/dc:creator>/, `<dc:creator>PPTMaster</dc:creator>`);
    baseZip.file(corePropsPath, coreXml);
  }

  // Generate final PPTX
  const buffer = await baseZip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });

  return buffer;
}
