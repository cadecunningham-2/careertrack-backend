import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/design';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiDelete } from '../../services/api';
import { Assessment, FISResult } from '../../types';
import { CAREER_PATHS } from '../../data/careerPaths';

function SkeletonCard() {
  return (
    <View style={sk.card}>
      <View style={sk.line1} />
      <View style={sk.line2} />
      <View style={sk.bar} />
    </View>
  );
}
const sk = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  line1: { height: 14, width: '50%', backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 8 },
  line2: { height: 12, width: '30%', backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 12 },
  bar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4 },
});

export default function HistoryScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadHistory() {
    if (!token) return;
    try {
      const data = await apiGet<Assessment[]>('/api/assessments/mine', token);
      setAssessments(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { loadHistory(); }, [token]));

  function handleRefresh() {
    setRefreshing(true);
    loadHistory();
  }

  function handleDelete(id: string) {
    Alert.alert('Delete Assessment', 'Remove this assessment from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(`/api/assessments/${id}`, token ?? undefined);
            setAssessments((prev) => prev.filter((a) => a.id !== id));
          } catch {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  }

  function handleView(a: Assessment) {
    const recs: FISResult[] = a.recommendations;
    router.push({
      pathname: '/results',
      params: {
        results: JSON.stringify(recs),
        grades: JSON.stringify(a.grades),
        riasecScores: JSON.stringify(a.riasec_scores),
        aptitude: JSON.stringify(a.aptitude_ratings),
        readOnly: 'true',
      },
    });
  }

  function renderItem({ item }: { item: Assessment }) {
    const recs: FISResult[] = item.recommendations;
    const top = recs[0];
    const cp = top ? CAREER_PATHS[top.strand] : null;
    const date = new Date(item.created_at);

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleView(item)} activeOpacity={0.82}>
        <View style={styles.cardHeader}>
          <View style={[styles.strandIcon, { backgroundColor: cp?.color ?? COLORS.primary }]}>
            <Text style={styles.strandIconText}>{cp?.icon ?? '🎓'}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.topStrand}>{top?.strand ?? '—'}</Text>
            <Text style={styles.cardDate}>
              {date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
              {'  '}
              {date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <FontAwesome5 name="trash-alt" size={16} color={COLORS.error} />
            </TouchableOpacity>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${top?.degreeOfMatch ?? 0}%`, backgroundColor: cp?.color ?? COLORS.primary }]} />
        </View>
        <Text style={[styles.pct, { color: cp?.color ?? COLORS.primary }]}>{top?.degreeOfMatch ?? 0}% match</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assessment History</Text>
      </View>

      {loading ? (
        <View style={styles.content}>
          {[1, 2, 3].map((k) => <SkeletonCard key={k} />)}
        </View>
      ) : (
        <FlatList
          data={assessments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.content, assessments.length === 0 && styles.emptyContainer]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No assessments yet</Text>
              <Text style={styles.emptySubtitle}>Complete an assessment to see your results here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  strandIcon: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  strandIconText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  topStrand: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.text },
  cardDate: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  deleteBtn: { padding: 4 },
  barTrack: { height: 8, backgroundColor: COLORS.background, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: '100%', borderRadius: RADIUS.full },
  pct: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  empty: { alignItems: 'center', gap: SPACING.md },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
});
