"use client";

import { useState } from "react";
import ThemesStickyHeader from "./ThemesStickyHeader";
import ThemesContent from "./ThemesContent";
import CustomThemeCreator from "./CustomThemeCreator";

interface ThemeData {
  id: string;
  name: string;
  colors: any;
  fonts: any;
  designElements?: any;
  isDefault: boolean;
}

interface ThemesPageClientProps {
  initialThemes: ThemeData[];
}

export default function ThemesPageClient({ initialThemes }: ThemesPageClientProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [themes, setThemes] = useState(initialThemes);

  const handleSaveTheme = async (themeData: any) => {
    try {
      const response = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(themeData),
      });

      if (!response.ok) {
        throw new Error("Failed to create theme");
      }

      const data = await response.json();
      setThemes(prev => [data.theme, ...prev]);
      setShowCreator(false);
    } catch (error) {
      console.error("Error saving theme:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 h-full">
      {/* Sticky Header Section */}
      <ThemesStickyHeader onCreateClick={() => setShowCreator(true)} />

      {/* Themes Content */}
      <ThemesContent initialThemes={themes} />

      {/* Custom Theme Creator Modal */}
      <CustomThemeCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onSave={handleSaveTheme}
      />
    </div>
  );
}
