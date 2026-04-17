import React, { useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

/**
 * Lightweight, dependency-free sparkline rendered with a stack of <View />
 * bars. We avoid pulling in react-native-svg just for a single trend line.
 *
 * The values array is shown left → right (oldest → newest). Each bar is sized
 * relative to the min / max of the data so that the lowest value is a thin
 * pixel sliver and the highest reaches the full height.
 */
export function Sparkline({
  values,
  width = 240,
  height = 60,
  color = '#7C5CFF',
  strokeWidth = 4,
  style,
}: SparklineProps) {
  const bars = useMemo(() => {
    if (values.length === 0) return [];
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(1, max - min);
    return values.map((v) => Math.max(2, ((v - min) / range) * (height - 6) + 4));
  }, [values, height]);

  if (bars.length === 0) {
    return <View style={[{ width, height }, style]} />;
  }

  return (
    <View
      style={[
        {
          width,
          height,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 2,
        },
        style,
      ]}
    >
      {bars.map((barHeight, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: barHeight,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            opacity: 0.4 + (index / Math.max(1, bars.length - 1)) * 0.6,
          }}
        />
      ))}
    </View>
  );
}
