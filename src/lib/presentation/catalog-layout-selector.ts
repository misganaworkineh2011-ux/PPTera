/**
 * Catalog Layout Selector
 *
 * Hands the full family-level layout catalog to an LLM and lets it (1) choose
 * the single most suitable content-layout family + style for a slide's text and
 * (2) reshape that text into the item format the chosen family expects
 * (e.g. "Column: Card" for kanban, header+rows for a feature matrix).
 *
 * OpenAI (gpt-4o-mini) is primary with a Gemini (2.5-flash-lite) fallback,
 * matching the existing llm-layout-suggester client pattern. Every failure mode
 * returns null so the caller can keep its deterministic layout selection.
 */

import { env } from "~/env.js";
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import { isLayoutCategoryCompatibleWithImage } from "./layout-image-rules";
import {
  getLayoutCatalogJson,
  familyById,
  isValidFamily,
  isKnownStyle,
  defaultStyleFor,
} from "~/lib/layouts/layout-catalog";

export interface CatalogSlideInput {
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  sections?: Array<{ heading?: string; description?: string }>;
  semanticIntent?: string;
  visualStrategy?: string | { primary?: string; pattern?: string; emphasis?: string };
  contentLayoutHint?: string;
}

function formatVisualStrategy(vs: CatalogSlideInput["visualStrategy"]): string {
  if (!vs) return "";
  if (typeof vs === "string") return vs;
  return [vs.primary, vs.pattern, vs.emphasis].filter(Boolean).join(" / ");
}

export interface CatalogLayoutChoice {
  /** Chosen family — a valid ContentLayoutCategory. */
  category: ContentLayoutCategory;
  /** Specific style id within the family (already validated / defaulted). */
  style: string;
  /** Reshaped items following the family's item format, if the model produced usable ones. */
  items?: Array<{ label: string; text: string }>;
  reasoning?: string;
}

const REQUEST_TIMEOUT_MS = 9000;

/**
 * Families whose renderers parse structure out of label/text (columns, depth,
 * price lines, header+rows). Choosing one without reshaped items would feed it
 * generic sections and render wrong — so we require the reshaped items.
 */
const CONVENTION_FAMILIES = new Set(["pricing", "featurematrix", "kanban", "orgchart"]);

/** OpenAI primary. */
async function callOpenAI(system: string, user: string): Promise<string> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[catalog-layout-selector] OpenAI error ${response.status}`, body);
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

/** Gemini fallback. */
async function callGemini(system: string, user: string): Promise<string> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[catalog-layout-selector] Gemini error ${response.status}`, body);
    throw new Error(`Gemini API error: ${response.status}`);
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callLLM(system: string, user: string): Promise<string> {
  if (env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(system, user);
    } catch (error) {
      console.warn("[catalog-layout-selector] OpenAI failed, trying Gemini:", error);
    }
  }
  if (env.GEMINI_API_KEY) {
    return await callGemini(system, user);
  }
  throw new Error("No API keys configured (OPENAI_API_KEY or GEMINI_API_KEY)");
}

function parseJson(text: string): unknown {
  let clean = text.trim();
  if (clean.startsWith("```json")) clean = clean.slice(7);
  if (clean.startsWith("```")) clean = clean.slice(3);
  if (clean.endsWith("```")) clean = clean.slice(0, -3);
  return JSON.parse(clean.trim());
}

function buildSystemPrompt(hasImage: boolean): string {
  return `You are an expert presentation layout designer. You are given a CATALOG of content-layout families and one slide's content. Do two things:

1. CHOOSE the single family from the catalog that best fits the slide's meaning and item count. Respect each family's "bestFor" and item range. Special rules:
   - "quotes" ONLY for real quotes/testimonials.
   - "images" ONLY when the slide is about images/photos.
   - "matrix" needs exactly 4 items; "spotlight"/"callout" for 1–3 big statements.
   - "dashboard"/"table" for metrics and structured data.
   - Prefer varied, specific families (pricing, kanban, orgchart, featurematrix, timeline, pyramid, hubspoke, comparison, proscons, beforeafter, etc.) when the content matches — do NOT default everything to boxes/bullets.
${hasImage ? "   - This slide WILL show an image, so the catalog only contains image-compatible families. Pick one of them." : ""}

2. RESHAPE the slide's text into items that follow the chosen family's "itemFormat" EXACTLY. Each item is { "label": string, "text": string }. Keep the wording faithful to the source; do not invent facts. Honor the family's item count range.

Return ONLY valid JSON:
{
  "familyId": "<one family id from the catalog>",
  "styleId": "<one style id from that family's styles, or its defaultStyle>",
  "items": [ { "label": "...", "text": "..." } ],
  "reasoning": "one short sentence"
}`;
}

function buildUserPrompt(slide: CatalogSlideInput, hasImage: boolean): string {
  const source =
    slide.sections && slide.sections.length > 0
      ? slide.sections
          .map((s, i) => `${i + 1}. ${s.heading ?? ""}${s.description ? ` — ${s.description}` : ""}`)
          .join("\n")
      : (slide.bulletPoints ?? []).map((b, i) => `${i + 1}. ${b}`).join("\n");

  return `CATALOG (families):
${getLayoutCatalogJson({ hasImage })}

SLIDE
Title: ${slide.title}
${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
${slide.semanticIntent ? `Intent: ${slide.semanticIntent}` : ""}
${formatVisualStrategy(slide.visualStrategy) ? `Visual strategy: ${formatVisualStrategy(slide.visualStrategy)}` : ""}
${slide.contentLayoutHint ? `Layout hint: ${slide.contentLayoutHint}` : ""}
Will show image: ${hasImage}

SLIDE CONTENT (${slide.sections?.length ?? slide.bulletPoints?.length ?? 0} items):
${source || "(no items)"}

Choose the best family and reshape the content into items for it.`;
}

/**
 * Ask the LLM to pick a layout family + style from the catalog and reshape the
 * slide's items to fit it. Returns null on any failure (no keys, timeout, bad
 * JSON, invalid/incompatible family) so the caller falls back to its own choice.
 */
export async function selectLayoutFromCatalog(
  slide: CatalogSlideInput,
  opts: { hasImage?: boolean } = {}
): Promise<CatalogLayoutChoice | null> {
  if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) return null;

  // Need at least some content to reshape.
  const itemCount = slide.sections?.length ?? slide.bulletPoints?.length ?? 0;
  if (itemCount === 0) return null;

  const hasImage = !!opts.hasImage;

  let raw: unknown;
  try {
    const text = await callLLM(buildSystemPrompt(hasImage), buildUserPrompt(slide, hasImage));
    raw = parseJson(text);
  } catch (error) {
    console.warn("[catalog-layout-selector] LLM/parse failed:", error);
    return null;
  }

  const obj = raw as { familyId?: unknown; styleId?: unknown; items?: unknown; reasoning?: unknown };
  const familyId = typeof obj.familyId === "string" ? obj.familyId.trim() : "";

  if (!isValidFamily(familyId)) {
    console.warn(`[catalog-layout-selector] Invalid familyId "${familyId}"`);
    return null;
  }
  const family = familyById(familyId)!;

  // Image compatibility is the hard authority — never place an incompatible
  // family beside an image.
  if (hasImage && !isLayoutCategoryCompatibleWithImage(familyId as ContentLayoutCategory, true)) {
    console.warn(`[catalog-layout-selector] "${familyId}" incompatible with image; skipping`);
    return null;
  }

  // Style: trust the model only if the style is a known catalog style; else default.
  const styleId = typeof obj.styleId === "string" ? obj.styleId.trim() : "";
  const style = isKnownStyle(familyId, styleId) ? styleId : defaultStyleFor(familyId);

  // Reshaped items: sanitize, drop empties, clamp to the family's capacity.
  const rawItems = Array.isArray(obj.items) ? obj.items : [];
  const items = rawItems
    .map((it) => {
      const o = it as { label?: unknown; text?: unknown };
      return {
        label: typeof o.label === "string" ? o.label.trim() : "",
        text: typeof o.text === "string" ? o.text.trim() : "",
      };
    })
    .filter((it) => it.label || it.text)
    .slice(0, family.maxItems);

  // Only surface items when the model returned a usable set for this family.
  const minUsable = Math.min(2, family.minItems);
  const hasUsableItems = items.length >= minUsable;

  // Convention families are meaningless without their reshaped item format —
  // reject so the caller keeps its deterministic (well-shaped) selection.
  if (CONVENTION_FAMILIES.has(familyId) && !hasUsableItems) {
    console.warn(`[catalog-layout-selector] "${familyId}" chosen without usable items; skipping`);
    return null;
  }

  const choice: CatalogLayoutChoice = {
    category: familyId as ContentLayoutCategory,
    style,
    reasoning: typeof obj.reasoning === "string" ? obj.reasoning : undefined,
  };
  if (hasUsableItems) {
    choice.items = items;
  }
  return choice;
}
