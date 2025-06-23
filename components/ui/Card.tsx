import { BorderRadius, Spacing } from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  variant?: 'default' | 'elevated';
}

export function Card({ 
  children, 
  style, 
  padding = 'md',
  variant = 'default' 
}: CardProps) {
  const backgroundColor = useThemeColor({}, 'card');
  
  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius: BorderRadius.medium,
    padding: Spacing[padding],
  };

  if (variant === 'elevated') {
    cardStyle.shadowColor = '#000';
    cardStyle.shadowOffset = {
      width: 0,
      height: 2,
    };
    cardStyle.shadowOpacity = 0.1;
    cardStyle.shadowRadius = 8;
    cardStyle.elevation = 4;
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
} 