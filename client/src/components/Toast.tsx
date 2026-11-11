import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  variant?: ToastVariant;
  title: string;
  description?: string;
  onDismiss: () => void;
  duration?: number;
}

const CONFIG: Record<ToastVariant, {
  icon: string; iconBg: string; bg: string; border: string; titleColor: string; descColor: string;
}> = {
  success: { icon: '✓', iconBg: '#10B981', bg: '#F0FDF4', border: '#86EFAC', titleColor: '#14532D', descColor: '#166534' },
  error:   { icon: '✕', iconBg: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5', titleColor: '#7F1D1D', descColor: '#991B1B' },
  warning: { icon: '!', iconBg: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', titleColor: '#78350F', descColor: '#92400E' },
  info:    { icon: 'i', iconBg: '#3B82F6', bg: '#EFF6FF', border: '#93C5FD', titleColor: '#1E3A8A', descColor: '#1D4ED8' },
};

export function Toast({ visible, variant = 'info', title, description, onDismiss, duration = 3500 }: ToastProps) {
  const slideY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(dismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  function dismiss() {
    Animated.parallel([
      Animated.timing(slideY, { toValue: -120, duration: 260, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start(onDismiss);
  }

  if (!visible) return null;
  const c = CONFIG[variant];

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideY }], opacity, backgroundColor: c.bg, borderColor: c.border },
      ]}
    >
      <View style={[styles.iconRing, { backgroundColor: c.iconBg }]}>
        <Text style={styles.iconText}>{c.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: c.titleColor }]}>{title}</Text>
        {description ? <Text style={[styles.desc, { color: c.descColor }]}>{description}</Text> : null}
      </View>
      <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.closeX}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 56,
    left: 16, right: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 9999,
  },
  iconRing: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  body: { flex: 1 },
  title: { fontWeight: '700', fontSize: 14, lineHeight: 20 },
  desc: { fontSize: 12, lineHeight: 17, marginTop: 1 },
  closeX: { fontSize: 22, color: '#9CA3AF', lineHeight: 28 },
});
