import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { CUP_MAX, CUP_MIN, GOAL_MAX, GOAL_MIN, numberFormat } from '../logic';
import { colors } from '../theme';
import { Settings } from '../types';
import { DropletIcon } from './Icons';
import { ModalSheet } from './ModalSheet';
import { PressableScale } from './PressableScale';

type Props = {
  visible: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => void;
};

const GOAL_STEP = 250;
const CUP_STEP = 50;
const GOAL_PRESETS = [1500, 2000, 2500, 3000];
const CUP_PRESETS = [200, 250, 300, 500];

export function SettingsModal({ visible, settings, onClose, onSave }: Props) {
  const [goal, setGoal] = useState(settings.goal);
  const [cup, setCup] = useState(settings.defaultCup);

  useEffect(() => {
    if (!visible) return;
    setGoal(settings.goal);
    setCup(settings.defaultCup);
  }, [visible, settings.goal, settings.defaultCup]);

  const displayGoal = useAnimatedNumber(goal, 220);
  const displayCup = useAnimatedNumber(cup, 220);
  const cups = Math.max(1, Math.ceil(goal / cup));

  const changeGoal = (value: number) => setGoal(Math.min(GOAL_MAX, Math.max(GOAL_MIN, value)));
  const changeCup = (value: number) => setCup(Math.min(CUP_MAX, Math.max(CUP_MIN, value)));

  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.eyebrow}>META DIÁRIA</Text>
          <Text style={styles.headTitle}>Quanto você quer beber?</Text>
        </View>
        <PressableScale
          style={styles.closeButton}
          onPress={onClose}
          activeScale={0.9}
          overlayRadius={13}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        >
          <Text style={styles.closeLabel}>×</Text>
        </PressableScale>
      </View>

      <Text style={styles.intro}>
        Ajuste sua meta e o tamanho do copo. O anel da tela inicial acompanha esses valores.
      </Text>

      <View style={styles.panel}>
        <View style={styles.panelHead}>
          <Text style={styles.panelLabel}>Meta por dia</Text>
          <Text style={styles.panelHint}>passo de {GOAL_STEP} ml</Text>
        </View>

        <View style={styles.stepperRow}>
          <PressableScale
            style={[styles.stepButton, goal <= GOAL_MIN && styles.stepDisabled]}
            onPress={() => changeGoal(goal - GOAL_STEP)}
            disabled={goal <= GOAL_MIN}
            activeScale={0.88}
            overlayRadius={16}
            accessibilityRole="button"
            accessibilityLabel={`Diminuir meta para ${numberFormat(Math.max(GOAL_MIN, goal - GOAL_STEP))} mililitros`}
          >
            <Text style={styles.stepSymbol}>−</Text>
          </PressableScale>

          <View style={styles.stepperValue}>
            <Text style={styles.bigValue}>
              {numberFormat(displayGoal)} <Text style={styles.bigUnit}>ml</Text>
            </Text>
          </View>

          <PressableScale
            style={[styles.stepButton, goal >= GOAL_MAX && styles.stepDisabled]}
            onPress={() => changeGoal(goal + GOAL_STEP)}
            disabled={goal >= GOAL_MAX}
            activeScale={0.88}
            overlayRadius={16}
            accessibilityRole="button"
            accessibilityLabel={`Aumentar meta para ${numberFormat(Math.min(GOAL_MAX, goal + GOAL_STEP))} mililitros`}
          >
            <Text style={styles.stepSymbol}>+</Text>
          </PressableScale>
        </View>

        <View style={styles.presets}>
          {GOAL_PRESETS.map((preset) => {
            const active = goal === preset;
            return (
              <PressableScale
                key={preset}
                style={[styles.preset, active && styles.presetActive]}
                onPress={() => changeGoal(preset)}
                activeScale={0.94}
                overlayRadius={11}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Meta de ${numberFormat(preset)} mililitros`}
              >
                <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                  {numberFormat(preset)}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHead}>
          <Text style={styles.panelLabel}>Tamanho do copo</Text>
          <Text style={styles.panelHint}>passo de {CUP_STEP} ml</Text>
        </View>

        <View style={styles.cupRow}>
          <PressableScale
            style={[styles.cupButton, cup <= CUP_MIN && styles.stepDisabled]}
            onPress={() => changeCup(cup - CUP_STEP)}
            disabled={cup <= CUP_MIN}
            activeScale={0.9}
            overlayRadius={13}
            accessibilityRole="button"
            accessibilityLabel={`Diminuir copo para ${Math.max(CUP_MIN, cup - CUP_STEP)} mililitros`}
          >
            <Text style={styles.cupSymbol}>−</Text>
          </PressableScale>

          <Text style={styles.cupValue}>{numberFormat(displayCup)} ml</Text>

          <PressableScale
            style={[styles.cupButton, cup >= CUP_MAX && styles.stepDisabled]}
            onPress={() => changeCup(cup + CUP_STEP)}
            disabled={cup >= CUP_MAX}
            activeScale={0.9}
            overlayRadius={13}
            accessibilityRole="button"
            accessibilityLabel={`Aumentar copo para ${Math.min(CUP_MAX, cup + CUP_STEP)} mililitros`}
          >
            <Text style={styles.cupSymbol}>+</Text>
          </PressableScale>
        </View>

        <View style={styles.presets}>
          {CUP_PRESETS.map((preset) => {
            const active = cup === preset;
            return (
              <PressableScale
                key={preset}
                style={[styles.preset, active && styles.presetActive]}
                onPress={() => changeCup(preset)}
                activeScale={0.94}
                overlayRadius={11}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Copo de ${preset} mililitros`}
              >
                <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                  {preset}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View style={styles.preview}>
        <DropletIcon size={17} />
        <Text style={styles.previewText}>
          ≈ <Text style={styles.previewStrong}>{cups} copos</Text> de {numberFormat(cup)} ml para
          bater a meta
        </Text>
      </View>

      <PressableScale
        onPress={() => onSave({ goal, defaultCup: cup })}
        style={styles.primaryButton}
        activeScale={0.98}
        overlayRadius={14}
        accessibilityRole="button"
        accessibilityLabel="Salvar meta"
      >
        <LinearGradient
          colors={['#8cddff', '#53bcef']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryGradient}
        >
          <Text style={styles.primaryLabel}>Salvar meta</Text>
        </LinearGradient>
      </PressableScale>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  headText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.blue,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  headTitle: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface2,
  },
  closeLabel: {
    color: colors.muted,
    fontSize: 23,
    lineHeight: 26,
  },
  intro: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  panel: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  panelLabel: {
    color: '#d6e5ed',
    fontSize: 14,
    fontWeight: '700',
  },
  panelHint: {
    color: colors.muted,
    fontSize: 11,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  stepButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface2,
  },
  stepDisabled: {
    opacity: 0.25,
  },
  stepSymbol: {
    color: colors.blue,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '500',
  },
  stepperValue: {
    flex: 1,
    alignItems: 'center',
  },
  bigValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.7,
    fontVariant: ['tabular-nums'],
  },
  bigUnit: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
  presets: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
  preset: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  presetActive: {
    borderColor: colors.blue,
    backgroundColor: 'rgba(114, 208, 250, 0.14)',
  },
  presetLabel: {
    color: '#c9dce7',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  presetLabelActive: {
    color: colors.blue,
  },
  cupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cupButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface2,
  },
  cupSymbol: {
    color: colors.blue,
    fontSize: 21,
    lineHeight: 25,
  },
  cupValue: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 208, 250, 0.14)',
    backgroundColor: 'rgba(114, 208, 250, 0.07)',
  },
  previewText: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  previewStrong: {
    color: colors.blue,
    fontWeight: '800',
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 14,
    shadowColor: '#34a6dc',
    shadowOpacity: 0.19,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryGradient: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  primaryLabel: {
    color: colors.blueDark,
    fontSize: 16,
    fontWeight: '800',
  },
});
