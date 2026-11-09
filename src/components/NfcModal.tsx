import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { Device } from '../types';
import { CheckIcon, NfcIcon } from './Icons';
import { ModalSheet } from './ModalSheet';
import { PressableScale } from './PressableScale';

type Props = {
  visible: boolean;
  devices: Device[];
  onClose: () => void;
  onConnect: (code: string) => boolean;
};

const FOUND_CODE = 'BEBA-B700';

export function NfcModal({ visible, devices, onClose, onConnect }: Props) {
  const [phase, setPhase] = useState<'idle' | 'searching' | 'found' | 'connected'>('idle');
  const [status, setStatus] = useState('');
  const pulse = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) return;
    if (timer.current) clearTimeout(timer.current);
    pulse.setValue(0);
    setPhase('idle');
    setStatus('');
  }, [visible, pulse]);

  useEffect(() => {
    if (phase !== 'searching') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    timer.current = setTimeout(() => {
      setPhase('found');
      setStatus('Bebedouro encontrado');
    }, 2200);

    return () => {
      loop.stop();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase, pulse]);

  const startSearch = () => {
    setStatus('Aproxime o celular do bebedouro…');
    setPhase('searching');
  };

  const handleConnect = () => {
    if (onConnect(FOUND_CODE)) {
      setPhase('connected');
      setStatus('Bebedouro conectado.');
    } else {
      setStatus('Não foi possível conectar.');
    }
  };

  const handleClose = () => {
    if (timer.current) clearTimeout(timer.current);
    onClose();
  };

  const searching = phase === 'searching';

  return (
    <ModalSheet visible={visible} onClose={handleClose}>
      <View style={styles.head}>
        <Text style={styles.headTitle}>Conectar bebedouro</Text>
        <PressableScale
          style={styles.closeButton}
          onPress={handleClose}
          activeScale={0.9}
          overlayRadius={13}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        >
          <Text style={styles.closeLabel}>×</Text>
        </PressableScale>
      </View>

      <View style={styles.nfcBox}>
        <View style={styles.ring}>
          <Animated.View
            style={[
              styles.pulse,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.6] }) }],
              },
            ]}
          />
          <View style={styles.nfcCore}>
            <NfcIcon size={44} color={phase === 'connected' ? colors.aqua : colors.blue} />
          </View>
        </View>
        <Text style={styles.nfcText}>
          {phase === 'idle' && 'Ative o NFC para parear'}
          {searching && 'Procurando bebedouro…'}
          {phase === 'found' && 'Bebedouro próximo encontrado'}
          {phase === 'connected' && 'Pareado com sucesso'}
        </Text>
      </View>

      <Text style={styles.status} accessibilityLiveRegion="polite">
        {status}
      </Text>

      {phase === 'idle' || searching ? (
        <PressableScale
          style={[styles.primaryButton, searching && styles.primaryButtonDisabled]}
          onPress={startSearch}
          disabled={searching}
          activeScale={0.97}
          overlayRadius={14}
          accessibilityRole="button"
        >
          <Text style={styles.primaryLabel}>{searching ? 'NFC ativo…' : 'Ativar NFC'}</Text>
        </PressableScale>
      ) : null}

      {phase === 'found' ? (
        <PressableScale
          style={styles.primaryButton}
          onPress={handleConnect}
          activeScale={0.97}
          overlayRadius={14}
          accessibilityRole="button"
        >
          <Text style={styles.primaryLabel}>Conectar</Text>
        </PressableScale>
      ) : null}

      {phase === 'connected' ? (
        <View style={styles.connected}>
          <CheckIcon size={17} />
          <Text style={styles.connectedText}>{FOUND_CODE}</Text>
        </View>
      ) : null}

      {devices.length > 0 ? (
        <View style={styles.deviceList}>
          {devices.map((device) => (
            <View key={device.code} style={styles.deviceItem}>
              <NfcIcon size={16} color={colors.muted} />
              <Text style={styles.deviceCode}>{device.code}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  headTitle: {
    color: colors.text,
    fontSize: 21,
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
  nfcBox: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 17,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(114, 208, 250, 0.35)',
    backgroundColor: '#091720',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
    gap: 14,
  },
  ring: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.blue,
  },
  nfcCore: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#0d1e2a',
  },
  nfcText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  status: {
    minHeight: 19,
    marginBottom: 12,
    color: colors.muted,
    fontSize: 13,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.blue,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    color: colors.blueDark,
    fontSize: 16,
    fontWeight: '800',
  },
  connected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 208, 250, 0.4)',
    backgroundColor: 'rgba(114, 208, 250, 0.08)',
  },
  connectedText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deviceList: {
    gap: 8,
    marginTop: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface2,
  },
  deviceCode: {
    color: colors.text,
    fontSize: 14,
  },
});
