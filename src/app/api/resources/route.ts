import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

// Cache for static resources (icons, fonts, etc.)
const STATIC_RESOURCES_CACHE = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Predefined icon sets (Lucide icons available in the app)
const ICON_CATEGORIES = {
  general: [
    "Home", "Search", "Settings", "User", "Mail", "Phone", "Calendar", "Clock",
    "Star", "Heart", "Bookmark", "Share", "Download", "Upload", "Edit", "Trash",
    "Plus", "Minus", "Check", "X", "ChevronRight", "ChevronLeft", "ChevronUp", "ChevronDown",
    "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Menu", "MoreHorizontal", "MoreVertical",
  ],
  business: [
    "Briefcase", "Building", "CreditCard", "DollarSign", "TrendingUp", "TrendingDown",
    "BarChart", "PieChart", "LineChart", "Target", "Award", "Trophy", "Handshake",
    "Users", "UserPlus", "UserMinus", "Presentation", "FileText", "Folder", "Archive",
  ],
  technology: [
    "Laptop", "Monitor", "Smartphone", "Tablet", "Cpu", "HardDrive", "Database",
    "Cloud", "CloudUpload", "CloudDownload", "Wifi", "Bluetooth", "Globe", "Link",
    "Code", "Terminal", "GitBranch", "Github", "Layers", "Box", "Package",
  ],
  media: [
    "Image", "Camera", "Video", "Film", "Music", "Headphones", "Mic", "Volume",
    "Play", "Pause", "Stop", "SkipForward", "SkipBack", "Repeat", "Shuffle",
    "Youtube", "Instagram", "Twitter", "Facebook", "Linkedin",
  ],
  nature: [
    "Sun", "Moon", "Cloud", "CloudRain", "CloudSnow", "Wind", "Thermometer",
    "Droplet", "Leaf", "Flower", "Tree", "Mountain", "Waves", "Sunrise", "Sunset",
  ],
  arrows: [
    "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowUpRight", "ArrowUpLeft",
    "ArrowDownRight", "ArrowDownLeft", "MoveRight", "MoveLeft", "MoveUp", "MoveDown",
    "CornerUpRight", "CornerUpLeft", "CornerDownRight", "CornerDownLeft",
  ],
};

// Predefined font families
const FONT_CATEGORIES = {
  sans: [
    { name: "Inter", family: "Inter, sans-serif", weight: "400,500,600,700" },
    { name: "Roboto", family: "Roboto, sans-serif", weight: "400,500,700" },
    { name: "Open Sans", family: "'Open Sans', sans-serif", weight: "400,600,700" },
    { name: "Lato", family: "Lato, sans-serif", weight: "400,700" },
    { name: "Poppins", family: "Poppins, sans-serif", weight: "400,500,600,700" },
    { name: "Montserrat", family: "Montserrat, sans-serif", weight: "400,500,600,700" },
    { name: "Source Sans Pro", family: "'Source Sans Pro', sans-serif", weight: "400,600,700" },
    { name: "Nunito", family: "Nunito, sans-serif", weight: "400,600,700" },
  ],
  serif: [
    { name: "Playfair Display", family: "'Playfair Display', serif", weight: "400,700" },
    { name: "Merriweather", family: "Merriweather, serif", weight: "400,700" },
    { name: "Lora", family: "Lora, serif", weight: "400,700" },
    { name: "PT Serif", family: "'PT Serif', serif", weight: "400,700" },
    { name: "Crimson Text", family: "'Crimson Text', serif", weight: "400,600,700" },
  ],
  display: [
    { name: "Bebas Neue", family: "'Bebas Neue', cursive", weight: "400" },
    { name: "Oswald", family: "Oswald, sans-serif", weight: "400,500,600,700" },
    { name: "Raleway", family: "Raleway, sans-serif", weight: "400,500,600,700" },
    { name: "Archivo Black", family: "'Archivo Black', sans-serif", weight: "400" },
  ],
  mono: [
    { name: "Fira Code", family: "'Fira Code', monospace", weight: "400,500,700" },
    { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", weight: "400,500,700" },
    { name: "Source Code Pro", family: "'Source Code Pro', monospace", weight: "400,500,700" },
    { name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace", weight: "400,500,700" },
  ],
};

// Component templates
const COMPONENT_TEMPLATES = [
  { id: "cta-1", name: "Call to Action", category: "buttons", preview: "gradient-button" },
  { id: "card-1", name: "Feature Card", category: "cards", preview: "feature-card" },
  { id: "card-2", name: "Pricing Card", category: "cards", preview: "pricing-card" },
  { id: "card-3", name: "Team Card", category: "cards", preview: "team-card" },
  { id: "stat-1", name: "Stats Block", category: "stats", preview: "stats-block" },
  { id: "quote-1", name: "Quote Block", category: "quotes", preview: "quote-block" },
  { id: "timeline-1", name: "Timeline", category: "timeline", preview: "timeline" },
  { id: "comparison-1", name: "Comparison Table", category: "tables", preview: "comparison" },
];

function getCachedData(key: string) {
  const cached = STATIC_RESOURCES_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: unknown) {
  STATIC_RESOURCES_CACHE.set(key, { data, timestamp: Date.now() });
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search") || "";

    // Check cache first
    const cacheKey = `resources-${category}-${type}-${search}`;
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult, {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      });
    }

    // Build response based on type
    let result: Record<string, unknown> = {};

    if (type === "all" || type === "icons") {
      let icons = Object.entries(ICON_CATEGORIES).flatMap(([cat, iconList]) =>
        iconList.map((name) => ({ name, category: cat }))
      );
      
      if (search) {
        icons = icons.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (category !== "all" && ICON_CATEGORIES[category as keyof typeof ICON_CATEGORIES]) {
        icons = icons.filter((i) => i.category === category);
      }
      
      result.icons = icons;
      result.iconCategories = Object.keys(ICON_CATEGORIES);
    }

    if (type === "all" || type === "fonts") {
      let fonts = Object.entries(FONT_CATEGORIES).flatMap(([cat, fontList]) =>
        fontList.map((font) => ({ ...font, category: cat }))
      );
      
      if (search) {
        fonts = fonts.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
      }
      
      result.fonts = fonts;
      result.fontCategories = Object.keys(FONT_CATEGORIES);
    }

    if (type === "all" || type === "components") {
      let components = COMPONENT_TEMPLATES;
      
      if (search) {
        components = components.filter((c) => 
          c.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      result.components = components;
    }

    // Cache the result
    setCachedData(cacheKey, result);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST - Save a resource to user's favorites
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { type, name, url, category, tags } = body;

    const resource = await db.resource.create({
      data: {
        type,
        name,
        url: url || "",
        category,
        tags: tags || [],
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, resource });
  } catch (error) {
    console.error("Error saving resource:", error);
    return NextResponse.json(
      { error: "Failed to save resource" },
      { status: 500 }
    );
  }
}
