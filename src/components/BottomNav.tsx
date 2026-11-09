import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { CalendarIcon, HomeIcon, IconProps, UserIcon } from './Icons';
import { PressableScale } from './PressableScale';

export type Tab = 'home' | 'calendar' | 'profile';

type Item = {
  key: Tab;
  label: string;
  Icon: React.ComponentType<IconProps>;
};

const ITEMS: Item[] = [
  { key: 'home', label: 'Início', Icon: HomeIcon },
  { key: 'calendar', label: 'Calendário', Icon: CalendarIcon },
  { key: 'profile', label: 'Perfil', Icon: UserIcon },
];

const GAP = 4;

type Props = {
  active: Tab;
  bottomInset: number;
  onChange: (tab: Tab) => void;
};

export function BottomNav({ active, bottomInset, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const activeIndex = Math.max(
    0,
    ITEMS.findIndex((item) => item.key === active)
  );
  const pillWidth = width > GAP * (ITEMS.length - 1) ? (width - GAP * (ITEMS.length - 1)) / ITEMS.length : 0;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: activeIndex * (pillWidth + GAP),
      speed: 18,
      bounciness: 7,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, pillWidth, slide]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View pointerEvents="box-none" style={[styles.container, { paddingBottom: Math.max(bottomInset, 8) }]}>
      <View style={styles.inner} onLayout={handleLayout}>
        {pillWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              { width: pillWidth, transform: [{ translateX: slide }] },
            ]}
          />
        ) : null}
        {ITEMS.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <PressableScale
              key={key}
              style={styles.button}
              onPress={() => onChange(key)}
              activeScale={0.94}
              overlayRadius={13}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
            >
              <Icon size={22} color={isActive ? colors.blue : colors.navInactive} strokeWidth={1.8} />
              <Text style={[styles.label, { color: isActive ? colors.blue : colors.navInactive }]}>
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(9, 17, 25, 0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(185, 218, 238, 0.1)',
    paddingTop: 8,
    paddingHorizontal: 14,
    zIndex: 20,
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    gap: GAP,
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 13,
    backgroundColor: 'rgba(114, 208, 250, 0.09)',
  },
  button: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 13,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
