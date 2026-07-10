import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { LAYOUT_DEFINITIONS } from "../registry/layout-definitions";

/**
 * Every style id the registry can emit is persisted verbatim as
 * slide.contentLayout, so it MUST exist somewhere in renderer-land (a content
 * lib union / renderer branch / panel entry). A registry-only id silently
 * renders an EMPTY slide: getLayoutCategory maps its prefix to a family, the
 * family's extended dispatcher finds no branch, and returns null. This is the
 * bug that shipped blank quote and circle slides ("quote-style-1/2",
 * "circle-style-1..3", "steps-style-1..3", "number-style-1..3").
 *
 * Guard: scan all non-registry source files and require each registry style id
 * to appear (as an exact quoted string) somewhere outside the smart-layout
 * registry and its tests.
 */

function collectSourceCorpus(): string {
  // __dirname = src/lib/presentation/smart-layout/__tests__ → four up = src
  const srcRoot = path.resolve(__dirname, "../../../..");
  const chunks: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        // The registry itself and smart-layout tests don't count as "renderable".
        if (p.includes(path.join("presentation", "smart-layout"))) continue;
        walk(p);
      } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes(".test.")) {
        chunks.push(fs.readFileSync(p, "utf8"));
      }
    }
  };
  walk(srcRoot);
  return chunks.join("\n");
}

describe("registry style ids are renderable", () => {
  const corpus = collectSourceCorpus();

  it("every registry style id exists outside the smart-layout registry", () => {
    const missing: string[] = [];
    for (const layout of LAYOUT_DEFINITIONS) {
      for (const style of layout.styles) {
        // Exact quoted-string match so "circle-style-1" can't piggyback on
        // "circle-style-10".
        if (!corpus.includes(`"${style.id}"`)) {
          missing.push(`${layout.category}/${style.id}`);
        }
      }
    }
    expect(missing, `registry-only (unrenderable) style ids: ${missing.join(", ")}`).toEqual([]);
  });
});
