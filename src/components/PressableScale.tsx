import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  pressedOverlay?: string | null;
  overlayRadius?: number;
  children?: React.ReactNode;
};

export function PressableScale({
  style,
  activeScale = 0.97,
  pressedOverlay = 'rgba(0, 0, 0, 0.18)',
  overlayRadius = 16,
  onPress,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const shade = useRef(new Animated.Value(0)).current;

  const animateTo = (toValue: number, bounciness: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 35,
      bounciness,
    }).start();
  };

  const animateShade = (toValue: number) => {
    Animated.timing(shade, {
      toValue,
      duration: toValue ? 90 : 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...rest}
      onPress={onPress}
      onPressIn={(event) => {
        animateTo(activeScale, 0);
        animateShade(1);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1, 5);
        animateShade(0);
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }] }] as unknown as StyleProp<ViewStyle>}
    >
      {children}
      {pressedOverlay ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: pressedOverlay,
              borderRadius: overlayRadius,
              opacity: shade,
            },
          ]}
        />
      ) : null}
    </AnimatedPressable>
  );
}
