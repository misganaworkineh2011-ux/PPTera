"use client";

import { useState } from "react";
import { Loader2, Save, Sparkles, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadButton } from "~/components/presentation/ImageUploadButton";

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Lato",
  "Open Sans",
  "Playfair Display",
  "Merriweather",
  "Source Code Pro",
  "Space Grotesk",
];

export interface BrandKitData {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  accentColor: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  footerText: string | null;
  enabled: boolean;
}

interface BrandKitClientProps {
  initialKit: BrandKitData | null;
  canUseBrandTheme: boolean;
}

/**
 * Brand kit editor: logo, colors, fonts, footer. Saved once — every new deck
 * generates on-brand (theme for Pro/Ultra; logo + footer on all plans).
 */
export default function BrandKitClient({
  initialKit,
  canUseBrandTheme,
}: BrandKitClientProps) {
  const [kit, setKit] = useState<BrandKitData>(
    initialKit ?? {
      logoUrl: null,
      primaryColor: "#10b981",
      secondaryColor: null,
      accentColor: null,
      headingFont: "Inter",
      bodyFont: "Inter",
      footerText: null,
      enabled: true,
    },
  );
  const [isSaving, setIsSaving] = useState(false);

  const set = <K extends keyof BrandKitData>(key: K, value: BrandKitData[K]) =>
    setKit((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/brand-kit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success(
        canUseBrandTheme
          ? "Brand kit saved — new decks will use your brand."
          : "Brand kit saved — logo & footer will appear on new decks.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save brand kit");
    } finally {
      setIsSaving(false);
    }
  };

  const colorField = (
    label: string,
    key: "primaryColor" | "secondaryColor" | "accentColor",
    required = false,
  ) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={kit[key] ?? "#10b981"}
          onChange={(e) => set(key, e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200"
        />
        <input
          type="text"
          value={kit[key] ?? ""}
          placeholder={required ? "#10b981" : "Optional"}
          onChange={(e) =>
            set(key, (e.target.value || (required ? "#10b981" : null)) as never)
          }
          className="w-28 rounded-lg border border-slate-200 px-2.5 py-2 font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Sparkles size={20} className="text-emerald-500" /> Brand kit
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Set your brand once — every presentation you generate comes out
          on-brand automatically. The logo and footer land on every slide
          {canUseBrandTheme
            ? ", and your colors & fonts become a custom theme."
            : ". Upgrade to Pro to also apply brand colors & fonts as a theme."}
        </p>
      </div>

      <div className="flex flex-col gap-7 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        {/* Enabled toggle */}
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-bold text-slate-800">
              Use my brand on new presentations
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              When off, generation behaves as before.
            </span>
          </span>
          <input
            type="checkbox"
            checked={kit.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
            className="h-5 w-5 accent-emerald-600"
          />
        </label>

        {/* Logo */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Logo (shown top-right of every slide)
          </label>
          <div className="flex items-center gap-3">
            {kit.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={kit.logoUrl}
                alt="Brand logo"
                className="h-12 max-w-[160px] rounded-lg border border-slate-200 object-contain p-1"
              />
            ) : (
              <div className="flex h-12 w-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[0.65rem] text-slate-400">
                No logo
              </div>
            )}
            <ImageUploadButton onUploaded={(url) => set("logoUrl", url)} label="Upload logo" />
            {kit.logoUrl && (
              <button
                onClick={() => set("logoUrl", null)}
                className="text-xs font-semibold text-slate-500 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Colors */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Brand colors</span>
            {!canUseBrandTheme && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6rem] font-bold text-amber-700">
                Theme requires Pro
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-5">
            {colorField("Primary", "primaryColor", true)}
            {colorField("Secondary", "secondaryColor")}
            {colorField("Accent", "accentColor")}
          </div>
        </div>

        {/* Fonts */}
        <div className="flex flex-wrap gap-5">
          {(
            [
              ["Heading font", "headingFont"],
              ["Body font", "bodyFont"],
            ] as const
          ).map(([label, key]) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                {label}
              </label>
              <select
                value={kit[key] ?? "Inter"}
                onChange={(e) => set(key, e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Footer text */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Footer text (shown bottom of every slide)
          </label>
          <input
            type="text"
            value={kit.footerText ?? ""}
            onChange={(e) => set("footerText", e.target.value || null)}
            placeholder="© Acme Inc. — Confidential"
            maxLength={120}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save brand kit
        </button>

        {canUseBrandTheme && (
          <p className="flex items-center gap-1.5 text-[0.7rem] text-slate-500">
            <BadgeCheck size={13} className="text-emerald-500" />
            Saving also creates/updates the “My Brand Kit” theme in your custom
            themes, so you can apply it to existing decks from the theme sidebar.
          </p>
        )}
      </div>
    </div>
  );
}
