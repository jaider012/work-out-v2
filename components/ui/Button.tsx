import { Colors } from '@/constants/Colors';
import { BorderRadius, Layout } from '@/constants/Layout';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { ThemedText } from '../ThemedText';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  icon,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button, styles[size]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'destructive':
        baseStyle.push(styles.destructive);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextColor = () => {
    if (disabled) return Colors.neutral.textTertiary;
    
    switch (variant) {
      case 'primary':
        return Colors.neutral.lightBackground;
      case 'secondary':
        return Colors.neutral.textPrimary;
      case 'destructive':
        return Colors.neutral.lightBackground;
      case 'outline':
        return Colors.primary.accentBlue;
      default:
        return Colors.neutral.lightBackground;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={getTextColor()} 
            style={styles.loader}
          />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <ThemedText 
              type="button" 
              style={[styles.text, { color: getTextColor() }]}
            >
              {title}
            </ThemedText>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  loader: {
    marginHorizontal: 8,
  },
  
  // Sizes
  small: {
    height: Layout.button.height.small,
    paddingHorizontal: 16,
  },
  medium: {
    height: Layout.button.height.medium,
    paddingHorizontal: Layout.button.padding.horizontal,
  },
  large: {
    height: Layout.button.height.large,
    paddingHorizontal: 32,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary.accentBlue,
  },
  secondary: {
    backgroundColor: Colors.neutral.cardBackground,
  },
  destructive: {
    backgroundColor: Colors.semantic.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary.accentBlue,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
}); 