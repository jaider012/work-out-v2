import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'hero' | 'h1' | 'h2' | 'body' | 'caption' | 'small' | 'button' | 'link' | 'eyebrow';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color, fontFamily: Typography.fontFamily.system },
        type === 'default' ? styles.default : undefined,
        type === 'hero' ? styles.hero : undefined,
        type === 'h1' ? styles.h1 : undefined,
        type === 'h2' ? styles.h2 : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'small' ? styles.small : undefined,
        type === 'button' ? styles.button : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'eyebrow' ? styles.eyebrow : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.hierarchy.body.fontSize,
    lineHeight: Typography.hierarchy.body.lineHeight,
    fontWeight: Typography.hierarchy.body.fontWeight,
  },
  hero: {
    fontSize: Typography.hierarchy.hero.fontSize,
    lineHeight: Typography.hierarchy.hero.lineHeight,
    fontWeight: Typography.hierarchy.hero.fontWeight,
    letterSpacing: Typography.hierarchy.hero.letterSpacing,
  },
  h1: {
    fontSize: Typography.hierarchy.h1.fontSize,
    lineHeight: Typography.hierarchy.h1.lineHeight,
    fontWeight: Typography.hierarchy.h1.fontWeight,
  },
  h2: {
    fontSize: Typography.hierarchy.h2.fontSize,
    lineHeight: Typography.hierarchy.h2.lineHeight,
    fontWeight: Typography.hierarchy.h2.fontWeight,
  },
  body: {
    fontSize: Typography.hierarchy.body.fontSize,
    lineHeight: Typography.hierarchy.body.lineHeight,
    fontWeight: Typography.hierarchy.body.fontWeight,
  },
  caption: {
    fontSize: Typography.hierarchy.caption.fontSize,
    lineHeight: Typography.hierarchy.caption.lineHeight,
    fontWeight: Typography.hierarchy.caption.fontWeight,
  },
  small: {
    fontSize: Typography.hierarchy.small.fontSize,
    lineHeight: Typography.hierarchy.small.lineHeight,
    fontWeight: Typography.hierarchy.small.fontWeight,
  },
  button: {
    fontSize: Typography.ui.button.fontSize,
    lineHeight: Typography.ui.button.lineHeight,
    fontWeight: Typography.ui.button.fontWeight,
  },
  link: {
    fontSize: Typography.hierarchy.body.fontSize,
    lineHeight: Typography.hierarchy.body.lineHeight,
    fontWeight: Typography.hierarchy.body.fontWeight,
    color: '#4A90E2',
  },
  eyebrow: {
    fontSize: Typography.hierarchy.caption.fontSize,
    lineHeight: Typography.hierarchy.caption.lineHeight,
    fontWeight: Typography.hierarchy.caption.fontWeight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: Colors.neutral.textSecondary,
  },
});
