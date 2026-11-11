import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/design';
import { useAuth } from '../../context/AuthContext';
import { apiPost } from '../../services/api';
import { User } from '../../types';
import { Toast, ToastVariant } from '../../components/Toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE  = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/;

function pwStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw)        return { level: 0, label: '',         color: COLORS.border };
  if (pw.length < 6)  return { level: 1, label: 'Too short', color: '#EF4444' };
  if (pw.length < 8)  return { level: 2, label: 'Weak',      color: '#F59E0B' };
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { level: 4, label: 'Strong', color: '#10B981' };
  return { level: 3, label: 'Fair', color: '#3B82F6' };
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [focused, setFocused]         = useState<string | null>(null);

  const [nameErr, setNameErr]   = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwErr, setPwErr]       = useState('');

  const [toast, setToast] = useState<{ visible: boolean; variant: ToastVariant; title: string; desc?: string }>({
    visible: false, variant: 'error', title: '',
  });

  function showToast(variant: ToastVariant, title: string, desc?: string) {
    setToast({ visible: true, variant, title, desc });
  }

  function validateName(v: string) {
    if (!v.trim())            { setNameErr('Full name is required'); return false; }
    if (!NAME_RE.test(v.trim())) { setNameErr('Only letters, spaces and hyphens'); return false; }
    if (v.trim().length < 2)  { setNameErr('Name is too short'); return false; }
    setNameErr(''); return true;
  }
  function validateEmail(v: string) {
    if (!v)               { setEmailErr('Email is required'); return false; }
    if (!EMAIL_RE.test(v)) { setEmailErr('Enter a valid email address'); return false; }
    setEmailErr(''); return true;
  }
  function validatePw(v: string) {
    if (!v)         { setPwErr('Password is required'); return false; }
    if (v.length < 6) { setPwErr('At least 6 characters required'); return false; }
    setPwErr(''); return true;
  }

  async function handleRegister() {
    const ok = [validateName(displayName), validateEmail(email), validatePw(password)].every(Boolean);
    if (!ok) return;
    setLoading(true);
    try {
      const res = await apiPost<{ token: string; user: User }>('/api/auth/register', {
        display_name: displayName.trim(),
        email: email.toLowerCase().trim(),
        password,
      });
      await signIn(res.token, res.user);
      router.replace('/onboarding');
    } catch (e: unknown) {
      showToast('error', 'Sign Up Failed', e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const strength = pwStrength(password);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Toast
        visible={toast.visible}
        variant={toast.variant}
        title={toast.title}
        description={toast.desc}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <FontAwesome5 name="chart-bar" size={18} color="#fff" />
            </View>
            <Text style={styles.logoText}>CareerTrack</Text>
          </Animated.View>

          {/* Heading */}
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Discover your best-fit academic strand</Text>
          </Animated.View>

          {/* Name */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, focused === 'name' && styles.inputFocused, !!nameErr && styles.inputErr]}
              value={displayName}
              onChangeText={v => {
                // Only letters, spaces, hyphens, apostrophes
                const sanitized = v.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'\-]/g, '');
                setDisplayName(sanitized);
                if (nameErr) validateName(sanitized);
              }}
              onFocus={() => setFocused('name')}
              onBlur={() => { setFocused(null); validateName(displayName); }}
              placeholder="Juan dela Cruz"
              placeholderTextColor={COLORS.textMuted}
              autoComplete="name"
            />
            {!!nameErr && <Text style={styles.errText}>{nameErr}</Text>}
          </Animated.View>

          {/* Email */}
          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, focused === 'email' && styles.inputFocused, !!emailErr && styles.inputErr]}
              value={email}
              onChangeText={v => {
                // Only valid email characters
                const sanitized = v.replace(/[^a-zA-Z0-9@._+\-]/g, '');
                setEmail(sanitized);
                if (emailErr) validateEmail(sanitized);
              }}
              onFocus={() => setFocused('email')}
              onBlur={() => { setFocused(null); validateEmail(email); }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="you@email.com"
              placeholderTextColor={COLORS.textMuted}
              autoComplete="email"
            />
            {!!emailErr && <Text style={styles.errText}>{emailErr}</Text>}
          </Animated.View>

          {/* Password */}
          <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.pwWrap}>
              <TextInput
                style={[styles.input, styles.pwInput, focused === 'pw' && styles.inputFocused, !!pwErr && styles.inputErr]}
                value={password}
                onChangeText={v => { setPassword(v); if (pwErr) validatePw(v); }}
                onFocus={() => setFocused('pw')}
                onBlur={() => { setFocused(null); validatePw(password); }}
                secureTextEntry={!showPw}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.textMuted}
                autoComplete="new-password"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(p => !p)}>
                              <FontAwesome5
                name={showPw ? 'eye-slash' : 'eye'}
                size={16}
                color={COLORS.textMuted}
              />
              </TouchableOpacity>
            </View>
            {!!pwErr && <Text style={styles.errText}>{pwErr}</Text>}

            {/* Strength bar */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3, 4].map(n => (
                  <View
                    key={n}
                    style={[styles.strengthSeg, { backgroundColor: n <= strength.level ? strength.color : COLORS.border }]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}
          </Animated.View>

          {/* Submit */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Create Account</Text>
              }
            </TouchableOpacity>
          </Animated.View>

          {/* Sign in link */}
          <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 72, paddingBottom: SPACING.xl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  logoIcon: {
    width: 42, height: 42, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  logoIconText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.sm },
  logoText: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.primary },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  field: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    fontSize: FONT_SIZE.md, color: COLORS.text, backgroundColor: '#FAFAFA',
  },
  inputFocused: { borderColor: COLORS.primary, backgroundColor: '#fff', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 2 },
  inputErr: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errText: { fontSize: 12, color: '#EF4444', marginTop: 4, marginLeft: 2 },
  pwWrap: { position: 'relative' },
  pwInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', padding: 4 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  strengthSeg: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '600', marginLeft: 4, width: 58 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: 16, alignItems: 'center', marginTop: SPACING.sm,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  loginText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
  loginLink: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '700' },
});
