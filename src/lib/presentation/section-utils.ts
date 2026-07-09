/**
 * Canonical slide-section utilities.
 *
 * Slide components render items as {label, text} pairs. The accurate source
 * for that pair is structured `sections: [{heading, description}]` produced at
 * GENERATION time — never render-time string splitting. These helpers exist
 * for the fallback paths where only flat bullet strings are available (legacy
 * decks, model misbehavior, no-API fallbacks): one splitter, mirroring the
 * renderer's precedence (em dash, en dash, spaced hyphen, then colon), applied
 * once server-side so every slide ships with real sections.
 */

export interface SlideSection {
  heading: string;
  description: string;
}

/** Split one flat bullet into a heading/description pair. */
export function bulletToSection(bullet: string): SlideSection {
  const b = (bullet ?? "").trim();

  // "Title — Description" (em dash), "Title – Description" (en dash),
  // "Title - Description" (spaced hyphen — never splits hyphenated words).
  for (const sep of [" — ", " – ", " - "]) {
    const i = b.indexOf(sep);
    if (i > 0) {
      const heading = b.slice(0, i).trim();
      const description = b.slice(i + sep.length).trim();
      if (heading && description && heading.length <= 60) {
        return { heading, description };
      }
    }
  }

  // "Title: Description" (colon close enough to the start to be a heading).
  const ci = b.indexOf(":");
  if (ci > 0 && ci < 50) {
    const heading = b.slice(0, ci).trim();
    const description = b.slice(ci + 1).trim();
    if (heading && description) return { heading, description };
  }

  // No clear heading — the whole bullet is the text; never fabricate a label.
  return { heading: "", description: b };
}

/** Split flat bullets into sections, dropping empty entries. */
export function bulletsToSections(bullets: string[] | undefined | null): SlideSection[] {
  return (bullets ?? [])
    .filter((b) => typeof b === "string" && b.trim().length > 0)
    .map(bulletToSection);
}

/**
 * Derive the legacy flat-bullet view from sections (for analyzers and any
 * consumer still reading bulletPoints). Uses the em-dash convention the
 * renderer's legacy parser understands.
 */
export function sectionsToBullets(sections: SlideSection[] | undefined | null): string[] {
  return (sections ?? [])
    .filter((s) => s && (s.heading || s.description))
    .map((s) => (s.heading ? `${s.heading} — ${s.description}` : s.description));
}

/**
 * Coerce whatever the model returned in a `sections` field into clean
 * SlideSection objects: trims strings, splits string entries, drops empties.
 */
export function normalizeSections(raw: unknown): SlideSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): SlideSection | null => {
      if (typeof item === "string") return bulletToSection(item);
      if (item && typeof item === "object") {
        const o = item as { heading?: unknown; description?: unknown; title?: unknown; text?: unknown };
        const heading = String(o.heading ?? o.title ?? "").trim();
        const description = String(o.description ?? o.text ?? "").trim();
        if (!heading && !description) return null;
        // A section with a heading but no body reads better as body text.
        if (heading && !description) return { heading: "", description: heading };
        return { heading, description };
      }
      return null;
    })
    .filter((s): s is SlideSection => s !== null);
}
