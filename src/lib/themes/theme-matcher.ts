/**
 * Pick a theme that fits a presentation's topic.
 *
 * A finance pitch, a wedding deck, and a cybersecurity briefing should not all
 * open with the same default theme. This maps topic keywords to a topic-appropriate
 * built-in theme. Unknown/no-match topics fall back to the clean professional default.
 *
 * All returned IDs are real theme files; getThemeById() falls back safely anyway.
 */

// Ordered most-specific first. First group with a keyword hit wins.
const THEME_RULES: Array<{ keywords: string[]; themeId: string }> = [
  // Tech / cyber / security / software / AI / data
  {
    keywords: ["cyber", "security", "hack", "infosec", "malware", "network", "blockchain", "crypto"],
    themeId: "cyberpunk-neon",
  },
  {
    keywords: ["ai", "artificial intelligence", "machine learning", "data", "algorithm", "software", "developer", "coding", "programming", "saas", "api", "tech", "startup"],
    themeId: "dna-blueprint",
  },
  // Space / science / future
  {
    keywords: ["space", "astronomy", "cosmos", "galaxy", "planet", "universe", "nasa", "rocket", "quantum", "physics"],
    themeId: "nebula",
  },
  // Finance / business / corporate / strategy
  {
    keywords: ["finance", "financial", "invest", "stock", "market", "banking", "revenue", "profit", "corporate", "business", "strategy", "consulting", "b2b", "sales", "enterprise"],
    themeId: "corporate-clean",
  },
  // Luxury / premium / fashion / real estate
  {
    keywords: ["luxury", "premium", "fashion", "jewelry", "elegant", "exclusive", "real estate", "architecture", "interior"],
    themeId: "black-gold-luxury",
  },
  // Wedding / love / floral / romance
  {
    keywords: ["wedding", "bride", "love", "romance", "anniversary", "floral", "flower", "valentine"],
    themeId: "rose-garden",
  },
  // Nature / environment / sustainability / climate
  {
    keywords: ["nature", "environment", "sustainab", "climate", "green", "eco", "forest", "renewable", "wildlife", "earth", "conservation"],
    themeId: "earth-forest",
  },
  // Health / wellness / medical / calm
  {
    keywords: ["health", "wellness", "medical", "medicine", "fitness", "mental", "mindful", "meditation", "yoga", "therapy", "care"],
    themeId: "coastal-breeze",
  },
  // Food / culinary
  {
    keywords: ["food", "recipe", "culinary", "restaurant", "cooking", "cuisine", "nutrition", "coffee", "bakery"],
    themeId: "citrus-splash",
  },
  // Travel / beach / summer
  {
    keywords: ["travel", "beach", "vacation", "tourism", "summer", "ocean", "tropical", "island", "adventure"],
    themeId: "sunset-coast",
  },
  // History / vintage / culture / art
  {
    keywords: ["history", "historical", "vintage", "heritage", "culture", "museum", "ancient", "classic", "art"],
    themeId: "vintage-botanical",
  },
  // Energy / sports / motivation / bold
  {
    keywords: ["sport", "fitness", "energy", "motivation", "champion", "game", "fire", "bold", "power"],
    themeId: "fire-gradient",
  },
  // Education / kids / creative
  {
    keywords: ["kids", "children", "school", "education", "learning", "creative", "fun", "playful", "anime", "comic"],
    themeId: "spring-pastel",
  },
];

const DEFAULT_THEME_ID = "corporate-clean";

export function pickThemeForTopic(topic: string | null | undefined): string {
  if (!topic) return DEFAULT_THEME_ID;
  const t = topic.toLowerCase();
  for (const rule of THEME_RULES) {
    if (rule.keywords.some((kw) => t.includes(kw))) {
      return rule.themeId;
    }
  }
  return DEFAULT_THEME_ID;
}
