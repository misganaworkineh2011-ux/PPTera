"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  X,
  Image as ImageIcon,
  Type,
  Hash,
  Calendar,
  Minus,
  Trash2,
  Layers,
  RotateCcw,
  Check,
  Tag,
  Sparkles,
} from "lucide-react";
import type { Theme } from "~/lib/themes";
import type {
  MasterSlideSettings,
  MasterPosition,
  FooterAlign,
  NumberFormat,
  BarPosition,
} from "~/components/presentation/types";
import { getModalColors } from "./ui-colors";
import { ImageUploadButton } from "~/components/presentation/ImageUploadButton";
import MasterSlideOverlay from "~/components/presentation/MasterSlideOverlay";

interface MasterSlideEditorProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MasterSlideSettings | null;
  onChange: (next: MasterSlideSettings | null) => void;
  theme: Theme;
  presentationId: string;
}

interface UIColors {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  inputBg: string;
  hoverBg: string;
}

const ALIGNS: { id: FooterAlign; label: string }[] = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

/* ----------------------------- small UI atoms ----------------------------- */

function Toggle({ on, onToggle, c }: { on: boolean; onToggle: () => void; c: UIColors }) {
  return (
    <button
      onClick={onToggle}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: on ? c.accent : c.hoverBg }}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onSelect,
  c,
}: {
  value: T;
  options: { id: T; label: ReactNode }[];
  onSelect: (v: T) => void;
  c: UIColors;
}) {
  return (
    <div
      className="grid gap-1 rounded-lg p-0.5"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        backgroundColor: c.hoverBg,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: active ? c.accent : "transparent",
              color: active ? "#ffffff" : c.textMuted,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function PositionPicker({
  value,
  onSelect,
  c,
}: {
  value: MasterPosition;
  onSelect: (v: MasterPosition) => void;
  c: UIColors;
}) {
  const positions: MasterPosition[] = [
    "top-left", "top-center", "top-right",
    "middle-left", "center", "middle-right",
    "bottom-left", "bottom-center", "bottom-right",
  ];
  return (
    <div
      className="mx-auto grid w-full max-w-[210px] grid-cols-3 grid-rows-3 gap-1.5 rounded-lg border p-1.5"
      style={{ borderColor: c.border, backgroundColor: c.inputBg, aspectRatio: "16 / 9" }}
    >
      {positions.map((pos) => {
        const active = value === pos;
        return (
          <button
            key={pos}
            onClick={() => onSelect(pos)}
            className="flex items-center justify-center rounded transition-all"
            style={{
              backgroundColor: active ? c.accent : c.hoverBg,
              boxShadow: active ? `0 0 0 2px ${c.accent}55` : "none",
            }}
            title={pos.replace("-", " ")}
          >
            {active && <Check size={11} className="text-white" />}
          </button>
        );
      })}
    </div>
  );
}

function SizeSlider({
  label,
  value,
  min,
  max,
  unit = "px",
  onChange,
  c,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
  c: UIColors;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <FieldLabel c={c}>{label}</FieldLabel>
        <span className="text-xs" style={{ color: c.textMuted }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: c.accent }}
      />
    </div>
  );
}

function ColorField({
  value,
  onSelect,
  themeAccent,
  c,
}: {
  value: string | undefined;
  onSelect: (v: string) => void;
  themeAccent: string;
  c: UIColors;
}) {
  const isAuto = !value || value === "auto";
  const resolved = isAuto ? themeAccent : (value as string);
  // Native <input type=color> needs a 6-digit hex; fall back if the theme color isn't one.
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(resolved) ? resolved : "#6366f1";
  // A handful of quick presets alongside the full picker.
  const presets = [themeAccent, "#ffffff", "#0f172a", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelect("auto")}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={{ backgroundColor: isAuto ? c.accent : c.hoverBg, color: isAuto ? "#ffffff" : c.textMuted }}
        >
          Auto
        </button>
        <label
          className="relative flex h-8 flex-1 cursor-pointer items-center gap-2 rounded-md border px-2"
          style={{ borderColor: c.border, backgroundColor: c.inputBg }}
          title="Pick a custom color"
        >
          <span className="h-5 w-5 rounded" style={{ backgroundColor: resolved, boxShadow: `inset 0 0 0 1px ${c.border}` }} />
          <span className="text-xs tabular-nums" style={{ color: isAuto ? c.textMuted : c.text }}>
            {isAuto ? "Theme color" : resolved.toUpperCase()}
          </span>
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onSelect(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((sw) => (
          <button
            key={sw}
            onClick={() => onSelect(sw)}
            title={sw}
            className="h-5 w-5 rounded-full transition-transform hover:scale-110"
            style={{
              background: sw,
              boxShadow:
                !isAuto && resolved.toLowerCase() === sw.toLowerCase()
                  ? `0 0 0 2px ${c.bg}, 0 0 0 4px ${c.accent}`
                  : `inset 0 0 0 1px ${c.border}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  right,
  children,
  c,
}: {
  icon: ReactNode;
  title: string;
  right?: ReactNode;
  children?: ReactNode;
  c: UIColors;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: c.border, backgroundColor: c.surface + "66" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: c.accent + "1f", color: c.accent }}
          >
            {icon}
          </div>
          <span className="text-sm font-semibold" style={{ color: c.text }}>
            {title}
          </span>
        </div>
        {right}
      </div>
      {children && <div className="mt-3.5 space-y-3">{children}</div>}
    </div>
  );
}

function FieldLabel({ children, c }: { children: ReactNode; c: UIColors }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: c.textMuted }}>
      {children}
    </span>
  );
}

/* ------------------------------ live preview ------------------------------ */

function MiniPreview({ settings, theme }: { settings: MasterSlideSettings | null; theme: Theme }) {
  // Fill the parent width and scale the fixed 1280x720 canvas to match — same
  // technique as SlideScaler, so the preview is faithful at any size.
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = width / 1280;
  const bg = theme.colors?.background || "#ffffff";
  const heading = theme.colors?.heading || theme.colors?.text || "#0f172a";
  const text = theme.colors?.text || "#334155";
  const accent = theme.colors?.accent || theme.colors?.primary || "#6366f1";

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10"
      style={{ aspectRatio: "16 / 9" }}
    >
      {width > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1280,
            height: 720,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: bg,
            fontFamily: theme.fonts?.body?.family,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "130px 110px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 28,
            }}
          >
            <div style={{ height: 12, width: 110, borderRadius: 6, background: accent, opacity: 0.9 }} />
            <div
              style={{
                fontSize: 62,
                fontWeight: 800,
                lineHeight: 1.05,
                color: heading,
                maxWidth: 800,
                fontFamily: theme.fonts?.heading?.family,
              }}
            >
              Sample slide title
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 6 }}>
              <div style={{ height: 16, width: "68%", borderRadius: 6, background: text, opacity: 0.16 }} />
              <div style={{ height: 16, width: "54%", borderRadius: 6, background: text, opacity: 0.16 }} />
              <div style={{ height: 16, width: "60%", borderRadius: 6, background: text, opacity: 0.16 }} />
            </div>
          </div>
          <MasterSlideOverlay
            settings={settings}
            slideNumber={3}
            totalSlides={10}
            theme={theme}
            isTitle={false}
          />
        </div>
      )}
    </div>
  );
}

/* -------------------------------- editor ---------------------------------- */

export function MasterSlideEditor({
  isOpen,
  onClose,
  settings,
  onChange,
  theme,
  presentationId,
}: MasterSlideEditorProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mc = getModalColors(theme);
  const c: UIColors = {
    bg: mc.bg,
    surface: mc.surface,
    border: mc.border,
    text: mc.text,
    textMuted: mc.textMuted,
    accent: mc.accent || "#a78bfa",
    inputBg: mc.inputBg,
    hoverBg: mc.hoverBg,
  };
  const themeAccent = theme.colors?.accent || theme.colors?.primary || c.accent;

  const s = settings || {};
  const logo = s.logo || null;
  const footer = s.footer || null;
  const numbers = s.slideNumbers || null;
  const date = s.date || null;
  const bar = s.accentBar || null;
  const tag = s.statusTag || null;

  const setLogo = (v: MasterSlideSettings["logo"]) => onChange({ ...s, logo: v });
  const setFooter = (v: MasterSlideSettings["footer"]) => onChange({ ...s, footer: v });
  const setNumbers = (v: MasterSlideSettings["slideNumbers"]) => onChange({ ...s, slideNumbers: v });
  const setDate = (v: MasterSlideSettings["date"]) => onChange({ ...s, date: v });
  const setBar = (v: MasterSlideSettings["accentBar"]) => onChange({ ...s, accentBar: v });
  const setTag = (v: MasterSlideSettings["statusTag"]) => onChange({ ...s, statusTag: v });

  // One-click brand setups. Each preserves any existing logo.
  const applyPreset = (preset: MasterSlideSettings) =>
    onChange({ ...preset, logo: s.logo ?? preset.logo ?? null });
  const PRESETS: { id: string; name: string; settings: MasterSlideSettings }[] = [
    {
      id: "clean",
      name: "Clean",
      settings: {
        slideNumbers: { show: true, align: "right", format: "plain", fontSize: 14, color: "auto" },
        hideOnTitle: true,
      },
    },
    {
      id: "corporate",
      name: "Corporate",
      settings: {
        footer: { show: true, text: "", align: "left", fontSize: 15, color: "auto" },
        slideNumbers: { show: true, align: "right", format: "fraction", fontSize: 14, color: "auto" },
        accentBar: { show: true, position: "bottom", color: "auto", thickness: 5 },
        hideOnTitle: true,
      },
    },
    {
      id: "bold",
      name: "Bold",
      settings: {
        accentBar: { show: true, position: "top", color: "auto", thickness: 12 },
        slideNumbers: { show: true, align: "right", format: "padded", fontSize: 18, color: "auto" },
        hideOnTitle: true,
      },
    },
    {
      id: "report",
      name: "Report",
      settings: {
        footer: { show: true, text: "", align: "left", fontSize: 14, color: "auto" },
        date: { show: true, align: "center", mode: "auto", fontSize: 14, color: "auto" },
        slideNumbers: { show: true, align: "right", format: "fraction", fontSize: 14, color: "auto" },
        statusTag: { show: true, text: "Confidential", position: "top-right", color: "auto" },
        hideOnTitle: true,
      },
    },
  ];

  if (!isOpen || !mounted) return null;

  const inputStyle = {
    backgroundColor: c.inputBg,
    borderColor: c.border,
    color: c.text,
  };

  const panel = (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md" onClick={onClose} />

      {/* Large independent live preview — floats to the LEFT of the panel, over the
          blurred backdrop. Updates as you edit. Hidden on narrow screens. */}
      <div
        className="fixed top-1/2 z-[61] hidden -translate-y-1/2 sm:block animate-in fade-in zoom-in-95 duration-300"
        style={{ right: 424, width: "min(860px, calc(100vw - 456px))" }}
      >
        <MiniPreview settings={settings} theme={theme} />
        <div className="mt-3 flex justify-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm"
            style={{ backgroundColor: c.bg, color: c.textMuted, border: `1px solid ${c.border}` }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: c.accent }} />
            Live preview · updates as you edit
          </span>
        </div>
      </div>

      <div
        className="fixed right-0 top-0 z-[61] flex h-full w-[400px] max-w-full flex-col overflow-hidden border-l shadow-2xl animate-in slide-in-from-right duration-300"
        style={{ background: c.bg, borderColor: c.border }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }}
          />
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent}aa)` }}
            >
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight" style={{ color: c.text }}>
                Master Slide
              </h2>
              <p className="text-xs" style={{ color: c.textMuted }}>
                Applied to every slide · live
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-black/10"
            style={{ color: c.textMuted }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Live preview is shown in the floating panel to the left (sm+). On the
              smallest screens, show a compact inline preview as a fallback. */}
          <div className="sm:hidden">
            <MiniPreview settings={settings} theme={theme} />
          </div>

          {/* Quick styles */}
          <SectionCard icon={<Sparkles size={16} />} title="Quick styles" c={c}>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.settings)}
                  className="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors"
                  style={{ borderColor: c.border, color: c.text, backgroundColor: c.inputBg }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = c.accent;
                    e.currentTarget.style.color = c.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = c.border;
                    e.currentTarget.style.color = c.text;
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Logo / brand */}
          <SectionCard icon={<ImageIcon size={16} />} title="Logo" c={c}>
            {logo?.url ? (
              <>
                <div
                  className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg border"
                  style={{ borderColor: c.border, backgroundColor: c.inputBg }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.url} alt="Logo" className="max-h-16 max-w-[70%] object-contain" />
                  <button
                    onClick={() => setLogo(null)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
                    title="Remove logo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <FieldLabel c={c}>Position</FieldLabel>
                  <PositionPicker value={logo.position} onSelect={(position) => setLogo({ ...logo, position })} c={c} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FieldLabel c={c}>Size</FieldLabel>
                    <span className="text-xs" style={{ color: c.textMuted }}>{logo.size}px</span>
                  </div>
                  <input
                    type="range" min={24} max={160} step={4} value={logo.size}
                    onChange={(e) => setLogo({ ...logo, size: Number(e.target.value) })}
                    className="w-full" style={{ accentColor: c.accent }}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FieldLabel c={c}>Opacity</FieldLabel>
                    <span className="text-xs" style={{ color: c.textMuted }}>{Math.round(logo.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range" min={20} max={100} step={5} value={Math.round(logo.opacity * 100)}
                    onChange={(e) => setLogo({ ...logo, opacity: Number(e.target.value) / 100 })}
                    className="w-full" style={{ accentColor: c.accent }}
                  />
                </div>

                <ImageUploadButton
                  presentationId={presentationId}
                  onUploaded={(url) => setLogo({ ...logo, url })}
                  label="Replace logo"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: c.border, color: c.text, backgroundColor: c.surface }}
                />
              </>
            ) : (
              <>
                <p className="text-xs" style={{ color: c.textMuted }}>
                  Add a logo shown on every slide.
                </p>
                <ImageUploadButton
                  presentationId={presentationId}
                  onUploaded={(url) => setLogo({ url, position: "bottom-right", size: 64, opacity: 1 })}
                  label="Upload logo"
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: c.accent }}
                />
                <input
                  type="url"
                  placeholder="…or paste an image URL, then press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const url = (e.target as HTMLInputElement).value.trim();
                      if (url) setLogo({ url, position: "bottom-right", size: 64, opacity: 1 });
                    }
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </>
            )}
          </SectionCard>

          {/* Footer */}
          <SectionCard
            icon={<Type size={16} />}
            title="Footer"
            c={c}
            right={
              <Toggle
                on={!!footer?.show}
                onToggle={() =>
                  setFooter(
                    footer?.show
                      ? { ...footer, show: false }
                      : { text: footer?.text || "", show: true, align: footer?.align || "left", color: footer?.color || "auto", fontSize: footer?.fontSize ?? 16 },
                  )
                }
                c={c}
              />
            }
          >
            {footer?.show && (
              <>
                <input
                  type="text"
                  value={footer.text}
                  onChange={(e) => setFooter({ ...footer, text: e.target.value })}
                  placeholder="e.g. Acme Inc. · Confidential"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Align</FieldLabel>
                  <Segmented value={footer.align} options={ALIGNS} onSelect={(align) => setFooter({ ...footer, align })} c={c} />
                </div>
                <SizeSlider label="Size" value={footer.fontSize ?? 16} min={10} max={36} onChange={(v) => setFooter({ ...footer, fontSize: v })} c={c} />
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Color</FieldLabel>
                  <ColorField value={footer.color} themeAccent={themeAccent} onSelect={(color) => setFooter({ ...footer, color })} c={c} />
                </div>
              </>
            )}
          </SectionCard>

          {/* Slide numbers */}
          <SectionCard
            icon={<Hash size={16} />}
            title="Slide numbers"
            c={c}
            right={
              <Toggle
                on={!!numbers?.show}
                onToggle={() =>
                  setNumbers(
                    numbers?.show
                      ? { ...numbers, show: false }
                      : { show: true, align: numbers?.align || "right", format: numbers?.format || "fraction", startAt: numbers?.startAt ?? 1, color: numbers?.color || "auto", fontSize: numbers?.fontSize ?? 15 },
                  )
                }
                c={c}
              />
            }
          >
            {numbers?.show && (
              <>
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Format</FieldLabel>
                  <Segmented
                    value={numbers.format || "fraction"}
                    options={[
                      { id: "plain" as NumberFormat, label: "3" },
                      { id: "fraction", label: "3 / 10" },
                      { id: "padded", label: "03" },
                      { id: "labeled", label: "Slide 3" },
                    ]}
                    onSelect={(format) => setNumbers({ ...numbers, format })}
                    c={c}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <FieldLabel c={c}>Align</FieldLabel>
                    <Segmented value={numbers.align} options={ALIGNS} onSelect={(align) => setNumbers({ ...numbers, align })} c={c} />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel c={c}>Start at</FieldLabel>
                    <input
                      type="number"
                      min={0}
                      value={numbers.startAt ?? 1}
                      onChange={(e) => setNumbers({ ...numbers, startAt: Number(e.target.value) })}
                      className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <SizeSlider label="Size" value={numbers.fontSize ?? 15} min={10} max={36} onChange={(v) => setNumbers({ ...numbers, fontSize: v })} c={c} />
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Color</FieldLabel>
                  <ColorField value={numbers.color} themeAccent={themeAccent} onSelect={(color) => setNumbers({ ...numbers, color })} c={c} />
                </div>
              </>
            )}
          </SectionCard>

          {/* Date */}
          <SectionCard
            icon={<Calendar size={16} />}
            title="Date"
            c={c}
            right={
              <Toggle
                on={!!date?.show}
                onToggle={() =>
                  setDate(
                    date?.show
                      ? { ...date, show: false }
                      : { show: true, align: date?.align || "center", mode: date?.mode || "auto", text: date?.text || "", color: date?.color || "auto", fontSize: date?.fontSize ?? 15 },
                  )
                }
                c={c}
              />
            }
          >
            {date?.show && (
              <>
                <Segmented
                  value={date.mode}
                  options={[{ id: "auto" as "auto" | "custom", label: "Today" }, { id: "custom", label: "Custom text" }]}
                  onSelect={(mode) => setDate({ ...date, mode })}
                  c={c}
                />
                {date.mode === "custom" && (
                  <input
                    type="text"
                    value={date.text || ""}
                    onChange={(e) => setDate({ ...date, text: e.target.value })}
                    placeholder="e.g. Q3 2026"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                )}
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Align</FieldLabel>
                  <Segmented value={date.align} options={ALIGNS} onSelect={(align) => setDate({ ...date, align })} c={c} />
                </div>
                <SizeSlider label="Size" value={date.fontSize ?? 15} min={10} max={36} onChange={(v) => setDate({ ...date, fontSize: v })} c={c} />
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Color</FieldLabel>
                  <ColorField value={date.color} themeAccent={themeAccent} onSelect={(color) => setDate({ ...date, color })} c={c} />
                </div>
              </>
            )}
          </SectionCard>

          {/* Accent bar */}
          <SectionCard
            icon={<Minus size={16} />}
            title="Accent bar"
            c={c}
            right={
              <Toggle
                on={!!bar?.show}
                onToggle={() =>
                  setBar(
                    bar?.show
                      ? { ...bar, show: false }
                      : { show: true, position: bar?.position || "bottom", color: bar?.color || "auto", thickness: bar?.thickness ?? 6 },
                  )
                }
                c={c}
              />
            }
          >
            {bar?.show && (
              <>
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Edge</FieldLabel>
                  <Segmented
                    value={bar.position}
                    options={[{ id: "top" as BarPosition, label: "Top" }, { id: "bottom", label: "Bottom" }]}
                    onSelect={(position) => setBar({ ...bar, position })}
                    c={c}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FieldLabel c={c}>Thickness</FieldLabel>
                    <span className="text-xs" style={{ color: c.textMuted }}>{bar.thickness ?? 6}px</span>
                  </div>
                  <input
                    type="range" min={2} max={24} step={1} value={bar.thickness ?? 6}
                    onChange={(e) => setBar({ ...bar, thickness: Number(e.target.value) })}
                    className="w-full" style={{ accentColor: c.accent }}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Color</FieldLabel>
                  <ColorField value={bar.color} themeAccent={themeAccent} onSelect={(color) => setBar({ ...bar, color })} c={c} />
                </div>
              </>
            )}
          </SectionCard>

          {/* Status tag */}
          <SectionCard
            icon={<Tag size={16} />}
            title="Status tag"
            c={c}
            right={
              <Toggle
                on={!!tag?.show}
                onToggle={() =>
                  setTag(
                    tag?.show
                      ? { ...tag, show: false }
                      : { show: true, text: tag?.text || "Confidential", position: tag?.position || "top-right", color: tag?.color || "auto" },
                  )
                }
                c={c}
              />
            }
          >
            {tag?.show && (
              <>
                <input
                  type="text"
                  value={tag.text}
                  onChange={(e) => setTag({ ...tag, text: e.target.value })}
                  placeholder="e.g. Confidential, Draft, Internal"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Position</FieldLabel>
                  <PositionPicker value={tag.position} onSelect={(position) => setTag({ ...tag, position })} c={c} />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel c={c}>Color</FieldLabel>
                  <ColorField value={tag.color} themeAccent={themeAccent} onSelect={(color) => setTag({ ...tag, color })} c={c} />
                </div>
              </>
            )}
          </SectionCard>

          {/* Options */}
          <SectionCard icon={<Check size={16} />} title="Options" c={c}>
            <SizeSlider label="Edge margin" value={s.margin ?? 40} min={12} max={90} onChange={(v) => onChange({ ...s, margin: v })} c={c} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: c.text }}>Keep title slide clean</p>
                <p className="text-xs" style={{ color: c.textMuted }}>Hide master elements on slide 1</p>
              </div>
              <Toggle on={!!s.hideOnTitle} onToggle={() => onChange({ ...s, hideOnTitle: !s.hideOnTitle })} c={c} />
            </div>
          </SectionCard>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 p-4" style={{ borderTop: `1px solid ${c.border}` }}>
          <button
            onClick={() => onChange(null)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/10"
            style={{ color: c.textMuted }}
          >
            <RotateCcw size={15} /> Reset all
          </button>
          <button
            onClick={onClose}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: c.accent }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(panel, document.body);
}

export default MasterSlideEditor;
