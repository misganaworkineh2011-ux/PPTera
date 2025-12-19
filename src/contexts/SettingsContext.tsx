"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  collaborationAlerts: boolean;
  setCollaborationAlerts: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [emailNotifications, setEmailNotificationsState] = useState(true);
  const [collaborationAlerts, setCollaborationAlertsState] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    let effectiveTheme: "light" | "dark" = "light";
    
    if (newTheme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effectiveTheme = newTheme;
    }
    
    setResolvedTheme(effectiveTheme);
    
    // Apply to document
    if (effectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    try {
      const savedTheme = localStorage.getItem("dashboard-theme") as Theme;
      const savedEmailNotifications = localStorage.getItem("email-notifications");
      const savedCollaborationAlerts = localStorage.getItem("collaboration-alerts");
      
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        applyTheme("system");
      }
      
      if (savedEmailNotifications !== null) {
        setEmailNotificationsState(savedEmailNotifications === "true");
      }
      
      if (savedCollaborationAlerts !== null) {
        setCollaborationAlertsState(savedCollaborationAlerts === "true");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fallback to defaults
      applyTheme("system");
    }
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("dashboard-theme", newTheme);
    applyTheme(newTheme);
  };

  const setEmailNotifications = (value: boolean) => {
    setEmailNotificationsState(value);
    localStorage.setItem("email-notifications", String(value));
  };

  const setCollaborationAlerts = (value: boolean) => {
    setCollaborationAlertsState(value);
    localStorage.setItem("collaboration-alerts", String(value));
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      setTheme,
      resolvedTheme,
      emailNotifications,
      setEmailNotifications,
      collaborationAlerts,
      setCollaborationAlerts,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
