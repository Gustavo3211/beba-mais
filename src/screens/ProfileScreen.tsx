import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

import { PressableScale } from '../components/PressableScale';
import {
  bestYearStreak,
  litresFormat,
  numberFormat,
  yearStats,
} from '../logic';
import { colors } from '../theme';
import { AppState } from '../types';

type Props = {
  state: AppState;
  onToast: (message: string) => void;
};

export function ProfileScreen({ state, onToast }: Props) {
  const stats = yearStats(state.records, state.settings.goal);
  const streak = bestYearStreak(state.records, state.settings.goal);
  const litres = litresFormat(stats.total);
  const year = new Date().getFullYear();
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);
  const [sharing, setSharing] = useState(false);
  const { width } = useWindowDimensions();
  const headlineSize = Math.min(36, Math.max(28, Math.min(width, 480) * 0.08));
  const headlineLineHeight = Math.round(headlineSize * 1.04);
  const headlineLetterSpacing = headlineSize * -0.05;

  const numbers = [
    { label: 'Total no ano', value: `${litres} L` },
    { label: 'Média por dia', value: `${numberFormat(stats.average)} ml` },
    { label: 'Melhor streak', value: `${streak} dias` },
    { label: 'Dias na meta', value: String(stats.goalDays) },
  ];

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    const plain = stats.total
      ? `VOCÊ BEBEU ${litres} LITROS. O AQUÁRIO PEDIU AUTÓGRAFO.`
      : 'SEU ANO AQUÁTICO COMEÇA COM O PRIMEIRO GOLE.';
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'BEBA+' });
      } else {
        await Share.share({ message: plain, title: 'BEBA+' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (!/cancel/i.test(message)) onToast('Não foi possível compartilhar.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>Meu perfil</Text>
      </View>

      <View ref={cardRef} collapsable={false} style={styles.shareCardWrap}>
        <LinearGradient
          colors={['#17445d', '#0c2637', '#091b29']}
          locations={[0, 0.68, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.57, y: 0.82 }}
          style={styles.shareCard}
        >
          {/* radial-gradient(circle at 95% 0%, rgba(105,210,255,.29), transparent 38%) */}
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="shareGlow" cx="95%" cy="0%" r="62%">
                <Stop offset="0" stopColor="#69d2ff" stopOpacity={0.29} />
                <Stop offset="0.38" stopColor="#69d2ff" stopOpacity={0.12} />
                <Stop offset="0.7" stopColor="#69d2ff" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#shareGlow)" />
          </Svg>

          {/* Círculo decorativo + os anéis de 24px e 52px de spread do box-shadow */}
          <View style={styles.shareOrb} />
          <View style={styles.shareOrbRing24} />
          <View style={styles.shareOrbRing52} />

          <View style={styles.shareBrand}>
            <Text style={styles.shareBrandText}>BEBA+</Text>
            <Text style={styles.shareBrandYear}>{year}</Text>
          </View>

          <Text
            style={[
              styles.shareHeadline,
              {
                fontSize: headlineSize,
                lineHeight: headlineLineHeight,
                letterSpacing: headlineLetterSpacing,
              },
            ]}
          >
            {stats.total > 0 ? (
              <>
                VOCÊ BEBEU <Text style={styles.shareHighlight}>{litres} LITROS.</Text> O AQUÁRIO
                PEDIU AUTÓGRAFO.
              </>
            ) : (
              'SEU ANO AQUÁTICO COMEÇA COM O PRIMEIRO GOLE.'
            )}
          </Text>

          <View style={styles.shareStats}>
            <View style={styles.shareStat}>
              <Text style={styles.shareStatValue}>{litres} L</Text>
              <Text style={styles.shareStatLabel}>Água bebida</Text>
            </View>
            <View style={styles.shareStat}>
              <Text style={styles.shareStatValue}>{streak}</Text>
              <Text style={styles.shareStatLabel}>Maior streak</Text>
            </View>
            <View style={styles.shareStat}>
              <Text style={styles.shareStatValue}>{stats.goalDays}</Text>
              <Text style={styles.shareStatLabel}>Dias na meta</Text>
            </View>
          </View>

        </LinearGradient>
      </View>

      {[numbers.slice(0, 2), numbers.slice(2)].map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={[styles.profileRow, { marginTop: rowIndex === 0 ? 13 : 10 }]}
        >
          {row.map((item) => (
            <View key={item.label} style={styles.profileNumber}>
              <Text style={styles.profileNumberLabel}>{item.label}</Text>
              <Text style={styles.profileNumberValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      ))}

      <PressableScale
        onPress={handleShare}
        disabled={sharing}
        activeScale={0.98}
        overlayRadius={16}
        accessibilityRole="button"
        accessibilityLabel="Compartilhar"
      >
        <LinearGradient
          colors={['#8cddff', '#53bcef']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.shareButton, sharing && styles.shareButtonBusy]}
        >
          <Text style={styles.shareButtonLabel}>
            {sharing ? 'Preparando imagem…' : 'Compartilhar'}
          </Text>
        </LinearGradient>
      </PressableScale>
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
  shareCardWrap: {
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(132, 214, 250, 0.25)',
    backgroundColor: '#0c2637',
  },
  shareCard: {
    minHeight: 390,
    paddingVertical: 23,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  shareOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    top: 45,
    right: -165,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(185, 232, 255, 0.15)',
  },
  shareOrbRing24: {
    position: 'absolute',
    width: 328,
    height: 328,
    top: 21,
    right: -189,
    borderRadius: 164,
    borderWidth: 1,
    borderColor: 'rgba(185, 232, 255, 0.025)',
  },
  shareOrbRing52: {
    position: 'absolute',
    width: 384,
    height: 384,
    top: -7,
    right: -217,
    borderRadius: 192,
    borderWidth: 1,
    borderColor: 'rgba(185, 232, 255, 0.02)',
  },
  shareBrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  shareBrandText: {
    color: '#b9eaff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.9,
  },
  shareBrandYear: {
    color: '#b9eaff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.9,
  },
  shareHeadline: {
    marginTop: 42,
    marginBottom: 28,
    color: '#f4fbff',
    fontWeight: '900',
  },
  shareHighlight: {
    color: '#7bd5ff',
  },
  shareStats: {
    flexDirection: 'row',
    gap: 7,
  },
  shareStat: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(189, 231, 250, 0.2)',
    backgroundColor: 'rgba(3, 22, 34, 0.37)',
  },
  shareStatValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  shareStatLabel: {
    marginTop: 5,
    color: '#b0cddd',
    fontSize: 10,
    lineHeight: 13,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileNumber: {
    flex: 1,
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  profileNumberLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  profileNumberValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  shareButton: {
    minHeight: 56,
    marginTop: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonBusy: {
    opacity: 0.7,
  },
  shareButtonLabel: {
    color: colors.blueDark,
    fontSize: 16,
    fontWeight: '800',
  },
});
