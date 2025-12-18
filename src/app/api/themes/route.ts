import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { serverCache, SERVER_CACHE_TTL } from "~/lib/server-cache";

// Curated color palettes - must match CustomThemeCreator
const CURATED_PALETTES: Record<string, { background: string; backgroundAlt: string; text: string; heading: string; primary: string; accent: string }> = {
  "clean-white": { background: "#ffffff", backgroundAlt: "#f8fafc", text: "#334155", heading: "#0f172a", primary: "#3b82f6", accent: "#06b6d4" },
  "soft-cream": { background: "#fefce8", backgroundAlt: "#fef9c3", text: "#713f12", heading: "#422006", primary: "#ca8a04", accent: "#eab308" },
  "elegant-noir": { background: "#0a0a0b", backgroundAlt: "#1a1a1d", text: "#e4e4e7", heading: "#fafafa", primary: "#f59e0b", accent: "#6366f1" },
  "midnight-blue": { background: "#0f172a", backgroundAlt: "#1e293b", text: "#cbd5e1", heading: "#f1f5f9", primary: "#3b82f6", accent: "#06b6d4" },
  "forest-green": { background: "#052e16", backgroundAlt: "#14532d", text: "#bbf7d0", heading: "#dcfce7", primary: "#22c55e", accent: "#4ade80" },
  "ocean-depths": { background: "#0c4a6e", backgroundAlt: "#075985", text: "#bae6fd", heading: "#e0f2fe", primary: "#0ea5e9", accent: "#38bdf8" },
  "sunset-warm": { background: "#fff7ed", backgroundAlt: "#ffedd5", text: "#9a3412", heading: "#7c2d12", primary: "#f97316", accent: "#fb923c" },
  "rose-garden": { background: "#fff1f2", backgroundAlt: "#ffe4e6", text: "#9f1239", heading: "#881337", primary: "#f43f5e", accent: "#fb7185" },
  "purple-haze": { background: "#2e1065", backgroundAlt: "#4c1d95", text: "#e9d5ff", heading: "#f3e8ff", primary: "#a855f7", accent: "#c084fc" },
  "cyber-neon": { background: "#020617", backgroundAlt: "#0f172a", text: "#22d3ee", heading: "#67e8f9", primary: "#06b6d4", accent: "#f0abfc" },
  "corporate-gray": { background: "#f8fafc", backgroundAlt: "#f1f5f9", text: "#475569", heading: "#1e293b", primary: "#64748b", accent: "#94a3b8" },
  "warm-earth": { background: "#faf5f0", backgroundAlt: "#f5ebe0", text: "#78350f", heading: "#451a03", primary: "#b45309", accent: "#d97706" },
};

// GET - Fetch user's custom themes with server-side caching
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // OPTIMIZATION: Server-side caching for themes
    const cacheKey = `themes-${user.id}`;
    let themes = serverCache.get<unknown[]>(cacheKey);
    
    if (!themes) {
      themes = await db.theme.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          colors: true,
          fonts: true,
          designElements: true,
          isDefault: true,
          createdAt: true,
        },
      });
      serverCache.set(cacheKey, themes, SERVER_CACHE_TTL.THEMES);
    }

    return NextResponse.json(
      { themes },
      {
        headers: {
          "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching themes:", error);
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}

// POST - Create a new custom theme
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      themeName,
      colorMode,
      selectedPalette,
      customColors,
      headingFont,
      bodyFont,
      cardStyle,
      logoUrl,
    } = body;

    if (!themeName?.trim()) {
      return NextResponse.json({ error: "Theme name is required" }, { status: 400 });
    }

    // Resolve the actual colors - if curated mode, use the palette colors
    let resolvedColors = customColors;
    if (colorMode === "curated" && selectedPalette && CURATED_PALETTES[selectedPalette]) {
      resolvedColors = CURATED_PALETTES[selectedPalette];
    }

    // Build the theme data structure with resolved colors
    const colors = {
      mode: colorMode,
      palette: selectedPalette,
      custom: resolvedColors,
    };

    const fonts = {
      heading: headingFont,
      body: bodyFont,
    };

    const designElements = {
      cardStyle,
      logoUrl,
    };

    const theme = await db.theme.create({
      data: {
        name: themeName.trim(),
        colors,
        fonts,
        designElements,
        isDefault: false,
        userId: user.id,
      },
    });

    // OPTIMIZATION: Invalidate server cache when theme is created
    serverCache.invalidate(`themes-${user.id}`);

    return NextResponse.json({ theme }, { status: 201 });
  } catch (error) {
    console.error("Error creating theme:", error);
    return NextResponse.json({ error: "Failed to create theme" }, { status: 500 });
  }
}
