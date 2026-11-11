import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Linking, Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/design';
import { RESOURCES } from '../../data/resources';

export default function ResourcesScreen() {
  async function openLink(url: string) {
    const ok = await Linking.canOpenURL(url);
    if (ok) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot open link', url);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resources</Text>
        <Text style={styles.headerSubtitle}>Helpful links for your academic journey</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {RESOURCES.map((cat) => (
          <View key={cat.category} style={styles.section}>
            <Text style={styles.sectionTitle}>{cat.category}</Text>
            {cat.items.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.linkCard}
                onPress={() => openLink(item.url)}
                activeOpacity={0.8}
              >
                <View style={styles.linkIcon}>
                  <Text style={styles.linkIconText}>🔗</Text>
                </View>
                <View style={styles.linkInfo}>
                  <Text style={styles.linkName}>{item.name}</Text>
                  <Text style={styles.linkUrl} numberOfLines={1}>{item.url}</Text>
                </View>
                <Text style={styles.linkChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ℹ️ CareerTrack is not affiliated with any of these institutions. Links open in your default browser.
          </Text>
        </View>
      </ScrollView>
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
  headerSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  content: { padding: SPACING.lg, paddingBottom: 100, gap: SPACING.lg },
  section: { gap: SPACING.sm },
  sectionTitle: {
    fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.textSecondary,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4,
  },
  linkCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'center',
    gap: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  linkIcon: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  linkIconText: { fontSize: 18 },
  linkInfo: { flex: 1 },
  linkName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  linkUrl: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  linkChevron: { fontSize: FONT_SIZE.xl, color: COLORS.textMuted },
  disclaimer: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  disclaimerText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, lineHeight: 20 },
});
