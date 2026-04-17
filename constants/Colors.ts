/**
 * Color palette inspired by the Hevy gym tracker app.
 * Hevy uses a dark-first design with a violet accent, near-black backgrounds
 * and elevated cards in dark grey. Values below mirror that aesthetic while
 * keeping the existing structure consumed across the app (primary / neutral /
 * semantic / theme buckets).
 */

export const Colors = {
  // Primary brand / accent colors (Hevy-style violet)
  primary: {
    vibrantOrange: '#FF6B35',
    gradientRed: '#FF4500',
    accentBlue: '#7C5CFF',
    accentViolet: '#7C5CFF',
    accentVioletPressed: '#6747E6',
    brightGreen: '#34C759',
  },

  // Neutral backgrounds and text
  neutral: {
    darkBackground: '#0E0E10',
    cardBackground: '#1C1C1F',
    elevatedBackground: '#26262B',
    border: '#2A2A2F',
    lightBackground: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A8',
    textTertiary: '#6B6B73',
  },

  // Semantic colors
  semantic: {
    success: '#34C759',
    warning: '#FFB020',
    error: '#FF3B30',
    info: '#7C5CFF',
    pr: '#FFB020', // personal record highlight
  },

  // Theme-aware tokens (light/dark) consumed by useThemeColor
  light: {
    text: '#0E0E10',
    background: '#FFFFFF',
    tint: '#7C5CFF',
    icon: '#6B6B73',
    tabIconDefault: '#A0A0A8',
    tabIconSelected: '#7C5CFF',
    card: '#F4F4F6',
    border: '#E5E5EA',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0E0E10',
    tint: '#7C5CFF',
    icon: '#A0A0A8',
    tabIconDefault: '#6B6B73',
    tabIconSelected: '#7C5CFF',
    card: '#1C1C1F',
    border: '#2A2A2F',
  },
};
