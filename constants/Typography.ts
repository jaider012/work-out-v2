/**
 * Typography System - Based on Modern Fitness App UI Design System
 * Uses SF Pro Display/Text font family with consistent hierarchy
 */

export const Typography = {
  fontFamily: {
    primary: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    secondary: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    system: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  
  hierarchy: {
    hero: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 38, // 1.2 ratio
      letterSpacing: -0.64, // -0.02em converted to px
    },
    h1: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 36, // 1.3 ratio
    },
    h2: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28, // 1.4 ratio
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24, // 1.5 ratio
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20, // 1.4 ratio
      opacity: 0.7,
    },
    small: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16, // 1.3 ratio
    },
  },
  
  // Additional text styles for specific UI elements
  ui: {
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: '500' as const,
      lineHeight: 12,
    },
    input: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    badge: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 14,
    },
  },
}; 