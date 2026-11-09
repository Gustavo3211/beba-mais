import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { GoalCelebration } from '../components/GoalCelebration';
import { BottleIcon, CupIcon, DropletIcon, GlassIcon, PencilIcon, PlusIcon } from '../components/Icons';
import { PressableScale } from '../components/PressableScale';
import { ProgressRing } from '../components/ProgressRing';
import { StreakWeek } from '../components/StreakWeek';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { playGoalComplete } from '../sound';
import { dayRecords, dayTotal, longDate, numberFormat, timeFormat, todayKey } from '../logic';
import { colors } from '../theme';
import { AppState } from '../types';

type Props = {
  state: AppState;
  onAdd: (amount: number) => void;
  onUndo: () => void;
  onOpenSettings: () => void;
};

const QUICK_ADDS = [
  { amount: 100, Icon: CupIcon, iconSize: 20 },
  { amount: 150, Icon: GlassIcon, iconSize: 22 },
  { amount: 500, Icon: BottleIcon, iconSize: 24 },
];

export function HomeScreen({ state, onAdd, onUndo, onOpenSettings }: Props) {
  const today = todayKey();
  const total = dayTotal(state.records, today);
  const goal = state.settings.goal;
  const percent = Math.round((total / goal) * 100);
  const progress = Math.min(100, Math.max(0, (total / goal) * 100));
  const records = dayRecords(state.records, today);
  const displayGoal = useAnimatedNumber(goal);
  const displayPercent = useAnimatedNumber(percent);

  const barAnim = useRef(new Animated.Value(progress)).current;
  const previous = useRef({ total, goal });
  const pulse = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const [celebrateKey, setCelebrateKey] = useState(0);

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: progress,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [barAnim, progress]);

  useEffect(() => {
    const previousValues = previous.current;
    previous.current = { total, goal };
    if (total > previousValues.total && previousValues.total < goal && total >= goal) {
      setCelebrateKey((key) => key + 1);
    }
  }, [total, goal]);

  useEffect(() => {
    if (!celebrateKey) return;
    pulse.setValue(0);
    flash.setValue(0);
    const soundTimer = setTimeout(playGoalComplete, 140);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(pulse, {
          toValue: 0,
          speed: 8,
          bounciness: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 560, useNativeDriver: true }),
      ]),
    ]).start();
    return () => clearTimeout(soundTimer);
  }, [celebrateKey, pulse, flash]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <View>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.date}>{longDate(new Date())}</Text>
          <Text style={styles.title}>Seu consumo</Text>
        </View>
        <PressableScale
          style={styles.goalChip}
          onPress={onOpenSettings}
          activeScale={0.95}
          overlayRadius={14}
          accessibilityRole="button"
          accessibilityLabel="Editar meta diária"
          accessibilityHint="Abre o ajuste da meta e do tamanho do copo"
        >
          <View style={styles.goalChipTextWrap}>
            <Text style={styles.goalChipLabel}>META DIÁRIA</Text>
            <Text style={styles.goalChipValue}>{numberFormat(displayGoal)} ml</Text>
          </View>
          <PencilIcon size={15} />
        </PressableScale>
      </View>

      <LinearGradient
        colors={['#142631', '#101b25']}
        locations={[0, 0.7]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.87 }}
        style={styles.card}
      >
        <View style={styles.ringWrap}>
          <Animated.View style={{ transform: [{ scale: ringScale }] }}>
            <ProgressRing progress={progress} total={total} />
          </Animated.View>
          <GoalCelebration burstKey={celebrateKey} />
        </View>
        <View style={styles.goalLine}>
          <Text style={styles.goalLineText}>de </Text>
          <Text style={styles.goalLineStrong}>{numberFormat(displayGoal)} ml</Text>
        </View>
        <View style={styles.progressMeta}>
          <Text style={styles.progressMetaText}>Progresso</Text>
          <Text style={styles.progressPercent}>{displayPercent}%</Text>
        </View>
        <View style={styles.track}>
          <Animated.View style={[styles.fillWrap, { width: barWidth }]}>
            <LinearGradient
              colors={['#36a9e2', '#8cddff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fill}
            />
          </Animated.View>
        </View>
        <PressableScale
          onPress={() => onAdd(state.settings.defaultCup)}
          activeScale={0.98}
          overlayRadius={17}
          accessibilityRole="button"
          accessibilityLabel={`Adicionar ${state.settings.defaultCup} mililitros`}
        >
          <LinearGradient
            colors={['#8cddff', '#53bcef']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addMain}
          >
            <PlusIcon size={21} color={colors.blueDark} />
            <Text style={styles.addMainLabel}>{numberFormat(state.settings.defaultCup)} ml</Text>
          </LinearGradient>
        </PressableScale>
        <View style={styles.quickAdd}>
          {QUICK_ADDS.map(({ amount, Icon, iconSize }) => (
            <PressableScale
              key={amount}
              onPress={() => onAdd(amount)}
              activeScale={0.94}
              overlayRadius={14}
              accessibilityRole="button"
              accessibilityLabel={`Adicionar ${amount} mililitros`}
              style={styles.quickButton}
            >
              <Icon size={iconSize} color={colors.blue} />
              <Text style={styles.quickLabel}>+ {amount} ml</Text>
            </PressableScale>
          ))}
        </View>
        <Animated.View pointerEvents="none" style={[styles.cardFlash, { opacity: flash }]} />
      </LinearGradient>

      <StreakWeek records={state.records} goal={goal} />

      <View style={styles.records}>
        <View style={styles.sectionTitle}>
          <Text style={styles.h2}>Hoje</Text>
          {records.length > 0 ? (
            <PressableScale
              onPress={onUndo}
              activeScale={0.94}
              pressedOverlay={null}
              accessibilityRole="button"
              accessibilityLabel="Desfazer último registro"
              style={styles.textAction}
            >
              <Text style={styles.textActionLabel}>Desfazer</Text>
            </PressableScale>
          ) : null}
        </View>

        {records.length === 0 ? (
          <View style={styles.emptyRecords}>
            <Text style={styles.emptyText}>Nenhum registro</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {records.map((record) => (
              <View key={record.id} style={styles.recordRow}>
                <View style={styles.recordIcon}>
                  <DropletIcon size={19} />
                </View>
                <Text style={styles.recordTime}>{timeFormat(record.timestamp)}</Text>
                <Text style={styles.recordAmount}>+{numberFormat(record.amount)} ml</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 17,
  },
  headText: {
    flexShrink: 1,
  },
  date: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },
  title: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  goalChip: {
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 208, 250, 0.2)',
    backgroundColor: 'rgba(114, 208, 250, 0.09)',
  },
  goalChipTextWrap: {
    gap: 2,
  },
  goalChipLabel: {
    color: colors.muted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  goalChipValue: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  card: {
    paddingTop: 23,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  ringWrap: {
    alignItems: 'center',
    paddingTop: 2,
    paddingBottom: 13,
  },
  goalLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 17,
  },
  goalLineText: {
    color: colors.muted,
    fontSize: 14,
  },
  goalLineStrong: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 1,
  },
  progressMetaText: {
    color: colors.muted,
    fontSize: 13,
  },
  progressPercent: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.progressTrack,
    marginBottom: 18,
    overflow: 'hidden',
  },
  fillWrap: {
    height: '100%',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    borderRadius: 99,
  },
  addMain: {
    minHeight: 60,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#34a6dc',
    shadowOpacity: 0.19,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  addMainLabel: {
    color: '#062235',
    fontSize: 17,
    fontWeight: '800',
  },
  quickAdd: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 11,
  },
  quickButton: {
    flex: 1,
    minHeight: 64,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
  },
  quickLabel: {
    color: '#e0edf4',
    fontSize: 13,
    fontWeight: '700',
  },
  cardFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(140, 221, 255, 0.9)',
  },
  records: {
    marginTop: 24,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  h2: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  textAction: {
    minHeight: 42,
    paddingHorizontal: 7,
    justifyContent: 'center',
  },
  textActionLabel: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    gap: 8,
  },
  recordRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  recordIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(114, 208, 250, 0.1)',
  },
  recordTime: {
    color: colors.muted,
    fontSize: 13,
  },
  recordAmount: {
    marginLeft: 'auto',
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyRecords: {
    paddingVertical: 18,
    paddingHorizontal: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineDashed,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
});
