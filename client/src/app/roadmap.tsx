import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/design';
import { CAREER_PATHS } from '../data/careerPaths';
import { StrandKey } from '../types';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

function Expandable({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  }
  return (
    <View style={exp.card}>
      <TouchableOpacity style={exp.header} onPress={toggle} activeOpacity={0.8}>
        <Text style={exp.title}>{title}</Text>
        <Text style={exp.chevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View style={exp.body}>{children}</View>}
    </View>
  );
}

const exp = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, flex: 1 },
  chevron: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  body: { padding: SPACING.md, paddingTop: 0 },
});

export default function RoadmapScreen() {
  const router = useRouter();
  const { strand } = useLocalSearchParams<{ strand: string }>();
  const cp = CAREER_PATHS[strand as StrandKey];

  if (!cp) return null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.hero, { backgroundColor: cp.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.heroIcon}>{cp.icon}</Text>
        <Text style={styles.heroStrand}>{cp.strand}</Text>
        <Text style={styles.heroFull}>{cp.fullName}</Text>
        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeNum}>{cp.degrees.length}</Text>
            <Text style={styles.badgeLabel}>Degree Paths</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeNum}>{cp.careers.length}</Text>
            <Text style={styles.badgeLabel}>Career Paths</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Expandable title="📖 What Is This Strand?">
          <Text style={styles.bodyText}>{cp.description}</Text>
        </Expandable>
        <Expandable title="🎓 Recommended College Degrees">
          {cp.degrees.map((d) => (
            <View key={d} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: cp.color }]} />
              <Text style={styles.bulletText}>{d}</Text>
            </View>
          ))}
        </Expandable>
        <Expandable title="💼 Career Opportunities">
          <View style={styles.careersGrid}>
            {cp.careers.map((c) => (
              <View key={c} style={[styles.chip, { borderColor: cp.color }]}>
                <Text style={[styles.chipText, { color: cp.color }]}>{c}</Text>
              </View>
            ))}
          </View>
        </Expandable>
        <Expandable title="🇵🇭 Local Demand in the Philippines">
          <Text style={styles.bodyText}>{cp.localDemand}</Text>
        </Expandable>
        <TouchableOpacity
          style={[styles.resourcesBtn, { backgroundColor: cp.color }]}
          onPress={() => router.push('/(tabs)/resources')}
          activeOpacity={0.85}
        >
          <Text style={styles.resourcesBtnText}>Explore Resources →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  hero: { paddingTop: 52, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg, alignItems: 'center' },
  backBtn: {
    position: 'absolute', top: 52, left: SPACING.lg,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: FONT_SIZE.xl, color: COLORS.white, lineHeight: 28 },
  heroIcon: { fontSize: 56, marginBottom: SPACING.sm },
  heroStrand: { fontSize: 40, fontWeight: '900', color: COLORS.white, letterSpacing: -1 },
  heroFull: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4, marginBottom: SPACING.lg },
  badgesRow: { flexDirection: 'row', gap: SPACING.md },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, alignItems: 'center' },
  badgeNum: { fontSize: FONT_SIZE.xl, fontWeight: '900', color: COLORS.white },
  badgeLabel: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.8)' },
  content: { padding: SPACING.lg, paddingBottom: 60 },
  bodyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, lineHeight: 24 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletText: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text },
  careersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6 },
  chipText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  resourcesBtn: { borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.md },
  resourcesBtnText: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: '700' },
});
