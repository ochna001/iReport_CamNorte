// Color palette extracted from design
export const Colors = {
  primary: '#4A5F5C',      // Dark teal/green (main color from image)
  secondary: '#8FA39E',    // Light teal/sage (lighter shade)
  accent: '#F4B89A',       // Peach/coral (accent color)
  background: '#E8F3F1',   // Very light teal (background)
  text: {
    primary: '#2C3E3B',    // Dark text
    secondary: '#6B7F7C',  // Medium text
    light: '#9BAAA7',      // Light text
  },
  white: '#FFFFFF',
  black: '#000000',
  
  // Semantic colors
  success: '#4A5F5C',
  error: '#DC2626',
  warning: '#F59E0B',
  info: '#2563EB',
  
  // Agency colors (can be customized)
  agencies: {
    pnp: '#4A5F5C',       // PNP - Primary teal
    bfp: '#DC2626',       // BFP - Red (fire)
    pdrrmo: '#F4B89A',    // PDRRMO - Peach/coral
  },
};

// Alternative color schemes for customization
export const ColorSchemes = {
  default: {
    primary: '#4A5F5C',
    secondary: '#8FA39E',
    accent: '#F4B89A',
    background: '#E8F3F1',
  },
  green: {
    primary: '#16a34a',
    secondary: '#22c55e',
    accent: '#86efac',
    background: '#f0fdf4',
  },
  blue: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#93c5fd',
    background: '#eff6ff',
  },
  purple: {
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    accent: '#c4b5fd',
    background: '#f5f3ff',
  },
};

export type ColorScheme = keyof typeof ColorSchemes;
