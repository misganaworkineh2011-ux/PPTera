/**
 * Icon Placeholder Generation Utility
 * 
 * Generates placeholder structures for icons that will be
 * replaced with actual icons from a future API integration.
 */

import type { IconPlaceholder } from "./types";

// Simple category mapping for icon hints
const ICON_CATEGORIES: Record<string, string[]> = {
  business: ["chart", "growth", "money", "target", "briefcase", "handshake"],
  technology: ["code", "laptop", "cloud", "server", "database", "api"],
  communication: ["email", "chat", "phone", "video", "message", "send"],
  security: ["lock", "shield", "key", "secure", "protect", "firewall"],
  data: ["analytics", "metrics", "graph", "statistics", "report", "dashboard"],
  process: ["flow", "step", "workflow", "automation", "pipeline", "system"],
  people: ["team", "user", "group", "community", "collaboration", "network"],
  success: ["check", "award", "star", "trophy", "goal", "achievement"],
  time: ["clock", "calendar", "schedule", "deadline", "timer", "history"],
  creative: ["lightbulb", "idea", "design", "art", "palette", "innovation"],
};

// Default placeholder SVG (simple circle with initial)
function createPlaceholderSVG(name: string, color: string = "#06b6d4"): string {
  const initial = name.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <text x="12" y="16" text-anchor="middle" font-size="10" fill="${color}" stroke="none">${initial}</text>
  </svg>`;
}

// Simple icon representations using Unicode/emoji as placeholders
const ICON_PLACEHOLDERS: Record<string, string> = {
  // Business
  chart: "📊",
  growth: "📈",
  money: "💰",
  target: "🎯",
  briefcase: "💼",
  handshake: "🤝",
  
  // Technology
  code: "💻",
  laptop: "💻",
  cloud: "☁️",
  server: "🖥️",
  database: "🗄️",
  api: "🔌",
  
  // Communication
  email: "📧",
  chat: "💬",
  phone: "📱",
  video: "🎥",
  message: "✉️",
  send: "📤",
  
  // Security
  lock: "🔒",
  shield: "🛡️",
  key: "🔑",
  secure: "🔐",
  protect: "🛡️",
  firewall: "🧱",
  
  // Data
  analytics: "📊",
  metrics: "📉",
  graph: "📈",
  statistics: "📊",
  report: "📋",
  dashboard: "📊",
  
  // Process
  flow: "➡️",
  step: "👣",
  workflow: "🔄",
  automation: "⚙️",
  pipeline: "🔗",
  system: "🖥️",
  
  // People
  team: "👥",
  user: "👤",
  group: "👨‍👩‍👧‍👦",
  community: "🌐",
  collaboration: "🤝",
  network: "🌐",
  
  // Success
  check: "✅",
  award: "🏆",
  star: "⭐",
  trophy: "🏆",
  goal: "🎯",
  achievement: "🏅",
  
  // Time
  clock: "⏰",
  calendar: "📅",
  schedule: "📆",
  deadline: "⏱️",
  timer: "⏲️",
  history: "📜",
  
  // Creative
  lightbulb: "💡",
  idea: "💡",
  design: "🎨",
  art: "🎨",
  palette: "🎨",
  innovation: "🚀",
  
  // General
  default: "●",
};

/**
 * Detect category from icon name
 */
function detectCategory(name: string): string | undefined {
  const normalized = name.toLowerCase();
  
  for (const [category, keywords] of Object.entries(ICON_CATEGORIES)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      return category;
    }
  }
  
  return undefined;
}

/**
 * Get placeholder for an icon name
 */
function getPlaceholder(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, "");
  
  // Direct match
  if (ICON_PLACEHOLDERS[normalized]) {
    return ICON_PLACEHOLDERS[normalized];
  }
  
  // Partial match
  for (const [key, placeholder] of Object.entries(ICON_PLACEHOLDERS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return placeholder;
    }
  }
  
  return ICON_PLACEHOLDERS.default;
}

/**
 * Generate icon placeholders from icon name list
 * 
 * Creates placeholder structures that can be rendered immediately
 * and replaced with actual icons when an API is integrated.
 */
export function generateIconPlaceholders(iconNames: string[]): IconPlaceholder[] {
  return iconNames.map((name) => ({
    name: name.toLowerCase().trim(),
    placeholder: getPlaceholder(name),
    category: detectCategory(name),
  }));
}

/**
 * Generate icons from slide assets
 */
export function generateIconsFromSlide(iconNames?: string[]): IconPlaceholder[] {
  if (!iconNames || iconNames.length === 0) {
    return [];
  }
  
  return generateIconPlaceholders(iconNames);
}

/**
 * Generate a single icon placeholder with SVG fallback
 */
export function generateSingleIcon(name: string): IconPlaceholder & { svg: string } {
  return {
    name: name.toLowerCase().trim(),
    placeholder: getPlaceholder(name),
    category: detectCategory(name),
    svg: createPlaceholderSVG(name),
  };
}

/**
 * Check if a slide should have icons based on its assets
 */
export function shouldHaveIcons(iconNames?: string[]): boolean {
  return !!iconNames && iconNames.length > 0;
}

