import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import ThemesPageClient from "./ThemesPageClient";

export default async function ThemesPage() {
  const authUser = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: authUser.id },
    include: {
      themes: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!user) {
    return null;
  }

  // Transform themes for client component
  const themes = user.themes.map(t => ({
    id: t.id,
    name: t.name,
    colors: t.colors as any,
    fonts: t.fonts as any,
    designElements: t.designElements as any,
    isDefault: t.isDefault,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 h-full">
      <ThemesPageClient initialThemes={themes} />
    </div>
  );
}
