// Mega Prize Mall Brand Colors
export const brandColors = {
  primary: '#011b54',
  primaryHover: '#022b82',
  primaryActive: '#00133d',
  secondary: '#FFFFFF',
  accent: '#032d8a',
  dark: '#011b54',
  light: '#F8FAFC',
  white: '#FFFFFF',
  black: '#0F172A',
};

// Tailwind color extension
export const tailwindColors = {
  primary: {
    DEFAULT: brandColors.primary,
    foreground: brandColors.white,
  },
  secondary: {
    DEFAULT: brandColors.secondary,
    foreground: brandColors.primary,
  },
  accent: {
    DEFAULT: brandColors.accent,
    foreground: brandColors.white,
  },
  dark: {
    DEFAULT: brandColors.dark,
    foreground: brandColors.white,
  },
};
