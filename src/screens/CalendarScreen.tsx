import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { PressableScale } from '../components/PressableScale';
import {
  compactVolume,
  dateFromKey,
  dateKey,
  dayTotal,
  allDayTotals,
  longDate,
  monthStart,
  monthTitle,
  numberFormat,
  todayKey,
} from '../logic';
import { colors } from '../theme';
import { AppState } from '../types';

type Status = 'above' | 'below' | 'average' | 'none';

type DayCell = {
  key: string;
  day: number;
  isFuture: boolean;
  hasRecord: boolean;
  amount: number;
  status: Status;
  volume: string;
};

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const DOT_COLORS: Record<Status, string> = {
  above: colors.good,
  below: colors.low,
  average: colors.average,
  none: 'transparent',
};

export function CalendarScreen({ state }: { state: AppState }) {
  const [viewedMonth, setViewedMonth] = useState(monthStart);
  const [selectedKey, setSelectedKey] = useState(() => todayKey());

  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const first = new Date(year, month, 1, 12);
  const last = new Date(year, month + 1, 0, 12);
  const today = todayKey();
  const currentMonth = monthStart();
  const nextDisabled =
    viewedMonth.getFullYear() === currentMonth.getFullYear() &&
    viewedMonth.getMonth() === currentMonth.getMonth();

  const { entries, average, weeks } = useMemo(() => {
    const totals = allDayTotals(state.records);
    const monthEntries = [...totals.entries()].filter(([key]) => {
      const date = dateFromKey(key);
      return date.getFullYear() === year && date.getMonth() === month && key <= today;
    });
    const monthAverage = monthEntries.length
      ? monthEntries.reduce((sum, entry) => sum + entry[1], 0) / monthEntries.length
      : 0;

    const cells: (DayCell | null)[] = [];
    for (let blank = 0; blank < first.getDay(); blank += 1) cells.push(null);
    for (let day = 1; day <= last.getDate(); day += 1) {
      const key = dateKey(new Date(year, month, day, 12));
      const isFuture = key > today;
      const hasRecord = totals.has(key) && !isFuture;
      const amount = totals.get(key) ?? 0;
      let status: Status = 'none';
      if (hasRecord && monthAverage > 0) {
        const difference = (amount - monthAverage) / monthAverage;
        status = difference > 0.05 ? 'above' : difference < -0.05 ? 'below' : 'average';
      }
      cells.push({
        key,
        day,
        isFuture,
        hasRecord,
        amount,
        status,
        volume: hasRecord ? compactVolume(amount) : '',
      });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const builtWeeks: (DayCell | null)[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      builtWeeks.push(cells.slice(index, index + 7));
    }
    return { entries: monthEntries, average: monthAverage, weeks: builtWeeks };
  }, [state.records, year, month, today]);

  const monthSum = entries.reduce((total, entry) => total + entry[1], 0);

  const selectedDate = dateFromKey(selectedKey);
  const selectedAmount = dayTotal(state.records, selectedKey);
  const hasSelectedRecords = state.records.some((record) => record.date === selectedKey);
  let comparison = 'Sem registro';
  if (hasSelectedRecords && average > 0) {
    const difference = (selectedAmount - average) / average;
    comparison =
      difference > 0.05 ? 'Acima da média' : difference < -0.05 ? 'Abaixo da média' : 'Na média';
  }

  const changeMonth = (offset: number) => {
    const next = new Date(year, month + offset, 1, 12);
    setViewedMonth(next);
    const now = new Date();
    const daysInNext = new Date(next.getFullYear(), next.getMonth() + 1, 0, 12).getDate();
    setSelectedKey(
      dateKey(
        new Date(
          next.getFullYear(),
          next.getMonth(),
          Math.min(now.getDate(), daysInNext),
          12
        )
      )
    );
  };

  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>Calendário</Text>
      </View>

      <View style={styles.monthSwitch}>
        <Text style={styles.monthTitle}>{monthTitle(viewedMonth)}</Text>
        <View style={styles.monthArrows}>
          <PressableScale
            style={styles.arrowButton}
            onPress={() => changeMonth(-1)}
            activeScale={0.9}
            overlayRadius={13}
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
          >
            <ChevronLeftIcon />
          </PressableScale>
          <PressableScale
            style={[styles.arrowButton, nextDisabled && styles.arrowDisabled]}
            onPress={() => changeMonth(1)}
            disabled={nextDisabled}
            activeScale={0.9}
            overlayRadius={13}
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
          >
            <ChevronRightIcon />
          </PressableScale>
        </View>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((weekday) => (
            <View key={weekday} style={styles.weekdayCell}>
              <Text style={styles.weekday}>{weekday}</Text>
            </View>
          ))}
        </View>
        <View style={styles.weeks}>
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.week}>
              {week.map((cell, cellIndex) =>
                cell ? (
                  <PressableScale
                    key={cell.key}
                    disabled={cell.isFuture}
                    onPress={() => setSelectedKey(cell.key)}
                    activeScale={0.9}
                    overlayRadius={11}
                    style={[
                      styles.dayCell,
                      cell.isFuture && styles.dayCellDisabled,
                      selectedKey === cell.key && styles.dayCellSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${cell.day}${
                      cell.hasRecord ? `, ${numberFormat(cell.amount)} ml` : ', sem registro'
                    }`}
                  >
                    <Text style={styles.dayNum}>{cell.day}</Text>
                    <Text style={styles.dayVolume} numberOfLines={1}>
                      {cell.volume}
                    </Text>
                    <View
                      style={[
                        styles.dayDot,
                        {
                          backgroundColor: cell.hasRecord
                            ? DOT_COLORS[cell.status]
                            : 'transparent',
                        },
                        cell.hasRecord && cell.status === 'above' ? styles.dayDotGlow : null,
                      ]}
                    />
                  </PressableScale>
                ) : (
                  <View key={`blank-${weekIndex}-${cellIndex}`} style={styles.dayBlank} />
                )
              )}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          {[
            { status: 'above' as Status, label: 'Acima' },
            { status: 'below' as Status, label: 'Abaixo' },
            { status: 'average' as Status, label: 'Na média' },
          ].map((item) => (
            <View key={item.status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: DOT_COLORS[item.status] }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Média diária</Text>
          <Text style={styles.summaryValue}>
            {average ? `${numberFormat(average)} ml` : '—'}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total no mês</Text>
          <Text style={styles.summaryValue}>
            {entries.length ? `${numberFormat(monthSum)} ml` : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.selectedDay}>
        <Text style={styles.selectedDate}>{longDate(selectedDate)}</Text>
        <Text style={styles.selectedAmount}>
          {hasSelectedRecords ? `${numberFormat(selectedAmount)} ml` : '0 ml'}
        </Text>
        <Text style={styles.selectedComparison}>{comparison}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    marginBottom: 17,
  },
  title: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  monthSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 5,
    marginBottom: 17,
  },
  monthTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    flexShrink: 1,
  },
  monthArrows: {
    flexDirection: 'row',
    gap: 7,
  },
  arrowButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  arrowDisabled: {
    opacity: 0.28,
  },
  calendarCard: {
    paddingVertical: 15,
    paddingHorizontal: 11,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 5,
  },
  weekdayCell: {
    flex: 1,
    minHeight: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: {
    color: '#b4c5d0',
    fontSize: 11,
    fontWeight: '800',
  },
  weeks: {
    gap: 5,
  },
  week: {
    flexDirection: 'row',
    gap: 5,
  },
  dayCell: {
    flex: 1,
    minHeight: 63,
    paddingTop: 5,
    paddingBottom: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.surface2,
  },
  dayCellDisabled: {
    opacity: 0.27,
  },
  dayCellSelected: {
    borderColor: colors.blue,
    backgroundColor: '#1d3a4b',
  },
  dayBlank: {
    flex: 1,
    minHeight: 63,
  },
  dayNum: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  dayVolume: {
    maxWidth: '100%',
    color: '#a9bbc7',
    fontSize: 10,
    fontWeight: '600',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayDotGlow: {
    shadowColor: colors.good,
    shadowOpacity: 0.35,
    shadowRadius: 4.5,
    shadowOffset: { width: 0, height: 0 },
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    columnGap: 16,
    paddingTop: 15,
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    color: colors.muted,
    fontSize: 12,
  },
  summary: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  summaryValue: {
    marginTop: 7,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  selectedDay: {
    marginTop: 12,
    padding: 16,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  selectedDate: {
    color: colors.muted,
    fontSize: 13,
  },
  selectedAmount: {
    marginTop: 6,
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  selectedComparison: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
});
