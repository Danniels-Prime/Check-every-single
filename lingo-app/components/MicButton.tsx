import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { C } from '../constants/theme';
import type { RecStatus } from '../hooks/useRecording';

interface Props {
  status: RecStatus;
  onPress: () => void;
}

export function MicButton({ status, onPress }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const live = status === 'live';

  useEffect(() => {
    if (live) {
      scale.value = withRepeat(
        withTiming(1.18, { duration: 900, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(0.6, { duration: 300 });
    }
  }, [live]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrap}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <View style={[styles.btn, live && styles.btnLive]}>
        <View style={[styles.icon, live && styles.iconStop]} />
      </View>
    </TouchableOpacity>
  );
}

const BTN = 76;
const RING = BTN + 28;

const styles = StyleSheet.create({
  wrap: {
    width: RING, height: RING,
    alignItems: 'center', justifyContent: 'center',
  },
  ring: {
    position:  'absolute',
    width:     RING, height: RING,
    borderRadius: RING / 2,
    borderWidth:  2,
    borderColor:  C.accent,
  },
  btn: {
    width: BTN, height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: C.accentDim,
    borderWidth:     2,
    borderColor:     C.accent,
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnLive: {
    backgroundColor: C.accent + '33',
    borderColor:     C.accent,
  },
  // mic silhouette (circle)
  icon: {
    width:        22, height: 22,
    borderRadius: 11,
    borderWidth:  2.5,
    borderColor:  C.accent,
  },
  iconStop: {
    borderRadius: 4,
    backgroundColor: C.error + '88',
    borderColor:     C.error,
  },
});
