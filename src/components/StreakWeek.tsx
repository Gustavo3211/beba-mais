import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, WaveIcon } from './Icons';
import { dateKey, dayTotal, getStreak, numberFormat, shiftDate } from '../logic';
import { colors } from '../theme';
import { WaterRecord } from '../types';

type Props = {
  records: WaterRecord[];
  goal: number;
};

const INITIALS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const GAP = 6;

export function StreakWeek({ records, goal }: Props) {
  const [rowWidth, setRowWidth] = useState(0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const todayKeyValue = dateKey(today);
  const todayIndex = (today.getDay() + 6) % 7; // segunda = 0
  const monday = shiftDate(today, -todayIndex);
  const yesterday = dayTotal(records, dateKey(shiftDate(today, -1)));
  const streak = getStreak(records, goal);

  const days = INITIALS.map((initial, index) => {
    const date = shiftDate(monday, index);
    const key = dateKey(date);
    const completed = dayTotal(records, key) >= goal;
    return {
      key,
      initial,
      day: date.getDate(),
      completed,
      isToday: key === todayKeyValue,
      isFuture: key > todayKeyValue,
    };
  });

  let head = days[todayIndex]?.completed ? todayIndex : todayIndex - 1;
  if (head < 0 || !days[head]?.completed) head = -1;
  let start = head;
  while (start > 0 && days[start - 1].completed) start -= 1;

  const cellWidth =
    rowWidth > 0 ? (rowWidth - GAP * (INITIALS.length - 1)) / INITIALS.length : 0;
  const capsuleLeft = cellWidth > 0 ? start * (cellWidth + GAP) : 0;
  const capsuleWidth =
    head >= 0 && cellWidth > 0 ? (head - start) * (cellWidth + GAP) + cellWidth : 0;

  const message =
    streak >= 2
      ? 'Você está no fluxo!'
      : streak === 1
        ? 'A corrente começou. Continue!'
        : 'Uma gota começa a corrente.';
  const waveColor = streak > 0 ? colors.aqua : colors.muted;

  const handleLayout = (event: LayoutChangeEvent) => {
    setRowWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>SEQUÊNCIA</Text>
        <Text style={styles.yesterday}>Ontem · {numberFormat(yesterday)} ml</Text>
      </View>

      <View style={styles.initialsRow}>
        {INITIALS.map((initial, index) => (
          <View key={`initial-${index}`} style={styles.initialCell}>
            <Text style={[styles.initial, index === todayIndex && styles.initialToday]}>
              {initial}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.daysRow} onLayout={handleLayout}>
        {capsuleWidth > 0 ? (
          <View style={[styles.capsule, { left: capsuleLeft, width: capsuleWidth }]} />
        ) : null}
        {days.map((day, index) => {
          const isHead = index === head;
          const inStreak = head >= 0 && index >= start && index <= head;

          return (
            <View key={day.key} style={styles.dayCell}>
              {isHead ? (
                <View style={styles.headMarker}>
                  <CheckIcon size={16} color={colors.aquaDark} strokeWidth={2.6} />
                </View>
              ) : inStreak ? (
                <View style={styles.checkMarker}>
                  <CheckIcon size={16} color={colors.aquaSoft} strokeWidth={2.4} />
                </View>
              ) : day.isToday ? (
                <View style={styles.todayMarker}>
                  <Text style={styles.dayNum}>{day.day}</Text>
                </View>
              ) : (
                <Text style={[styles.dayNum, day.isFuture && styles.dayNumFuture]}>
                  {day.day}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.divider} />

      <View style={styles.messageRow}>
        <WaveIcon size={17} color={waveColor} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  yesterday: {
    color: colors.muted,
    fontSize: 11.5,
    fontWeight: '600',
  },
  initialsRow: {
    flexDirection: 'row',
    gap: GAP,
    marginTop: 14,
    marginBottom: 3,
  },
  initialCell: {
    flex: 1,
    alignItems: 'center',
  },
  initial: {
    color: '#c7d8e2',
    fontSize: 10,
    fontWeight: '800',
  },
  initialToday: {
    color: colors.blue,
  },
  daysRow: {
    position: 'relative',
    flexDirection: 'row',
    gap: GAP,
    height: 42,
  },
  capsule: {
    position: 'absolute',
    top: 2,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.aquaCapsule,
  },
  dayCell: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.aqua,
    shadowColor: colors.aqua,
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  checkMarker: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(114, 208, 250, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  dayNumFuture: {
    color: colors.muted,
    opacity: 0.55,
  },
  divider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: colors.line,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  message: {
    color: '#d7e6ef',
    fontSize: 13,
    fontWeight: '700',
  },
});
