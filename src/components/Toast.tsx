import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export type ToastState = { message: string; id: number } | null;

type Props = {
  toast: ToastState;
  bottomInset: number;
  onHide: () => void;
};

export function Toast({ toast, bottomInset, onHide }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) onHide();
        }
      );
    }, 2200);
    return () => clearTimeout(timer);
  }, [toast?.id, anim, onHide]);

  if (!toast) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { bottom: bottomInset + 87 }]}
      accessibilityLiveRegion="polite"
    >
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: anim,
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            ],
          },
        ]}
      >
        <Text style={styles.text}>{toast.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 15,
    zIndex: 80,
  },
  toast: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(114, 208, 250, 0.25)',
    backgroundColor: '#17384a',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
});
