import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface MonthCalendarProps {
  month: Date;
  workoutsByDay: Map<string, number>;
  onPrev: () => void;
  onNext: () => void;
  onSelectDay?: (day: Date) => void;
  selectedDay?: Date | null;
}

export function MonthCalendar({
  month,
  workoutsByDay,
  onPrev,
  onNext,
  onSelectDay,
  selectedDay,
}: MonthCalendarProps) {
  const { cells, label } = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1);
    // Normalize so Monday is column 0.
    const firstCol = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const cells: ({ date: Date; count: number } | null)[] = [];
    for (let i = 0; i < firstCol; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, m, day);
      const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ date, count: workoutsByDay.get(key) ?? 0 });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const label = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return { cells, label };
  }, [month, workoutsByDay]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrev} hitSlop={10} testID="calendar-prev">
          <IconSymbol name="chevron.left" size={20} color={Colors.neutral.textPrimary} />
        </TouchableOpacity>
        <ThemedText type="body" style={styles.title}>
          {label}
        </ThemedText>
        <TouchableOpacity onPress={onNext} hitSlop={10} testID="calendar-next">
          <IconSymbol name="chevron.right" size={20} color={Colors.neutral.textPrimary} />
        </TouchableOpacity>
      </View>
      <View style={styles.dayRow}>
        {DAY_LABELS.map((d, idx) => (
          <ThemedText key={`${d}-${idx}`} type="caption" style={styles.dayLabel}>
            {d}
          </ThemedText>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell, idx) => {
          if (!cell) return <View key={`empty-${idx}`} style={styles.cell} />;
          const isToday = sameDay(cell.date, new Date());
          const isSelected = selectedDay ? sameDay(cell.date, selectedDay) : false;
          return (
            <TouchableOpacity
              key={cell.date.toISOString()}
              style={styles.cell}
              activeOpacity={0.7}
              onPress={() => onSelectDay?.(cell.date)}
            >
              <View
                style={[
                  styles.cellInner,
                  cell.count > 0 && styles.cellActive,
                  isToday && styles.cellToday,
                  isSelected && styles.cellSelected,
                ]}
              >
                <ThemedText
                  type="caption"
                  style={[
                    styles.cellText,
                    cell.count > 0 && { color: Colors.neutral.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {cell.date.getDate()}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  title: { color: Colors.neutral.textPrimary, fontWeight: '700' },
  dayRow: { flexDirection: 'row' },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  cellInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellActive: { backgroundColor: 'rgba(124,92,255,0.2)' },
  cellToday: { borderWidth: 1, borderColor: Colors.neutral.textPrimary },
  cellSelected: { backgroundColor: Colors.primary.accentViolet },
  cellText: { color: Colors.neutral.textPrimary },
});
