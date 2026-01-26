import type { ThemeType } from "../components";

export const stripHtml = (html: string): string => {
  if (!html) return "";
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  return html.replace(/<[^>]*>/g, "");
};

export const getTitleSlideColors = (
  themeType: ThemeType,
  hasImage: boolean,
): { title: string; subtitle: string } => {
  if (hasImage) {
    return { title: "#ffffff", subtitle: "#e2e8f0" };
  }

  const colorMap: Record<ThemeType, { title: string; subtitle: string }> = {
    dark: { title: "#fafafa", subtitle: "#a1a1aa" },
    light: { title: "#0f172a", subtitle: "#64748b" },
    sunset: { title: "#ffffff", subtitle: "#f9a8d4" },
    ocean: { title: "#ffffff", subtitle: "#7dd3fc" },
    aurora: { title: "#ffffff", subtitle: "#c4b5fd" },
    ember: { title: "#ffffff", subtitle: "#fca5a5" },
    midnight: { title: "#ffffff", subtitle: "#fda4af" },
    cyber: { title: "#ffffff", subtitle: "#67e8f9" },
    alien: { title: "#ffffff", subtitle: "#a3ff00" },
    corporate: { title: "#111827", subtitle: "#6b7280" },
    cosmic: { title: "#ffffff", subtitle: "#c4b5fd" },
    architectural: { title: "#ffffff", subtitle: "#a3a3a3" },
    anime: { title: "#ffffff", subtitle: "#d8b4fe" },
    hacker: { title: "#00ff41", subtitle: "#39ff14" },
    "custom-dark": { title: "#fafafa", subtitle: "#a1a1aa" },
    "custom-light": { title: "#0f172a", subtitle: "#64748b" },
  };

  return colorMap[themeType] || colorMap.dark;
};
