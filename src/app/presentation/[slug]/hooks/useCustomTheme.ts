import { useCallback, useEffect, useState } from "react";
import { getDefaultTheme, getThemeById, type Theme } from "~/lib/themes";
import {
  convertCustomThemeToTheme,
  getCustomThemeDbId,
  isCustomThemeId,
} from "~/lib/custom-theme-utils";
import { type CustomThemeData } from "../types";

interface UseCustomThemeOptions {
  contentTheme?: string | null;
  prefetchedCustomTheme?: CustomThemeData | null;
  defaultThemeId?: string;
}

interface UseCustomThemeResult {
  currentThemeId: string;
  customTheme: Theme | null;
  isLoadingTheme: boolean;
  handleThemeChange: (newThemeId: string, customThemeData?: CustomThemeData) => void;
  theme: Theme;
}

const customThemeCache = new Map<string, Theme>();

export function useCustomTheme({
  contentTheme,
  prefetchedCustomTheme,
  defaultThemeId = "elegant-noir",
}: UseCustomThemeOptions): UseCustomThemeResult {
  const [currentThemeId, setCurrentThemeId] = useState(
    contentTheme || defaultThemeId,
  );
  const [customTheme, setCustomTheme] = useState<Theme | null>(() => {
    if (prefetchedCustomTheme) {
      return convertCustomThemeToTheme(prefetchedCustomTheme);
    }
    return null;
  });
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  useEffect(() => {
    if (prefetchedCustomTheme) return;

    const themeId = contentTheme || "";
    if (isCustomThemeId(themeId)) {
      setIsLoadingTheme(true);
      const dbId = getCustomThemeDbId(themeId);
      fetch(`/api/themes/custom/${dbId}`)
        .then(res => res.json())
        .then(data => {
          if (data.theme) {
            setCustomTheme(convertCustomThemeToTheme(data.theme));
          }
        })
        .catch(err => console.error("Failed to load custom theme:", err))
        .finally(() => setIsLoadingTheme(false));
    }
  }, [contentTheme, currentThemeId, prefetchedCustomTheme]);

  const handleThemeChange = useCallback(
    (newThemeId: string, customThemeData?: CustomThemeData) => {
      setCurrentThemeId(newThemeId);
      if (newThemeId.startsWith("custom-") && customThemeData) {
        const converted = convertCustomThemeToTheme(customThemeData);
        customThemeCache.set(newThemeId, converted);
        setCustomTheme(converted);
        setIsLoadingTheme(false);
      } else if (newThemeId.startsWith("custom-")) {
        const cached = customThemeCache.get(newThemeId);
        if (cached) {
          setCustomTheme(cached);
          setIsLoadingTheme(false);
          return;
        }
        const dbId = newThemeId.replace("custom-", "");
        setIsLoadingTheme(true);
        fetch(`/api/themes/custom/${dbId}`)
          .then(res => res.json())
          .then(data => {
            if (data.theme) {
              const converted = convertCustomThemeToTheme(data.theme);
              customThemeCache.set(newThemeId, converted);
              setCustomTheme(converted);
            }
          })
          .catch(err => console.error("Failed to load custom theme:", err))
          .finally(() => setIsLoadingTheme(false));
      } else {
        setCustomTheme(null);
      }
    },
    [],
  );

  const theme =
    customTheme || getThemeById(currentThemeId || contentTheme || "") || getDefaultTheme();

  return {
    currentThemeId,
    customTheme,
    isLoadingTheme,
    handleThemeChange,
    theme,
  };
}
