import { env } from "~/env";

/**
 * Centralized AI model selection.
 *
 * Generation is tiered: the outline + visual-strategy step defines the whole
 * deck's quality, so it runs on a stronger (more creative) model, while the
 * mechanical content-expansion step runs on a cheaper, faster model. Both are
 * configurable via env vars (GEMINI_OUTLINE_MODEL / GEMINI_CONTENT_MODEL) so
 * cost and latency can be tuned without code changes.
 */
export const AI_MODELS = {
  /** Creative/structural step: outline, titles, semanticIntent, visualStrategy, art direction. */
  outline: env.GEMINI_OUTLINE_MODEL,
  /** Mechanical step: expand outline bullets into slide text + speaker notes. */
  content: env.GEMINI_CONTENT_MODEL,
} as const;
