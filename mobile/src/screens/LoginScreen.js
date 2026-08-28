import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { Brand } from '../components/Brand'

export function LoginScreen ({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = () => {
    if (email.trim() && password.trim()) {
      onLogin()
    } else {
      setError('Enter your email and password to continue.')
    }
  }

  const demo = () => {
    setEmail('sidpatil@gmail.com')
    setPassword('password123')
    setError('')
    onLogin()
  }

  return (
    <SafeAreaView style={styles.loginRoot}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=85&w=1200&auto=format&fit=crop'
            }}
            style={styles.welcomePanel}
            imageStyle={styles.welcomeImage}
          >
            <View style={styles.welcomeOverlay} />
            <Brand textColor='#FFFFFF' />

            <View style={styles.loginIntro}>
              <Text style={styles.eyebrow}>YOUR WEATHER, UNDERSTOOD</Text>
              <Text style={styles.loginTitle}>Your AI weather companion</Text>
              <Text style={styles.loginSubtitle}>
                Real-time forecasts, Doppler weather radar, smart alerts and
                personalized insights.
              </Text>
            </View>

            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>💬</Text>
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Chat Naturally</Text>
                  <Text style={styles.featureText}>
                    Ask anything about weather in natural language.
                  </Text>
                </View>
              </View>

              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>🗺️</Text>
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Doppler Weather Map</Text>
                  <Text style={styles.featureText}>
                    Interactive radar layers, storms and rainfall projections.
                  </Text>
                </View>
              </View>

              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>🔔</Text>
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Instant Alerts</Text>
                  <Text style={styles.featureText}>
                    Get notified about severe weather and precipitation.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.quote}>
              <Text style={styles.quoteMark}>“</Text>
              <Text style={styles.quoteText}>
                The best time to plant a tree was 20 years ago. The second best
                time is now.
              </Text>
              <Text style={styles.quoteCredit}>— Weather wisdom</Text>
            </View>
          </ImageBackground>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formHint}>
              Sign in to access your AI weather console.
            </Text>

            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <TextInput
              autoCapitalize='none'
              keyboardType='email-address'
              onChangeText={v => {
                setEmail(v)
                setError('')
              }}
              placeholder='you@example.com'
              placeholderTextColor='#94A3B8'
              style={styles.input}
              value={email}
            />

            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showPassword}>
                  {showPassword ? 'HIDE' : 'SHOW'}
                </Text>
              </Pressable>
            </View>
            <TextInput
              autoCapitalize='none'
              onChangeText={v => {
                setPassword(v)
                setError('')
              }}
              placeholder='Enter your password'
              placeholderTextColor='#94A3B8'
              secureTextEntry={!showPassword}
              style={styles.input}
              value={password}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={submit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed
              ]}
            >
              <Text style={styles.primaryButtonText}>Sign in</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>

            <Pressable onPress={demo} style={styles.demoButton}>
              <Text style={styles.demoButtonText}>
                ⚡ Try demo account (Instant Access)
              </Text>
            </Pressable>

            <Text style={styles.legal}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loginRoot: { flex: 1, backgroundColor: '#2563EB' },
  loginContent: { paddingBottom: 30 },
  welcomePanel: {
    minHeight: 520,
    padding: 24,
    paddingTop: 36,
    justifyContent: 'space-between',
    overflow: 'hidden'
  },
  welcomeImage: { resizeMode: 'cover' },
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(25, 90, 200, 0.72)'
  },
  loginIntro: { marginTop: 32, marginBottom: 20 },
  eyebrow: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8
  },
  loginTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8
  },
  loginSubtitle: {
    color: '#DBEAFE',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 320
  },
  featureList: { gap: 14, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureIconText: { fontSize: 18 },
  featureCopy: { flex: 1 },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2
  },
  featureText: { color: '#E0F2FE', fontSize: 11, lineHeight: 15 },
  quote: {
    backgroundColor: 'rgba(11, 35, 75, 0.65)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  quoteMark: { color: '#BFDBFE', fontSize: 24, lineHeight: 22, marginRight: 4 },
  quoteText: { color: '#F8FAFC', flex: 1, fontSize: 11, lineHeight: 16 },
  quoteCredit: {
    color: '#93C5FD',
    fontSize: 10,
    marginTop: 8,
    marginLeft: 20,
    width: '100%'
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: -20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8
  },
  formTitle: { color: '#0F172A', fontSize: 22, fontWeight: '800' },
  formHint: { color: '#64748B', fontSize: 13, marginTop: 4, marginBottom: 20 },
  inputLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 16
  },
  passwordLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  showPassword: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  error: { color: '#EF4444', fontSize: 12, marginTop: -8, marginBottom: 12 },
  primaryButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  pressed: { opacity: 0.8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  buttonArrow: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  demoButton: { alignItems: 'center', paddingVertical: 14 },
  demoButtonText: { color: '#2563EB', fontWeight: '700', fontSize: 13 },
  legal: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15
  }
})
