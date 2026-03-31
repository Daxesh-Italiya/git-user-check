/**
 * Theme Context & Provider
 * Manages dark theme and provides useTheme hook for consuming components
 */

import React, { createContext, useContext, useEffect } from "react";
import { getTheme, generateCSSVariables } from "../theme/tokens";

const ThemeContext = createContext(null);

/**
 * ThemeProvider Component
 * Wraps the app and applies dark theme
 */
export function ThemeProvider({ children }) {
  const mode = "dark";

  // Apply CSS variables on mount
  useEffect(() => {
    const theme = getTheme();
    const cssVars = generateCSSVariables(theme);

    // Apply CSS variables to root
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set root class for Ant Design theme
    root.classList.add("theme-dark");
  }, []);

  const value = {
    mode,
    theme: getTheme(),
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
