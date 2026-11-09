import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const PARTICLES = Array.from({ length: 18 }, (_, index) => {
  const angle = (index / 18) * Math.PI * 2 - Math.PI / 2;
  const distance = 58 + (index % 5) * 13;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 5 + (index % 3) * 3,
    color: ['#8cddff', '#72d0fa', '#53bcef', '#b5d9e9'][index % 4],
  };
});

type Props = {
  burstKey: number;
};

export function GoalCelebration({ burstKey }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!burstKey) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [burstKey, progress]);

  if (!burstKey) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {PARTICLES.map((particle, index) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.x],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.y],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.12, 0.7, 1],
          outputRange: [0, 1, 0.9, 0],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0.3, 1, 0.4],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                backgroundColor: particle.color,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    shadowColor: '#8cddff',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
