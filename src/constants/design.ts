/**
 * Design System Constants
 * Professional design tokens for consistent UI across the app
 */

// ============================================
// COLORS - Extended palette based on existing theme
// ============================================
export const Colors = {
  // Primary colors
  primary: '#D9B699', // Gold/Beige accent
  primaryLight: '#E8C9A8',
  primaryDark: '#C9A080',
  primaryAlpha: 'rgba(217, 182, 153, 0.1)',
  primaryAlpha20: 'rgba(217, 182, 153, 0.2)',

  // Background colors
  bgBox: '#4A3F50', // Dark purple box
  bgBoxLight: '#5A4F60',
  bgBoxDark: '#2F2B3B',
  bgOverlay: 'rgba(47, 43, 59, 0.8)',
  bgOverlayLight: 'rgba(47, 43, 59, 0.5)',

  // Base colors
  white: '#FFFFFF',
  black: '#000000',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#8A8A8D',
  textMuted: '#6E6E73',

  // Status colors
  success: '#27C93F',
  error: '#FF453A',
  warning: '#FF9500',
  info: '#5AC8FA',

  // Border colors
  borderPrimary: '#D9B699',
  borderSecondary: 'rgba(217, 182, 153, 0.3)',
  borderMuted: 'rgba(255, 255, 255, 0.1)',
} as const;

// ============================================
// SPACING - Consistent spacing scale
// ============================================
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

// ============================================
// BORDER RADIUS - Consistent rounded corners
// ============================================
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999, // Fully rounded
} as const;

// ============================================
// SHADOWS - Elevation system
// ============================================
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#D9B699',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// ============================================
// TYPOGRAPHY - Font sizes and line heights
// ============================================
export const Typography = {
  // Display sizes
  display: {
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: 1.5,
  },
  // Heading sizes
  h1: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 1.2,
  },
  h2: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 1,
  },
  h3: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 0.8,
  },
  h4: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.6,
  },
  // Body sizes
  bodyLarge: {
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0.4,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  // Caption sizes
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  captionSmall: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
  },
} as const;

// ============================================
// ANIMATIONS - Timing constants
// ============================================
export const Animations = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const;

// ============================================
// OPACITY - Consistent opacity values
// ============================================
export const Opacity = {
  disabled: 0.4,
  inactive: 0.6,
  active: 0.8,
  full: 1,
} as const;

// ============================================
// Z-INDEX - Layering system
// ============================================
export const ZIndex = {
  base: 0,
  elevated: 10,
  dropdown: 100,
  modal: 200,
  toast: 300,
  tooltip: 400,
} as const;

// ============================================
// BUTTONS - Standardized button styles
// ============================================
export const Buttons = {
  primary: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  primaryText: {
    fontSize: 16,
    fontFamily: 'Aeonik-Regular', // Will be replaced with Fonts.aeonikRegular in components
    color: Colors.white,
  },
  disabled: {
    backgroundColor: '#a19a9aff',
    borderWidth: 0,
  },
  disabledText: {
    fontFamily: 'Aeonik-Bold', // Will be replaced with Fonts.aeonikBold in components
  },
} as const;
