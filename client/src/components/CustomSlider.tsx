import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import { COLORS } from '../constants/design';

interface CustomSliderProps {
  minimumValue: number;
  maximumValue: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: object;
}

export default function CustomSlider({
  minimumValue,
  maximumValue,
  step = 1,
  value,
  onValueChange,
  minimumTrackTintColor = COLORS.primary,
  maximumTrackTintColor = COLORS.border,
  thumbTintColor = COLORS.primary,
  style,
}: CustomSliderProps) {
  const trackWidth = useRef(0);

  const pct = (value - minimumValue) / (maximumValue - minimumValue);

  function valueFromX(x: number): number {
    const clamped = Math.max(0, Math.min(x, trackWidth.current));
    const raw = minimumValue + (clamped / trackWidth.current) * (maximumValue - minimumValue);
    const stepped = Math.round(raw / step) * step;
    return Math.max(minimumValue, Math.min(maximumValue, stepped));
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX;
        onValueChange(valueFromX(x));
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        onValueChange(valueFromX(x));
      },
    })
  ).current;

  function onLayout(e: LayoutChangeEvent) {
    trackWidth.current = e.nativeEvent.layout.width;
  }

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers} onLayout={onLayout}>
      {/* Track */}
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
        <View style={[styles.filled, { width: `${pct * 100}%`, backgroundColor: minimumTrackTintColor }]} />
      </View>
      {/* Thumb */}
      <View
        style={[
          styles.thumb,
          { left: `${pct * 100}%`, backgroundColor: thumbTintColor },
        ]}
      />
    </View>
  );
}

const THUMB_SIZE = 24;

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: THUMB_SIZE / 2,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  filled: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    marginLeft: -THUMB_SIZE / 2,
    top: (44 - THUMB_SIZE) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
