/**
 * PPTX Template Generator
 * Generates .pptx template files for all themes and layouts
 * Run with: npx tsx scripts/generate-pptx-templates.ts
 */

import PptxGenJS from "pptxgenjs";
import fs from "fs";
import path from "path";
import { themes } from "../src/lib/themes";
import { generateSlideLayout, type SlideData } from "../src/lib/export/pptx-layout-generators";

// Layout types to generate
const LAYOUTS = [
  "title-center",
  "title-left",
  "content-left-image-right",
  "content-right-image-left",
  "content-grid-2",
  "content-grid-3",
  "content-grid-4",
  "content-cards-2",
  "content-cards-3",
  "content-quote",
  "content-stats",
  "content-full-image",
  "content-timeline",
  "content-comparison"
];

// Mock data for templates
// We use {{PLACEHOLDERS}} so users know where content goes if they open the template.
// These templates match exactly what the export system produces because they share the same generator.
function getMockSlideData(layout: string): SlideData {
  return {
    type: layout.startsWith("title") ? "title" : "content",
    title: "{{TITLE}}",
    subtitle: "{{SUBTITLE}}",
    layout: layout,
    bulletPoints: [
      "{{BULLET1}}",
      "{{BULLET2}}",
      "{{BULLET3}}",
      "{{BULLET4}}",
      "{{BULLET5}}",
      "{{BULLET6}}"
    ],
    // Pass placeholder so the generator adds a shape instead of failing to fetch
    image: { url: "placeholder", alt: "Placeholder", source: "placeholder" },
    images: Array(4).fill({ url: "placeholder", alt: "Placeholder", source: "placeholder" }),
    transformedContent: {
      items: [
        { label: "{{LABEL1}}", text: "{{BULLET1}}" },
        { label: "{{LABEL2}}", text: "{{BULLET2}}" },
        { label: "{{LABEL3}}", text: "{{BULLET3}}" },
        { label: "{{LABEL4}}", text: "{{BULLET4}}" },
        { label: "{{LABEL5}}", text: "{{BULLET5}}" },
        { label: "{{LABEL6}}", text: "{{BULLET6}}" },
      ]
    }
  };
}

async function generateAllTemplates() {
  const baseDir = path.join(process.cwd(), "templates", "pptx");

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  let totalGenerated = 0;
  const errors: string[] = [];

  // Iterate through themes from the library
  for (const theme of themes) {
    const themeDir = path.join(baseDir, theme.id);

    if (!fs.existsSync(themeDir)) {
      fs.mkdirSync(themeDir, { recursive: true });
    }

    console.log(`\nGenerating templates for: ${theme.name} (${theme.id})`);

    for (const layout of LAYOUTS) {
      try {
        const pptx = new PptxGenJS();
        pptx.layout = "LAYOUT_16x9";
        pptx.title = `${theme.name} - ${layout}`;
        pptx.author = "PPTera";

        const slideData = getMockSlideData(layout);

        // Generate using the unified shared logic
        await generateSlideLayout(pptx, slideData, theme, 0, 0);

        const filePath = path.join(themeDir, `${layout}.pptx`);
        await pptx.writeFile({ fileName: filePath });

        console.log(`  OK: ${layout}.pptx`);
        totalGenerated++;
      } catch (error) {
        const errorMsg = `${theme.id}/${layout}: ${error}`;
        errors.push(errorMsg);
        console.log(`  ERROR: ${layout}.pptx - ${error}`);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Template generation complete!");
  console.log(`Total templates: ${totalGenerated}`);
  console.log(`Themes: ${themes.length}`);
  console.log(`Layouts per theme: ${LAYOUTS.length}`);

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach((e) => console.log("  - " + e));
  }
}

generateAllTemplates().catch(console.error);
