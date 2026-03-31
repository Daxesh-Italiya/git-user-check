/**
 * Design Tokens System
 * Centralized color palettes, spacing, typography, and shadows for both light and dark themes
 */

const baseTokens = {
  // Spacing Scale (4px base)
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
    "3xl": "48px",
  },

  // Typography
  typography: {
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "32px",
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.2",
      normal: "1.5",
      relaxed: "1.75",
    },
  },

  // Border Radius
  borderRadius: {
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },

  // Shadows
  shadow: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },

  // Z-Index
  zIndex: {
    dropdown: "1000",
    sticky: "1020",
    fixed: "1030",
    backdrop: "1040",
    modal: "1060",
    tooltip: "1070",
  },

  // Transitions
  transition: {
    fast: "150ms ease-in-out",
    base: "250ms ease-in-out",
    slow: "350ms ease-in-out",
  },
};

// Light Theme Colors
export const lightTheme = {
  ...baseTokens,
  colors: {
    // Primary & Accent
    primary: "#35b729",
    primaryHover: "#52c41a",
    primaryActive: "#237a1b",
    primaryBg: "#e6f9e6",
    primaryBorder: "#91e691",

    // Secondary (Auth/Destructive)
    danger: "#ff4d4f",
    dangerBg: "#ffebe9",
    dangerBorder: "#ffccc7",

    // Success
    success: "#52c41a",
    successBg: "#f6ffed",
    successBorder: "#b7eb8f",

    // Warning
    warning: "#faad14",
    warningBg: "#fffbe6",
    warningBorder: "#ffd591",

    // Info
    info: "#13c2c2",
    infoBg: "#e6fffb",
    infoBorder: "#87e8de",

    // Neutrals
    background: "#ffffff",
    surface: "#fafafa",
    surfaceHover: "#f5f5f5",
    border: "#d9d9d9",
    borderLight: "#f0f0f0",
    text: "#000000d9",
    textSecondary: "#00000073",
    textTertiary: "#00000045",
    textInverse: "#ffffff",
    disabled: "#00000025",

    // Backgrounds
    bgPrimary: "#ffffff",
    bgSecondary: "#fafafa",
    bgTertiary: "#f5f5f5",

    // Organization Tags
    orgTag: "#722ed1",
    orgTagBg: "#f9f0ff",
    personalTag: "#35b729",
    personalTagBg: "#e6f9e6",

    // Permission Colors
    admin: "#ff4d4f",
    maintain: "#faad14",
    push: "#35b729",
    triage: "#13c2c2",
    pull: "#52c41a",

    // Permission Backgrounds
    adminBg: "#ffebe9",
    maintainBg: "#fffbe6",
    pushBg: "#e6f9e6",
    triageBg: "#e6fffb",
    pullBg: "#f6ffed",

    // Visibility
    public: "#52c41a",
    private: "#ff4d4f",
    internal: "#faad14",
  },
};

// Dark Theme Colors
export const darkTheme = {
  ...baseTokens,
  colors: {
    // Primary & Accent (vibrant for dark mode)
    primary: "#35b729",
    primaryHover: "#52c41a",
    primaryActive: "#237a1b",
    primaryBg: "#162312",
    primaryBorder: "#274916",

    // Secondary (Destructive)
    danger: "#ff7875",
    dangerBg: "#2f1515",
    dangerBorder: "#58181c",

    // Success
    success: "#95de64",
    successBg: "#162312",
    successBorder: "#274916",

    // Warning
    warning: "#ffc53d",
    warningBg: "#2b2111",
    warningBorder: "#594214",

    // Info
    info: "#5cdbd3",
    infoBg: "#112a2f",
    infoBorder: "#174d4a",

    // Neutrals
    background: "#141414",
    surface: "#1f1f1f",
    surfaceHover: "#262626",
    border: "#434343",
    borderLight: "#303030",
    text: "#ffffffd9",
    textSecondary: "#ffffff73",
    textTertiary: "#ffffff45",
    textInverse: "#000000d9",
    disabled: "#ffffff25",

    // Backgrounds
    bgPrimary: "#141414",
    bgSecondary: "#1f1f1f",
    bgTertiary: "#262626",

    // Organization Tags
    orgTag: "#b37feb",
    orgTagBg: "#1f0e3d",
    personalTag: "#35b729",
    personalTagBg: "#162312",

    // Permission Colors
    admin: "#ff7875",
    maintain: "#ffc53d",
    push: "#35b729",
    triage: "#5cdbd3",
    pull: "#95de64",

    // Permission Backgrounds
    adminBg: "#2f1515",
    maintainBg: "#2b2111",
    pushBg: "#162312",
    triageBg: "#112a2f",
    pullBg: "#162312",

    // Visibility
    public: "#95de64",
    private: "#ff7875",
    internal: "#ffc53d",
  },
};

/**
 * Get theme object (always returns dark theme)
 * @returns {Object} Dark theme object with colors and design tokens
 */
export const getTheme = () => {
  return darkTheme;
};

/**
 * Generate CSS custom properties from theme object
 * @param {Object} theme - Theme object
 * @returns {Object} CSS custom properties as key-value pairs
 */
export const generateCSSVariables = (theme) => {
  const vars = {};

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--color-${key}`] = value;
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });

  // Typography
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    vars[`--font-size-${key}`] = value;
  });

  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    vars[`--font-weight-${key}`] = value;
  });

  // Border Radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = value;
  });

  // Shadows
  Object.entries(theme.shadow).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value;
  });

  // Transitions
  Object.entries(theme.transition).forEach(([key, value]) => {
    vars[`--transition-${key}`] = value;
  });

  return vars;
};
