import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/design';

/** Floating emoji particle around the robot */
function Particle({ emoji, x, y, delay }: { emoji: string; x: number; y: number; delay: number }) {
  const ty = useSharedValue(0);
  const op = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(-14, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0,   { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    ));
    op.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 400 }),
        withTiming(0, { duration: 800 }),
      ), -1, false,
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { top: y, left: x }, style]}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </Animated.View>
  );
}

export default function RobotMascot({ size = 100 }: { size?: number }) {
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0,   { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );
  }, []);

  const robotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const s = size;
  const W = s * 2.2;
  const H = s * 2;

  return (
    <View style={{ width: W, height: H, alignItems: 'center', justifyContent: 'center' }}>
      {/* Particles */}
      <Particle emoji="❤️" x={W * 0.05} y={H * 0.42} delay={0} />
      <Particle emoji="⭐" x={W * 0.72} y={H * 0.28} delay={700} />
      <Particle emoji="✨" x={W * 0.6}  y={H * 0.62} delay={1400} />

      {/* Robot */}
      <Animated.View style={[{ alignItems: 'center' }, robotStyle]}>
        {/* Background glow blob */}
        <View style={{
          position: 'absolute',
          width: s * 1.1, height: s * 1.1,
          borderRadius: s * 0.55,
          backgroundColor: '#EEF2FF',
          top: s * 0.15,
        }} />

        {/* Antenna stick */}
        <View style={{ width: s * 0.055, height: s * 0.22, backgroundColor: COLORS.primary, borderRadius: 4 }} />

        {/* Antenna ball — amber */}
        <View style={{
          width: s * 0.13, height: s * 0.13, borderRadius: s * 0.065,
          backgroundColor: '#F59E0B',
          marginTop: -s * 0.015,
          shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4,
        }} />

        {/* Head */}
        <View style={{
          width: s * 0.9, height: s * 0.75,
          borderRadius: s * 0.22,
          backgroundColor: COLORS.primary,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 4,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.45,
          shadowRadius: 18,
          elevation: 12,
        }}>
          {/* Ear nubs */}
          <View style={{
            position: 'absolute', left: -s * 0.05,
            width: s * 0.08, height: s * 0.18, borderRadius: s * 0.04,
            backgroundColor: COLORS.primaryDark, top: '32%',
          }} />
          <View style={{
            position: 'absolute', right: -s * 0.05,
            width: s * 0.08, height: s * 0.18, borderRadius: s * 0.04,
            backgroundColor: COLORS.primaryDark, top: '32%',
          }} />

          {/* Eyes */}
          <View style={{ flexDirection: 'row', gap: s * 0.1 }}>
            {[0, 1].map(i => (
              <View key={i} style={{
                width: s * 0.24, height: s * 0.24, borderRadius: s * 0.12,
                backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
              }}>
                <View style={{
                  width: s * 0.11, height: s * 0.11, borderRadius: s * 0.055,
                  backgroundColor: '#1A3FCC',
                }} />
              </View>
            ))}
          </View>

          {/* Smile */}
          <View style={{
            width: s * 0.32, height: s * 0.055, borderRadius: s * 0.028,
            backgroundColor: 'rgba(255,255,255,0.85)',
          }} />

          {/* Speaker dots */}
          <View style={{ flexDirection: 'row', gap: s * 0.04 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={{
                width: s * 0.045, height: s * 0.045, borderRadius: s * 0.0225,
                backgroundColor: 'rgba(255,255,255,0.4)',
              }} />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
