/**
 * Theme Context & Provider
 * Manages theme state (light/dark) and provides useTheme hook for consuming components
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { getTheme, generateCSSVariables } from "../theme/tokens";

const ThemeContext = createContext(null);

/**
 * ThemeProvider Component
 * Wraps the app and manages theme state, persists preference to localStorage
 */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    // Check localStorage first, fallback to system preference, then light
    const savedMode = localStorage.getItem("app-theme-mode");
    if (savedMode) return savedMode;

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  // Update CSS variables and root element whenever theme changes
  useEffect(() => {
    const theme = getTheme(mode);
    const cssVars = generateCSSVariables(theme);

    // Apply CSS variables to root
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Update root class for Ant Design theme
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(`theme-${mode}`);

    // Save preference
    localStorage.setItem("app-theme-mode", mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = {
    mode,
    setMode,
    toggleTheme,
    theme: getTheme(mode),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @throws {Error} If used outside ThemeProvider
 * @returns {Object} Theme context with mode, theme object, and toggle function
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
