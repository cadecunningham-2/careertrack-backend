import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../constants/design';
import RobotMascot from '../components/RobotMascot';

const { width: SCREEN_W } = Dimensions.get('window');

interface OnboardingPage {
  title: string;
  subtitle: string;
}

const PAGES: OnboardingPage[] = [
  {
    title: 'Answer Questions',
    subtitle: "I'll ask about your grades, interests, and skills. It only takes ~5 minutes.",
  },
  {
    title: 'Get Matched',
    subtitle: 'My Fuzzy Logic engine ranks your best-fit strands — on-device, no internet needed.',
  },
  {
    title: 'Start Your Journey',
    subtitle: 'Your personalized academic strand recommendation is just a few questions away!',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  function goNext() {
    if (currentPage < PAGES.length - 1) {
      opacity.value = withTiming(0, { duration: 180 }, () => {
        runOnJS(setCurrentPage)(currentPage + 1);
        opacity.value = withTiming(1, { duration: 220 });
      });
    } else {
      router.replace('/(auth)/login');
    }
  }

  function skip() {
    router.replace('/(auth)/login');
  }

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const page = PAGES[currentPage];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>CareerTrack</Text>
        <TouchableOpacity onPress={skip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingTitle}>Hi there 👋</Text>
        <Text style={styles.greetingSubtitle}>Find your best-fit academic strand</Text>
      </View>

      {/* Page Content */}
      <Animated.View style={[styles.content, animStyle]}>
        <View style={styles.mascotRow}>
          <RobotMascot size={72} />
        </View>

        <Text style={styles.pageTitle}>{page.title}</Text>
        <Text style={styles.pageSubtitle}>{page.subtitle}</Text>
      </Animated.View>

      {/* Dots */}
      <View style={styles.dotsRow}>
        {PAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentPage && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={goNext} activeOpacity={0.85}>
        <Text style={styles.nextButtonText}>
          {currentPage < PAGES.length - 1 ? 'Next' : "Let's Begin →"}
        </Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        CareerTrack is a decision-support tool. Always consult your school guidance counselor.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  skip: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  greeting: {
    marginBottom: SPACING.xl,
  },
  greetingTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.xl,
  },
  mascotRow: {
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  pageSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
