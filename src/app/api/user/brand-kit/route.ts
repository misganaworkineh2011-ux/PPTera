import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";
import { serverCache } from "~/lib/server-cache";

const BRAND_THEME_NAME = "My Brand Kit";
const HEX = /^#[0-9a-fA-F]{6}$/;

function isColorDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// GET — the user's brand kit (or null)
export async function GET() {
  try {
    const authUser = await requireAuth();
    const kit = await db.brandKit.findUnique({ where: { userId: authUser.id } });
    const canUseBrandTheme = ["pro", "ultra"].includes(
      (authUser.subscriptionPlan ?? "").toLowerCase(),
    );
    return NextResponse.json({ kit, canUseBrandTheme });
  } catch (error) {
    console.error("Error loading brand kit:", error);
    return NextResponse.json({ error: "Failed to load brand kit" }, { status: 500 });
  }
}

// PUT — upsert the brand kit and keep the derived "My Brand Kit" custom theme
// in sync (theme creation follows the same Pro/Ultra gate as custom themes;
// logo + footer via master slide work on every plan).
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body = await request.json();

    const primaryColor = HEX.test(body?.primaryColor ?? "") ? body.primaryColor : "#6366f1";
    const secondaryColor = HEX.test(body?.secondaryColor ?? "") ? body.secondaryColor : null;
    const accentColor = HEX.test(body?.accentColor ?? "") ? body.accentColor : null;
    const logoUrl =
      typeof body?.logoUrl === "string" && body.logoUrl.trim() ? body.logoUrl.trim() : null;
    const headingFont =
      typeof body?.headingFont === "string" && body.headingFont.trim()
        ? body.headingFont.trim()
        : null;
    const bodyFont =
      typeof body?.bodyFont === "string" && body.bodyFont.trim() ? body.bodyFont.trim() : null;
    const footerText =
      typeof body?.footerText === "string" && body.footerText.trim()
        ? body.footerText.trim().slice(0, 120)
        : null;
    const enabled = body?.enabled !== false;

    const kit = await db.brandKit.upsert({
      where: { userId: authUser.id },
      create: {
        userId: authUser.id,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        headingFont,
        bodyFont,
        footerText,
        enabled,
      },
      update: {
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        headingFont,
        bodyFont,
        footerText,
        enabled,
      },
    });

    // Keep the derived custom theme in sync (Pro/Ultra, matching the custom
    // theme gate). Uses a light canvas with the brand colors as primary/accent
    // so text stays readable regardless of brand color choice.
    const canUseBrandTheme = ["pro", "ultra"].includes(
      (authUser.subscriptionPlan ?? "").toLowerCase(),
    );
    let brandThemeId: string | null = null;
    if (canUseBrandTheme) {
      const dark = isColorDark(primaryColor);
      const custom = {
        background: "#ffffff",
        backgroundAlt: "#f8fafc",
        text: "#334155",
        heading: dark ? primaryColor : "#0f172a",
        primary: primaryColor,
        accent: accentColor ?? secondaryColor ?? primaryColor,
      };
      const colors = { mode: "custom", palette: null, custom };
      const fonts = { heading: headingFont ?? "Inter", body: bodyFont ?? "Inter" };
      const designElements = { cardStyle: "rounded", logoUrl, backgroundImageUrl: null };

      const existing = await db.theme.findFirst({
        where: { userId: authUser.id, name: BRAND_THEME_NAME },
        select: { id: true },
      });
      if (existing) {
        await db.theme.update({
          where: { id: existing.id },
          data: { colors, fonts, designElements },
        });
        brandThemeId = existing.id;
      } else {
        const created = await db.theme.create({
          data: {
            name: BRAND_THEME_NAME,
            colors,
            fonts,
            designElements,
            isDefault: false,
            userId: authUser.id,
          },
        });
        brandThemeId = created.id;
      }
      serverCache.invalidate(`themes-${authUser.id}`);
    }

    return NextResponse.json({ kit, brandThemeId, canUseBrandTheme });
  } catch (error) {
    console.error("Error saving brand kit:", error);
    return NextResponse.json({ error: "Failed to save brand kit" }, { status: 500 });
  }
}
