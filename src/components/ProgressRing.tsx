import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { numberFormat } from '../logic';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function mixHex(from: string, to: string, amount: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const channel = (start: number, end: number) =>
    Math.round(start + (end - start) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}

type Props = {
  progress: number;
  total: number;
};

export function ProgressRing({ progress, total }: Props) {
  const { width } = useWindowDimensions();
  const size = Math.min(198, Math.max(150, Math.min(width, 480) * 0.62));
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const displayTotal = useAnimatedNumber(total);
  const displayProgress = useAnimatedNumber(clamped);

  // O anel começa num azul profundo e vai clareando conforme a meta se aproxima.
  const tint = Math.min(1, Math.max(0, displayProgress / 100));
  const ringStart = mixHex('#2d7192', '#a6e8ff', tint);
  const ringEnd = mixHex('#1f5873', '#5ac9f4', tint);
  const glowColor = mixHex('#1d5d7b', '#3fb6ec', tint);
  const glowStrength = 0.35 + tint * 0.65;

  const progressAnim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clamped,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, progressAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  // O box-shadow do HTML (0 12px 42px rgba(37,152,204,.13)) vira um halo radial,
  // que funciona igual no iOS e no Android.
  const glowSize = size + 72;
  const glowCenter = glowSize / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg
        width={glowSize}
        height={glowSize}
        style={{ position: 'absolute', left: (size - glowSize) / 2, top: (size - glowSize) / 2 }}
      >
        <Defs>
          <RadialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0.5" stopColor={glowColor} stopOpacity={0.18 * glowStrength} />
            <Stop offset="0.72" stopColor={glowColor} stopOpacity={0.08 * glowStrength} />
            <Stop offset="1" stopColor={glowColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={glowCenter} cy={glowCenter + 12} r={glowCenter - 2} fill="url(#ringGlow)" />
      </Svg>

      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={ringStart} />
            <Stop offset="1" stopColor={ringEnd} />
          </LinearGradient>
          <RadialGradient id="ringCore" cx="45%" cy="30%" r="72%">
            <Stop offset="0" stopColor="#172f3d" />
            <Stop offset="0.72" stopColor="#0d1a24" />
          </RadialGradient>
        </Defs>

        {/* box-shadow: 0 0 0 1px rgba(114,208,250,.13) */}
        <Circle
          cx={center}
          cy={center}
          r={center - 0.5}
          stroke="rgba(114, 208, 250, 0.13)"
          strokeWidth={1}
          fill="none"
        />

        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />

        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset as unknown as number}
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* ::before inset 11px — radial-gradient(circle at 45% 30%, #172f3d, #0d1a24 72%) */}
        <Circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 2}
          fill="url(#ringCore)"
          stroke="rgba(255, 255, 255, 0.035)"
          strokeWidth={1}
        />
      </Svg>

      <View style={styles.content} pointerEvents="none">
        <Text style={styles.total}>{numberFormat(displayTotal)}</Text>
        <Text style={styles.unit}>ml</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    gap: 3,
  },
  total: {
    color: colors.text,
    fontSize: 43,
    lineHeight: 44,
    fontWeight: '900',
    letterSpacing: -2.8,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
