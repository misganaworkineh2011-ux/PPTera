import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import BrandKitClient, { type BrandKitData } from "./BrandKitClient";

export const metadata = {
  title: "Brand Kit | PPTera",
  description: "Set your brand once — every presentation comes out on-brand.",
};

export default async function BrandKitPage() {
  const user = await requireAuth();
  const kit = await db.brandKit.findUnique({ where: { userId: user.id } });
  const canUseBrandTheme = ["pro", "ultra"].includes(
    (user.subscriptionPlan ?? "").toLowerCase(),
  );

  const initialKit: BrandKitData | null = kit
    ? {
        logoUrl: kit.logoUrl,
        primaryColor: kit.primaryColor,
        secondaryColor: kit.secondaryColor,
        accentColor: kit.accentColor,
        headingFont: kit.headingFont,
        bodyFont: kit.bodyFont,
        footerText: kit.footerText,
        enabled: kit.enabled,
      }
    : null;

  return <BrandKitClient initialKit={initialKit} canUseBrandTheme={canUseBrandTheme} />;
}
