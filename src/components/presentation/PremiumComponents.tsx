"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "~/lib/themes";

/**
 * Reusable premium slide components — original implementations of the recurring
 * design patterns seen across professional decks (eyebrow/tag pills, two-tone
 * headings, numbered top-rule grids, accent callout banners, connector-dot
 * lists, profile cards). All are theme-aware: pass the active `Theme` and they
 * pull accent/heading/text/surface/border colors from it.
 */

export function tc(theme: Theme) {
  const c = theme.colors;
  return {
    accent: c.accent || c.primary || "#6366f1",
    heading: c.heading || c.text || "#0f172a",
    text: c.text || "#334155",
    muted: c.textMuted || "#64748b",
    surface: c.surface || "#ffffff",
    border: c.border || "rgba(0,0,0,0.1)",
  };
}

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);
/** Append a 2-hex-digit alpha to a #rrggbb color (no-op for non-hex like rgba()). */
export const alpha = (hex: string, a: string) => (isHex(hex) ? `${hex}${a}` : hex);

/* ------------------------------- Eyebrow ---------------------------------- */

export function Eyebrow({
  children,
  theme,
  variant = "filled",
  icon,
  className = "",
}: {
  children: ReactNode;
  theme: Theme;
  variant?: "filled" | "outline";
  icon?: ReactNode;
  className?: string;
}) {
  const c = tc(theme);
  const style: CSSProperties =
    variant === "filled"
      ? { backgroundColor: alpha(c.accent, "1f"), color: c.accent }
      : { border: `1px solid ${alpha(c.accent, "80")}`, color: c.accent };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] leading-none ${className}`}
      style={style}
    >
      {icon}
      {children}
    </span>
  );
}

/* -------------------------------- TagPills -------------------------------- */

export function TagPills({ tags, theme }: { tags: string[]; theme: Theme }) {
  const c = tc(theme);
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="rounded-full px-4 py-1.5 text-sm font-semibold"
          style={
            i === 0
              ? { backgroundColor: c.accent, color: "#ffffff" }
              : { border: `1px solid ${alpha(c.accent, "66")}`, color: c.accent }
          }
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------- TwoToneHeading ----------------------------- */

/**
 * Heading where the trailing words are painted in the accent color — a subtle,
 * editorial touch (e.g. "Lorem Ipsum **Dolor Sit**").
 */
export function TwoToneHeading({
  text,
  theme,
  accentFromWord,
  className = "",
  style,
}: {
  text: string;
  theme: Theme;
  accentFromWord?: number; // word index where accent coloring begins (default: last 2 words)
  className?: string;
  style?: CSSProperties;
}) {
  const c = tc(theme);
  const words = text.split(" ");
  const from = accentFromWord ?? Math.max(1, words.length - 2);
  const head = words.slice(0, from).join(" ");
  const tail = words.slice(from).join(" ");
  return (
    <h2 className={`font-bold leading-[1.1] tracking-tight ${className}`} style={style}>
      <span style={{ color: c.heading }}>{head}</span>
      {tail && <span style={{ color: c.accent }}> {tail}</span>}
    </h2>
  );
}

/* --------------------------- NumberedRuleGrid ----------------------------- */

export interface RichItem {
  label?: ReactNode;
  text: ReactNode;
}

/**
 * Numbered items, each with a colored top-rule under the index — a clean,
 * editorial "steps / features" grid.
 */
export function NumberedRuleGrid({
  items,
  theme,
  columns,
}: {
  items: RichItem[];
  theme: Theme;
  columns?: number;
}) {
  const c = tc(theme);
  const cols = columns ?? Math.min(3, items.length);
  return (
    <div className="grid gap-x-10 gap-y-8" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((it, i) => (
        <div key={i}>
          <div className="text-sm font-semibold tabular-nums" style={{ color: c.muted }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="mt-1.5 mb-3 h-[2px] w-full rounded-full" style={{ backgroundColor: c.accent }} />
          {it.label && (
            <h3 className="text-lg font-bold tracking-tight" style={{ color: c.heading }}>
              {it.label}
            </h3>
          )}
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: c.text }}>
            {it.text}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- AccentCallout ------------------------------ */

/**
 * Full-width solid accent banner with an optional bold lead-in — great for a
 * "Key takeaway" / "Key questions" line at the bottom of a slide.
 */
export function AccentCallout({
  label,
  text,
  theme,
  icon,
  variant = "solid",
  className = "",
}: {
  label?: string;
  text: string;
  theme: Theme;
  icon?: ReactNode;
  variant?: "solid" | "soft";
  className?: string;
}) {
  const c = tc(theme);
  const soft = variant === "soft";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-5 py-4 ${className}`}
      style={
        soft
          ? { backgroundColor: alpha(c.accent, "1f"), color: c.text }
          : { backgroundColor: c.accent, color: "#ffffff" }
      }
    >
      {icon && (
        <span className="shrink-0" style={{ color: soft ? c.accent : "#ffffff", opacity: 0.9 }}>
          {icon}
        </span>
      )}
      <p className="text-sm leading-snug sm:text-base">
        {label && (
          <span className="font-bold" style={{ color: soft ? c.heading : "#ffffff" }}>
            {label}{" "}
          </span>
        )}
        <span style={{ opacity: soft ? 1 : 0.95 }}>{text}</span>
      </p>
    </div>
  );
}

/* ------------------------- VerticalConnectorList -------------------------- */

/**
 * A vertical line with accent dots connecting a stack of cards — a premium
 * "overview / vertical timeline" component.
 */
export function VerticalConnectorList({
  items,
  theme,
}: {
  items: RichItem[];
  theme: Theme;
}) {
  const c = tc(theme);
  return (
    <div className="relative pl-8">
      <div className="absolute bottom-3 left-[7px] top-3 w-px" style={{ backgroundColor: alpha(c.accent, "59") }} />
      <div className="flex flex-col gap-4">
        {items.map((it, i) => (
          <div key={i} className="relative">
            <span
              className="absolute -left-[27px] top-5 h-3 w-3 rounded-full ring-4"
              style={{ backgroundColor: c.accent, color: alpha(c.surface, "ff") }}
            />
            <div
              className="ppt-tile rounded-xl p-5"
              style={{ backgroundColor: alpha(c.surface, "cc"), border: `1px solid ${c.border}` }}
            >
              {it.label && (
                <h3 className="text-lg font-bold tracking-tight" style={{ color: c.heading }}>
                  {it.label}
                </h3>
              )}
              <p className="mt-1 text-sm leading-relaxed" style={{ color: c.text }}>
                {it.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- ProfileCard ----------------------------- */

/**
 * Person/profile card: name with an underline accent, a description, and an
 * optional bullet list of highlights.
 */
export function ProfileCard({
  name,
  role,
  description,
  highlights,
  theme,
}: {
  name: string;
  role?: string;
  description?: string;
  highlights?: string[];
  theme: Theme;
}) {
  const c = tc(theme);
  return (
    <div className="ppt-tile flex h-full flex-col rounded-xl p-5" style={{ backgroundColor: alpha(c.surface, "cc"), border: `1px solid ${c.border}` }}>
      <div className="pb-2" style={{ borderBottom: `2px solid ${alpha(c.accent, "80")}` }}>
        <h3 className="text-lg font-bold tracking-tight" style={{ color: c.heading }}>
          {name}
        </h3>
        {role && (
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.accent }}>
            {role}
          </p>
        )}
      </div>
      {description && (
        <p className="mt-3 text-sm leading-relaxed" style={{ color: c.text }}>
          {description}
        </p>
      )}
      {highlights && highlights.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: c.text }}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.accent }} />
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------ BigStatColumns ---------------------------- */

export interface StatItem {
  value: string;
  label: string;
  text?: string;
}

/** Big headline metric + label + description, in columns. */
export function BigStatColumns({
  items,
  theme,
  columns,
}: {
  items: StatItem[];
  theme: Theme;
  columns?: number;
}) {
  const c = tc(theme);
  const cols = columns ?? Math.min(4, items.length);
  return (
    <div className="grid gap-x-8 gap-y-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((it, i) => (
        <div key={i}>
          <div
            className="font-extrabold leading-none tracking-tight tabular-nums"
            style={{ color: c.accent, fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            {it.value}
          </div>
          <div className="mt-2 text-base font-bold tracking-tight" style={{ color: c.heading }}>
            {it.label}
          </div>
          {it.text && (
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: c.text }}>
              {it.text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ IconFeatureList --------------------------- */

export interface IconItem {
  icon?: ReactNode;
  label: string;
  text: string;
}

/**
 * Icon + bold heading + description. Vertical rows by default; pass `columns`
 * for a horizontal icon-grid (icon stacked above the heading).
 */
export function IconFeatureList({
  items,
  theme,
  columns,
}: {
  items: IconItem[];
  theme: Theme;
  columns?: number;
}) {
  const c = tc(theme);
  const grid = !!columns && columns > 1;
  return (
    <div
      className={grid ? "grid gap-x-8 gap-y-6" : "flex flex-col gap-5"}
      style={grid ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
    >
      {items.map((it, i) =>
        grid ? (
          <div key={i}>
            {it.icon && (
              <span className="mb-2 flex h-7 w-7 items-center justify-center" style={{ color: c.accent }}>
                {it.icon}
              </span>
            )}
            <h3 className="text-base font-bold tracking-tight" style={{ color: c.heading }}>
              {it.label}
            </h3>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: c.text }}>
              {it.text}
            </p>
          </div>
        ) : (
          <div key={i} className="flex items-start gap-4">
            {it.icon && (
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center" style={{ color: c.accent }}>
                {it.icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold tracking-tight" style={{ color: c.heading }}>
                {it.label}
              </h3>
              <p className="mt-0.5 text-sm leading-relaxed" style={{ color: c.text }}>
                {it.text}
              </p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

/** A gradient accent rule with a summary caption beneath — the "takeaway" line. */
export function DividerCaption({ children, theme }: { children: ReactNode; theme: Theme }) {
  const c = tc(theme);
  return (
    <div>
      <div
        className="mb-3 h-[2px] w-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }}
      />
      <p className="text-sm leading-relaxed" style={{ color: c.muted }}>
        {children}
      </p>
    </div>
  );
}

/* ------------------------------- TakeawayChips ---------------------------- */

/** A row of soft accent-tinted chips, each with a bold lead-in. */
export function TakeawayChips({ items, theme }: { items: RichItem[]; theme: Theme }) {
  const c = tc(theme);
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(3, items.length)}, minmax(0, 1fr))` }}>
      {items.map((it, i) => (
        <div
          key={i}
          className="rounded-xl px-4 py-3 text-sm leading-snug"
          style={{ backgroundColor: alpha(c.accent, "1a"), color: c.text }}
        >
          {it.label && (
            <span className="font-bold" style={{ color: c.heading }}>
              {it.label} —{" "}
            </span>
          )}
          {it.text}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- ContrastCard ----------------------------- */

/**
 * A bold high-contrast feature card (inverts the theme — dark card on a light
 * theme, light card on a dark theme), with an optional divider + footnote.
 */
export function ContrastCard({
  label,
  text,
  footnote,
  theme,
}: {
  label: string;
  text: string;
  footnote?: string;
  theme: Theme;
}) {
  const c = tc(theme);
  return (
    <div className="ppt-tile flex h-full flex-col rounded-2xl p-7" style={{ backgroundColor: c.heading }}>
      <h3 className="text-xl font-bold tracking-tight" style={{ color: c.surface }}>
        {label}
      </h3>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: alpha(c.surface, "cc") }}>
        {text}
      </p>
      {footnote && (
        <>
          <div className="my-4 h-px w-full" style={{ backgroundColor: alpha(c.surface, "33") }} />
          <p className="text-base font-semibold" style={{ color: c.surface }}>
            {footnote}
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------- ImageGallery ----------------------------- */

/** Masonry-style image gallery (top row 3, bottom row 2 wider). */
export function ImageGallery({ images, theme }: { images: string[]; theme: Theme }) {
  const c = tc(theme);
  const imgs = images.slice(0, 5);
  return (
    <div className="grid grid-cols-6 gap-3">
      {imgs.map((src, i) => {
        const span = imgs.length <= 3 ? 2 : i < 3 ? 2 : 3;
        return (
          <div
            key={i}
            className="overflow-hidden rounded-xl"
            style={{ gridColumn: `span ${span}`, aspectRatio: "16 / 10", border: `1px solid ${c.border}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- NumberedBadgeList -------------------------- */

/** Vertical list with square accent number badges + title + description. */
export function NumberedBadgeList({ items, theme }: { items: RichItem[]; theme: Theme }) {
  const c = tc(theme);
  return (
    <div className="flex flex-col gap-4">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-4">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums text-white"
            style={{ backgroundColor: c.accent }}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            {it.label && (
              <h3 className="text-base font-bold tracking-tight" style={{ color: c.heading }}>
                {it.label}
              </h3>
            )}
            <p className="mt-0.5 text-sm leading-relaxed" style={{ color: c.text }}>
              {it.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- SplitHeaderCards --------------------------- */

/**
 * Cards with a filled header band (number + label) above a quiet body — the
 * "challenge / success / category" card anatomy seen across report decks.
 * One card (highlightIndex) gets a solid accent band; the rest a soft tint.
 * Pass highlightIndex={-1} for all-tint.
 */
export function SplitHeaderCards({
  items,
  theme,
  columns,
  highlightIndex = 0,
}: {
  items: RichItem[];
  theme: Theme;
  columns?: number;
  highlightIndex?: number;
}) {
  const c = tc(theme);
  const cols = columns ?? Math.min(2, items.length);
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((it, i) => {
        const hot = i === highlightIndex;
        return (
          <div key={i} className="overflow-hidden rounded-xl" style={{ border: `1px solid ${c.border}` }}>
            <div
              className="flex items-center gap-2.5 px-4 py-2.5"
              style={{
                background: hot
                  ? `linear-gradient(135deg, ${c.accent}, ${alpha(c.accent, "cc")})`
                  : alpha(c.accent, "1a"),
              }}
            >
              <span
                className="text-sm font-extrabold tabular-nums"
                style={{ color: hot ? "#ffffff" : c.accent, letterSpacing: "-0.02em" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {it.label && (
                <span
                  className="min-w-0 flex-1 truncate text-sm font-bold tracking-tight"
                  style={{ color: hot ? "#ffffff" : c.heading }}
                >
                  {it.label}
                </span>
              )}
            </div>
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                {it.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- ConcentricRings ---------------------------- */

/**
 * A center concept inside layered outline rings with callouts at the four
 * cardinal points — "priority radiates outward". Laid out on a 3x3 grid so
 * nothing overflows the slide canvas.
 */
export function ConcentricRings({
  center,
  items,
  theme,
  ringSize = 210,
}: {
  center: ReactNode;
  items: RichItem[];
  theme: Theme;
  ringSize?: number;
}) {
  const c = tc(theme);
  const [top, right, bottom, left] = [items[0], items[1], items[2], items[3]];

  const callout = (it: RichItem | undefined, align: "center" | "left" | "right") =>
    it ? (
      <div
        className={`max-w-[190px] ${
          align === "center" ? "mx-auto text-center" : align === "right" ? "ml-auto text-right" : "text-left"
        }`}
      >
        {it.label && (
          <div className="text-sm font-bold tracking-tight" style={{ color: c.heading }}>
            {it.label}
          </div>
        )}
        <div className="mt-0.5 text-xs leading-snug" style={{ color: c.muted }}>
          {it.text}
        </div>
      </div>
    ) : (
      <div />
    );

  const ringAlphas = ["2e", "4d", "73"];
  return (
    <div className="grid items-center gap-x-6 gap-y-4" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
      <div />
      {callout(top, "center")}
      <div />
      {callout(left, "right")}
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        {ringAlphas.map((a, ri) => {
          const inset = (ri * 11) + "%";
          return (
            <div
              key={ri}
              className="absolute rounded-full"
              style={{ inset, border: `1.5px solid ${alpha(c.accent, a)}` }}
            />
          );
        })}
        <div
          className="absolute flex items-center justify-center rounded-full text-center"
          style={{
            inset: "33%",
            background: `linear-gradient(135deg, ${c.accent}, ${alpha(c.accent, "cc")})`,
            boxShadow: `0 6px 18px ${alpha(c.accent, "40")}`,
          }}
        >
          <span className="px-2 text-xs font-bold leading-tight text-white">{center}</span>
        </div>
      </div>
      {callout(right, "left")}
      <div />
      {callout(bottom, "center")}
      <div />
    </div>
  );
}

/* ----------------------------- DotMatrixGauge ----------------------------- */

export interface GaugeItem {
  value: number; // 0–100
  label: string;
  caption?: string;
}

/**
 * Percentages rendered as filled-vs-outline dot grids with a big numeral
 * beneath — dense, scannable data without a chart library.
 */
export function DotMatrixGauge({
  items,
  theme,
  dotsPerRow = 10,
  rows = 5,
}: {
  items: GaugeItem[];
  theme: Theme;
  dotsPerRow?: number;
  rows?: number;
}) {
  const c = tc(theme);
  const total = dotsPerRow * rows;
  return (
    <div
      className="grid gap-x-10 gap-y-6"
      style={{ gridTemplateColumns: `repeat(${Math.min(3, items.length)}, minmax(0, 1fr))` }}
    >
      {items.map((g, i) => {
        const clamped = Math.max(0, Math.min(100, g.value));
        const filled = Math.round((clamped / 100) * total);
        return (
          <div key={i}>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${dotsPerRow}, minmax(0, 1fr))` }}>
              {Array.from({ length: total }, (_, d) => (
                <span
                  key={d}
                  className="aspect-square rounded-full"
                  style={
                    d < filled
                      ? { backgroundColor: c.accent }
                      : { border: `1.5px solid ${alpha(c.accent, "40")}` }
                  }
                />
              ))}
            </div>
            <div
              className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight"
              style={{ color: c.heading }}
            >
              {Math.round(clamped)}%
            </div>
            <div className="mt-0.5 text-sm font-bold" style={{ color: c.heading }}>
              {g.label}
            </div>
            {g.caption && (
              <p className="mt-0.5 text-xs leading-snug" style={{ color: c.muted }}>
                {g.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- MetricPills ------------------------------ */

/** Big numerals inside soft accent pills with a caption beneath — scannable KPIs. */
export function MetricPills({
  items,
  theme,
  columns,
}: {
  items: StatItem[];
  theme: Theme;
  columns?: number;
}) {
  const c = tc(theme);
  const cols = columns ?? Math.min(3, items.length);
  return (
    <div className="grid gap-x-6 gap-y-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((it, i) => (
        <div key={i} className="text-center">
          <div
            className="flex items-center justify-center rounded-full px-6 py-2.5 text-2xl font-extrabold tabular-nums tracking-tight"
            style={{
              background: `linear-gradient(135deg, ${alpha(c.accent, "26")}, ${alpha(c.accent, "0d")})`,
              border: `1px solid ${alpha(c.accent, "3d")}`,
              color: c.accent,
              boxShadow: `0 4px 14px ${alpha(c.accent, "1a")}`,
            }}
          >
            {it.value}
          </div>
          <div className="mt-2 text-sm font-bold tracking-tight" style={{ color: c.heading }}>
            {it.label}
          </div>
          {it.text && (
            <p className="mt-0.5 text-xs leading-snug" style={{ color: c.muted }}>
              {it.text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- PhotoCards ------------------------------- */

export interface PhotoCardItem {
  image: string;
  label: ReactNode;
  text?: ReactNode;
}

/** Editorial image-top cards: photo, short accent rule, bold title, caption. */
export function PhotoCards({
  items,
  theme,
  columns,
}: {
  items: PhotoCardItem[];
  theme: Theme;
  columns?: number;
}) {
  const c = tc(theme);
  const cols = columns ?? Math.min(4, items.length);
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((it, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl"
          style={{ border: `1px solid ${c.border}`, backgroundColor: c.surface }}
        >
          <div style={{ aspectRatio: "4 / 3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.image} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="px-4 py-3">
            <div className="h-[2px] w-8 rounded-full" style={{ backgroundColor: c.accent }} />
            <h3 className="mt-2 text-sm font-bold tracking-tight" style={{ color: c.heading }}>
              {it.label}
            </h3>
            {it.text && (
              <p className="mt-1 text-xs leading-snug" style={{ color: c.muted }}>
                {it.text}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- IconRuleColumns ---------------------------- */

/**
 * Centered columns: icon chip → short accent rule → title → body. The
 * icon/rule/title cadence reads as a deliberate system. `outlined` wraps each
 * column in a hairline card.
 */
export function IconRuleColumns({
  items,
  theme,
  columns,
  outlined = false,
}: {
  items: IconItem[];
  theme: Theme;
  columns?: number;
  outlined?: boolean;
}) {
  const c = tc(theme);
  const cols = columns ?? Math.min(4, items.length);
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((it, i) => (
        <div
          key={i}
          className={`flex flex-col items-center text-center ${outlined ? "rounded-xl px-4 py-5" : ""}`}
          style={outlined ? { border: `1px solid ${c.border}` } : undefined}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full text-lg"
            style={{
              background: `linear-gradient(135deg, ${alpha(c.accent, "26")}, ${alpha(c.accent, "0d")})`,
              border: `1px solid ${alpha(c.accent, "3d")}`,
              color: c.accent,
            }}
          >
            {it.icon ?? (
              <span className="text-sm font-extrabold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            )}
          </span>
          <span className="mt-2.5 h-[2px] w-8 rounded-full" style={{ backgroundColor: c.accent }} />
          <h3 className="mt-2.5 text-sm font-bold tracking-tight" style={{ color: c.heading }}>
            {it.label}
          </h3>
          <p className="mt-1 text-xs leading-snug" style={{ color: c.muted }}>
            {it.text}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ RuledIconList ------------------------------ */

/**
 * Rows where a hairline rule runs from the heading to the right edge — a
 * quiet "ledger" connector that structures a list without boxes.
 */
export function RuledIconList({ items, theme }: { items: IconItem[]; theme: Theme }) {
  const c = tc(theme);
  return (
    <div className="flex flex-col gap-5">
      {items.map((it, i) => (
        <div key={i}>
          <div className="flex items-center gap-3">
            {it.icon && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center" style={{ color: c.accent }}>
                {it.icon}
              </span>
            )}
            <h3 className="shrink-0 text-base font-bold tracking-tight" style={{ color: c.heading }}>
              {it.label}
            </h3>
            <span className="h-px min-w-6 flex-1" style={{ backgroundColor: c.border }} />
          </div>
          <p
            className="mt-1.5 text-sm leading-relaxed"
            style={{ color: c.text, paddingLeft: it.icon ? "2.25rem" : 0 }}
          >
            {it.text}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ DualPanelSplit ----------------------------- */

export interface PanelSpec {
  label: ReactNode;
  bullets: ReactNode[];
}

/**
 * Two rounded tinted panels side by side — the "our side / your side"
 * responsibility split. Left panel gets the accent tint, right stays neutral.
 */
export function DualPanelSplit({
  left,
  right,
  theme,
}: {
  left: PanelSpec;
  right: PanelSpec;
  theme: Theme;
}) {
  const c = tc(theme);
  const panel = (p: PanelSpec, tinted: boolean) => (
    <div
      className="rounded-2xl px-6 py-5"
      style={{
        backgroundColor: tinted ? alpha(c.accent, "14") : c.surface,
        border: `1px solid ${tinted ? alpha(c.accent, "33") : c.border}`,
      }}
    >
      <h3 className="text-base font-bold tracking-tight" style={{ color: c.heading }}>
        {p.label}
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {p.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: c.text }}>
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.accent }} />
            <span className="min-w-0 flex-1">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-5">
      {panel(left, true)}
      {panel(right, false)}
    </div>
  );
}

/* ------------------------------- CascadeBars ------------------------------- */

/**
 * Stacked numbered bars that widen step by step — visual escalation of
 * scope/priority without a chart.
 */
export function CascadeBars({
  items,
  theme,
  minWidth = 62,
}: {
  items: RichItem[];
  theme: Theme;
  minWidth?: number; // percent width of the first bar
}) {
  const c = tc(theme);
  const n = Math.max(items.length, 1);
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => {
        const w = n === 1 ? 100 : minWidth + ((100 - minWidth) / (n - 1)) * i;
        return (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl px-4 py-3"
            style={{
              width: `${w}%`,
              background: `linear-gradient(90deg, ${alpha(c.accent, "24")}, ${alpha(c.accent, "0a")})`,
              border: `1px solid ${alpha(c.accent, "30")}`,
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold tabular-nums text-white"
              style={{
                background: `linear-gradient(135deg, ${c.accent}, ${alpha(c.accent, "cc")})`,
                boxShadow: `0 3px 8px ${alpha(c.accent, "40")}`,
              }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              {it.label && (
                <h3 className="text-sm font-bold tracking-tight" style={{ color: c.heading }}>
                  {it.label}
                </h3>
              )}
              <p className="text-xs leading-snug" style={{ color: c.muted }}>
                {it.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- StatusStages ------------------------------ */

export interface StageItem {
  label: ReactNode;
  status?: string; // e.g. "ON TRACK", "DONE", "AT RISK"
  text?: ReactNode;
}

/**
 * Horizontal stage strip: numbered cards joined by chevrons, each carrying a
 * monospace uppercase status tag — the "pipeline health" row.
 */
export function StatusStages({ items, theme }: { items: StageItem[]; theme: Theme }) {
  const c = tc(theme);
  return (
    <div className="flex items-stretch gap-2.5">
      {items.map((it, i) => (
        <div key={i} className="flex min-w-0 flex-1 items-center gap-2.5">
          <div
            className="min-w-0 flex-1 rounded-xl px-4 py-3"
            style={{ border: `1px solid ${c.border}`, backgroundColor: c.surface }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold tabular-nums" style={{ color: c.accent }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="truncate text-sm font-bold tracking-tight" style={{ color: c.heading }}>
                {it.label}
              </h3>
            </div>
            {it.text && (
              <p className="mt-1 text-xs leading-snug" style={{ color: c.muted }}>
                {it.text}
              </p>
            )}
            {it.status && (
              <span
                className="mt-2 inline-block rounded px-1.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]"
                style={{ backgroundColor: alpha(c.accent, "1f"), color: c.accent }}
              >
                {it.status}
              </span>
            )}
          </div>
          {i < items.length - 1 && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={c.muted}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- SpectrumLine ------------------------------ */

/**
 * A thin gradient line with evenly spaced glow dots; bold label above and
 * description below each point — the minimal "spec/attribute spectrum".
 */
export function SpectrumLine({ items, theme }: { items: RichItem[]; theme: Theme }) {
  const c = tc(theme);
  const n = Math.max(items.length, 1);
  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  return (
    <div>
      <div className="grid" style={cols}>
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-end justify-center px-2 text-center text-sm font-bold tracking-tight"
            style={{ color: c.heading }}
          >
            {it.label}
          </div>
        ))}
      </div>
      <div className="relative mt-2.5">
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{
            left: `${100 / (n * 2)}%`,
            right: `${100 / (n * 2)}%`,
            background: `linear-gradient(90deg, ${alpha(c.accent, "33")}, ${c.accent}, ${alpha(c.accent, "33")})`,
          }}
        />
        <div className="relative grid" style={cols}>
          {items.map((_, i) => (
            <div key={i} className="flex justify-center">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: c.accent, boxShadow: `0 0 0 4px ${alpha(c.accent, "1f")}` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2.5 grid" style={cols}>
        {items.map((it, i) => (
          <p key={i} className="px-2 text-center text-xs leading-snug" style={{ color: c.muted }}>
            {it.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ BigNumberRows ------------------------------ */

/**
 * Editorial full-width rows led by an oversized ghost numeral, separated by
 * hairline rules — the confident "three things to remember" list.
 */
export function BigNumberRows({ items, theme }: { items: RichItem[]; theme: Theme }) {
  const c = tc(theme);
  return (
    <div className="flex flex-col">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-start gap-5 py-4"
          style={{ borderBottom: i === items.length - 1 ? "none" : `1px solid ${c.border}` }}
        >
          <span
            className="w-16 shrink-0 text-right text-4xl font-extrabold leading-none tabular-nums tracking-tight"
            style={{ color: alpha(c.accent, "59") }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            {it.label && (
              <h3 className="text-base font-bold uppercase tracking-[0.06em]" style={{ color: c.heading }}>
                {it.label}
              </h3>
            )}
            <p className="mt-1 text-sm leading-relaxed" style={{ color: c.text }}>
              {it.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- PricingTiers ------------------------------ */

export interface TierItem {
  name: ReactNode;
  price: ReactNode;
  period?: ReactNode; // e.g. "/mo"
  features: ReactNode[];
  note?: ReactNode; // footer strip, e.g. a guarantee line
  highlighted?: boolean;
}

/** Package/pricing tier cards; the highlighted tier gets the accent treatment. */
export function PricingTiers({ items, theme }: { items: TierItem[]; theme: Theme }) {
  const c = tc(theme);
  const cols = Math.min(3, items.length);
  return (
    <div className="grid items-stretch gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((t, i) => {
        const hot = !!t.highlighted;
        return (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl"
            style={{
              border: hot ? `1.5px solid ${alpha(c.accent, "66")}` : `1px solid ${c.border}`,
              backgroundColor: hot ? alpha(c.accent, "0d") : c.surface,
              boxShadow: hot ? `0 8px 24px ${alpha(c.accent, "26")}` : undefined,
            }}
          >
            <div className="px-5 pt-4">
              <div
                className="text-xs font-bold uppercase tracking-[0.12em]"
                style={{ color: hot ? c.accent : c.muted }}
              >
                {t.name}
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: c.heading }}>
                  {t.price}
                </span>
                {t.period && (
                  <span className="text-xs font-semibold" style={{ color: c.muted }}>
                    {t.period}
                  </span>
                )}
              </div>
              <div className="mt-3 h-px w-full" style={{ backgroundColor: c.border }} />
              <ul className="mt-3 flex flex-col gap-1.5 pb-4">
                {t.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: c.text }}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={c.accent}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="min-w-0 flex-1">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            {t.note && (
              <div
                className="mt-auto px-5 py-2.5 text-[0.65rem] font-semibold"
                style={{ backgroundColor: alpha(c.accent, hot ? "26" : "14"), color: hot ? c.accent : c.text }}
              >
                {t.note}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------- LabeledSectionsCards -------------------------- */

export interface SectionedItem {
  tag?: ReactNode; // small category pill, e.g. "CASE STUDY"
  label?: ReactNode; // card title
  sections: { label: ReactNode; text: ReactNode }[];
}

/**
 * Cards whose body is a sequence of small-caps-labeled sections — the
 * Challenge / Solution / Outcome (or Description / Impact / Evidence) anatomy.
 */
export function LabeledSectionsCards({
  items,
  theme,
  columns,
}: {
  items: SectionedItem[];
  theme: Theme;
  columns?: number;
}) {
  const c = tc(theme);
  const cols = columns ?? Math.min(3, items.length);
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((it, i) => (
        <div
          key={i}
          className="rounded-xl px-5 py-4"
          style={{
            backgroundColor: c.surface,
            border: `1px solid ${c.border}`,
            borderTop: `3px solid ${c.accent}`,
          }}
        >
          {it.tag && (
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em]"
              style={{ backgroundColor: alpha(c.accent, "1f"), color: c.accent }}
            >
              {it.tag}
            </span>
          )}
          {it.label && (
            <h3 className={`text-base font-bold tracking-tight ${it.tag ? "mt-2" : ""}`} style={{ color: c.heading }}>
              {it.label}
            </h3>
          )}
          <div className="mt-2.5 flex flex-col gap-2.5">
            {it.sections.map((s, si) => (
              <div key={si}>
                <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em]" style={{ color: c.accent }}>
                  {s.label}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: c.text }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- ProgressBars ------------------------------ */

/** Labeled completion bars — fill to value %, numeral at the row head. */
export function ProgressBars({ items, theme }: { items: GaugeItem[]; theme: Theme }) {
  const c = tc(theme);
  return (
    <div className="flex flex-col gap-4">
      {items.map((g, i) => {
        const v = Math.max(0, Math.min(100, g.value));
        return (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-bold tracking-tight" style={{ color: c.heading }}>
                {g.label}
              </span>
              <span className="text-sm font-extrabold tabular-nums" style={{ color: c.accent }}>
                {Math.round(v)}%
              </span>
            </div>
            <div
              className="mt-1.5 h-2.5 overflow-hidden rounded-full"
              style={{ backgroundColor: alpha(c.accent, "1f"), border: `1px solid ${alpha(c.accent, "26")}` }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${v}%`,
                  background: `linear-gradient(90deg, ${alpha(c.accent, "cc")}, ${c.accent})`,
                  boxShadow: `0 0 8px ${alpha(c.accent, "59")}`,
                }}
              />
            </div>
            {g.caption && (
              <p className="mt-1 text-xs leading-snug" style={{ color: c.muted }}>
                {g.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- ArcGauge -------------------------------- */

/** 270° ring gauges with the numeral in the center — compact single-metric progress. */
export function ArcGauge({ items, theme, size = 120 }: { items: GaugeItem[]; theme: Theme; size?: number }) {
  const c = tc(theme);
  const R = 40;
  const CIRC = 2 * Math.PI * R;
  const SPAN = 0.75; // 270 degrees
  return (
    <div
      className="grid gap-x-8 gap-y-6"
      style={{ gridTemplateColumns: `repeat(${Math.min(4, items.length)}, minmax(0, 1fr))` }}
    >
      {items.map((g, i) => {
        const v = Math.max(0, Math.min(100, g.value)) / 100;
        return (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="relative" style={{ width: size, height: size }}>
              <svg viewBox="0 0 100 100" className="h-full w-full" style={{ transform: "rotate(135deg)" }}>
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={alpha(c.accent, "26")}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${SPAN * CIRC} ${CIRC}`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={c.accent}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${SPAN * CIRC * v} ${CIRC}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-extrabold tabular-nums tracking-tight" style={{ color: c.heading }}>
                  {Math.round(g.value)}%
                </span>
              </div>
            </div>
            <div className="mt-1 text-sm font-bold" style={{ color: c.heading }}>
              {g.label}
            </div>
            {g.caption && (
              <p className="mt-0.5 text-xs leading-snug" style={{ color: c.muted }}>
                {g.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- NestedCircles ----------------------------- */

export interface RingItem {
  value: ReactNode; // e.g. "$50B"
  label: ReactNode; // e.g. "TAM"
}

/**
 * Bottom-anchored nested circles (outermost first) with each ring's value in
 * its visible top band — the market-size (TAM/SAM/SOM) figure.
 */
export function NestedCircles({ items, theme, size = 240 }: { items: RingItem[]; theme: Theme; size?: number }) {
  const c = tc(theme);
  const rings = items.slice(0, 3);
  const scales = [1, 0.66, 0.38];
  const fills = ["14", "26"];
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {rings.map((r, i) => {
        const d = size * (scales[i] ?? 0.3);
        const innermost = i === rings.length - 1;
        return (
          <div
            key={i}
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              bottom: 0,
              width: d,
              height: d,
              background: innermost
                ? `linear-gradient(135deg, ${c.accent}, ${alpha(c.accent, "cc")})`
                : alpha(c.accent, fills[i] ?? "14"),
              border: innermost ? "none" : `1.5px solid ${alpha(c.accent, "40")}`,
              boxShadow: innermost ? `0 6px 18px ${alpha(c.accent, "40")}` : undefined,
            }}
          >
            <div
              className={`flex flex-col items-center ${innermost ? "h-full justify-center" : "pt-2"}`}
            >
              <span
                className="text-sm font-extrabold tabular-nums tracking-tight"
                style={{ color: innermost ? "#ffffff" : c.heading }}
              >
                {r.value}
              </span>
              <span
                className="text-[0.6rem] font-bold uppercase tracking-[0.14em]"
                style={{ color: innermost ? "rgba(255,255,255,0.85)" : c.muted }}
              >
                {r.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ OverlapCircles ----------------------------- */

/** Three overlapping circles; the middle one is solid and emphasized (Venn-style). */
export function OverlapCircles({
  items,
  theme,
  diameter = 170,
}: {
  items: RichItem[];
  theme: Theme;
  diameter?: number;
}) {
  const c = tc(theme);
  const three = items.slice(0, 3);
  return (
    <div className="flex items-center justify-center">
      {three.map((it, i) => {
        const mid = i === 1;
        return (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-full px-6 text-center"
            style={{
              width: diameter,
              height: diameter,
              marginLeft: i === 0 ? 0 : -diameter * 0.18,
              zIndex: mid ? 2 : 1,
              background: mid
                ? `linear-gradient(135deg, ${c.accent}, ${alpha(c.accent, "cc")})`
                : alpha(c.accent, "14"),
              border: mid ? "none" : `1.5px solid ${alpha(c.accent, "40")}`,
              boxShadow: mid ? `0 6px 18px ${alpha(c.accent, "40")}` : undefined,
            }}
          >
            {it.label && (
              <div className="text-sm font-bold tracking-tight" style={{ color: mid ? "#ffffff" : c.heading }}>
                {it.label}
              </div>
            )}
            <div className="mt-1 text-xs leading-snug" style={{ color: mid ? "rgba(255,255,255,0.85)" : c.muted }}>
              {it.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- ScheduleTable ----------------------------- */

export interface ScheduleRow {
  time: string;
  activity: ReactNode;
  duration?: string;
  outcome?: ReactNode;
}

/** Run-of-show table: monospace time rail, bold activity, optional duration/outcome columns. */
export function ScheduleTable({ rows, theme }: { rows: ScheduleRow[]; theme: Theme }) {
  const c = tc(theme);
  const hasDuration = rows.some((r) => r.duration);
  const hasOutcome = rows.some((r) => r.outcome);
  const th = "px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.12em]";
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ border: `1px solid ${c.border}`, borderTop: `3px solid ${c.accent}` }}
    >
      <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: alpha(c.accent, "14") }}>
            <th className={th} style={{ color: c.heading, width: "16%" }}>
              Time
            </th>
            <th className={th} style={{ color: c.heading }}>
              Activity
            </th>
            {hasDuration && (
              <th className={th} style={{ color: c.heading, width: "14%" }}>
                Duration
              </th>
            )}
            {hasOutcome && (
              <th className={th} style={{ color: c.heading, width: "30%" }}>
                Outcome
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${c.border}` }}>
              <td
                className="px-4 py-2.5 font-mono text-xs font-bold tabular-nums"
                style={{ color: c.accent, whiteSpace: "nowrap" }}
              >
                {r.time}
              </td>
              <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: c.heading }}>
                {r.activity}
              </td>
              {hasDuration && (
                <td className="px-4 py-2.5 text-xs tabular-nums" style={{ color: c.muted }}>
                  {r.duration}
                </td>
              )}
              {hasOutcome && (
                <td className="px-4 py-2.5 text-xs leading-snug" style={{ color: c.text }}>
                  {r.outcome}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------- ToneScaleBlocks ----------------------------- */

/**
 * Blocks stepping from strong to faint accent fill — an intensity/priority
 * scale expressed with tone alone. Text auto-inverts on the darker blocks.
 */
export function ToneScaleBlocks({ items, theme }: { items: StatItem[]; theme: Theme }) {
  const c = tc(theme);
  const n = Math.max(items.length, 1);
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {items.map((it, i) => {
        const t = n === 1 ? 1 : 1 - (i / (n - 1)) * 0.72; // 1 -> 0.28
        const aHex = Math.round(t * 255)
          .toString(16)
          .padStart(2, "0");
        const onDark = t >= 0.55;
        return (
          <div
            key={i}
            className="rounded-xl px-4 py-3.5"
            style={{ backgroundColor: alpha(c.accent, aHex), border: `1px solid ${alpha(c.accent, "33")}` }}
          >
            <div
              className="text-2xl font-extrabold tabular-nums tracking-tight"
              style={{ color: onDark ? "#ffffff" : c.heading }}
            >
              {it.value}
            </div>
            <div className="mt-0.5 text-sm font-bold" style={{ color: onDark ? "rgba(255,255,255,0.92)" : c.heading }}>
              {it.label}
            </div>
            {it.text && (
              <p className="mt-0.5 text-xs leading-snug" style={{ color: onDark ? "rgba(255,255,255,0.75)" : c.muted }}>
                {it.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- PhaseCircles ------------------------------ */

export interface PhaseItem {
  label: ReactNode;
  text?: ReactNode;
  active?: boolean;
}

/**
 * A row/grid of phase circles where fill state reads as status: solid accent
 * (active/complete) vs faint dashed tint (planned).
 */
export function PhaseCircles({
  items,
  theme,
  columns,
}: {
  items: PhaseItem[];
  theme: Theme;
  columns?: number;
}) {
  const c = tc(theme);
  const cols = columns ?? Math.min(4, items.length);
  return (
    <div className="grid justify-items-center gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((it, i) => {
        const on = it.active === true;
        return (
          <div
            key={i}
            className="flex aspect-square w-full max-w-[170px] flex-col items-center justify-center rounded-full px-5 text-center"
            style={{
              background: on
                ? `linear-gradient(135deg, ${c.accent}, ${alpha(c.accent, "cc")})`
                : alpha(c.accent, "12"),
              border: on ? "none" : `1.5px dashed ${alpha(c.accent, "4d")}`,
              boxShadow: on ? `0 6px 18px ${alpha(c.accent, "40")}` : undefined,
            }}
          >
            <div className="text-sm font-bold tracking-tight" style={{ color: on ? "#ffffff" : c.heading }}>
              {it.label}
            </div>
            {it.text && (
              <div className="mt-1 text-xs leading-snug" style={{ color: on ? "rgba(255,255,255,0.85)" : c.muted }}>
                {it.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ EdgeBadgeCards ----------------------------- */

/** Stacked cards whose number badge overlaps the left card edge. */
export function EdgeBadgeCards({ items, theme }: { items: RichItem[]; theme: Theme }) {
  const c = tc(theme);
  return (
    <div className="flex flex-col gap-4 pl-5">
      {items.map((it, i) => (
        <div
          key={i}
          className="relative rounded-xl py-3.5 pl-8 pr-5"
          style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
        >
          <span
            className="absolute -left-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-sm font-extrabold tabular-nums text-white"
            style={{
              background: `linear-gradient(135deg, ${c.accent}, ${alpha(c.accent, "cc")})`,
              boxShadow: `0 0 0 4px ${alpha(c.accent, "1a")}, 0 3px 10px ${alpha(c.accent, "4d")}`,
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          {it.label && (
            <h3 className="text-base font-bold tracking-tight" style={{ color: c.heading }}>
              {it.label}
            </h3>
          )}
          <p className="mt-0.5 text-sm leading-relaxed" style={{ color: c.text }}>
            {it.text}
          </p>
        </div>
      ))}
    </div>
  );
}
