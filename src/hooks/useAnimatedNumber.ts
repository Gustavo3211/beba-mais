import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

export function useAnimatedNumber(value: number, duration = 650): number {
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const id = anim.addListener(({ value: current }) => setDisplay(Math.round(current)));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    anim.stopAnimation();
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, duration, value]);

  return display;
}
