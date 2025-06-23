/**
 * Layout System - Based on Modern Fitness App UI Design System
 * Consistent spacing, border radius, and layout patterns
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  pill: 999,
  circle: 50,
};

export const Layout = {
  // Touch targets
  touchTarget: {
    minimum: 44,
  },
  
  // Screen padding
  screen: {
    horizontal: 16,
    vertical: 24,
  },
  
  // Card dimensions
  card: {
    padding: 16,
    spacing: 16,
    borderRadius: BorderRadius.medium,
  },
  
  // Button dimensions
  button: {
    height: {
      small: 40,
      medium: 50,
      large: 56,
    },
    padding: {
      horizontal: 24,
      vertical: 12,
    },
    borderRadius: BorderRadius.pill,
  },
  
  // Input dimensions
  input: {
    height: 50,
    padding: {
      horizontal: 16,
      vertical: 12,
    },
    borderRadius: BorderRadius.small,
  },
  
  // Tab bar
  tabBar: {
    height: 80,
    iconSize: 24,
    labelHeight: 12,
  },
  
  // Header
  header: {
    height: 44,
    padding: 16,
  },
  
  // List items
  listItem: {
    height: 56,
    padding: {
      horizontal: 16,
      vertical: 16,
    },
  },
}; 