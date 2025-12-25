// Mega Prize Mall Brand Colors
export const brandColors = {
  primary: '#7C2C78', // Deep Purple
  secondary: '#EAB75F', // Gold
  accent: '#A43875', // Pink
  dark: '#2E297D', // Navy Blue
  light: '#F8F9FA', // Light Gray
  white: '#FFFFFF',
  black: '#171717',
}

// Tailwind color extension
export const tailwindColors = {
  primary: {
    DEFAULT: brandColors.primary,
    foreground: brandColors.white,
  },
  secondary: {
    DEFAULT: brandColors.secondary,
    foreground: brandColors.black,
  },
  accent: {
    DEFAULT: brandColors.accent,
    foreground: brandColors.white,
  },
  dark: {
    DEFAULT: brandColors.dark,
    foreground: brandColors.white,
  },
}