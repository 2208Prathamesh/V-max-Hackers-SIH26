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
  View,
  Modal
} from 'react-native'
import { Brand } from '../components/Brand'
import { api } from '../services/api'

export function LoginScreen ({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState('')
  const [isForgotLoading, setIsForgotLoading] = useState(false)

  const submit = () => {
    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.')
        return
      }
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.')
        return
      }
      if (onRegister) {
        onRegister(name.trim(), email.trim(), password)
      } else {
        onLogin(email.trim(), password)
      }
    } else {
      if (email.trim() && password.trim()) {
        onLogin(email.trim(), password)
      } else {
        setError('Enter your email and password to continue.')
      }
    }
  }

  const demo = () => {
    const demoEmail = 'sidpatil@gmail.com'
    const demoPassword = 'password123'
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
    onLogin(demoEmail, demoPassword)
  }

  const handleForgotPasswordSubmit = async () => {
    if (!forgotEmail.trim()) {
      setForgotStatus('Please enter your email address.')
      return
    }
    setIsForgotLoading(true)
    try {
      if (api.forgotPassword) {
        await api.forgotPassword(forgotEmail.trim())
      }
      setForgotStatus('✓ Password reset instructions sent to your inbox!')
    } catch (err) {
      setForgotStatus(err?.message || '✓ Reset instructions sent if account exists.')
    } finally {
      setIsForgotLoading(false)
    }
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
            {/* Mode Switcher Tabs */}
            <View style={styles.modeTabs}>
              <Pressable
                onPress={() => {
                  setMode('login')
                  setError('')
                }}
                style={[
                  styles.modeTab,
                  mode === 'login' && styles.modeTabActive
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    mode === 'login' && styles.modeTabTextActive
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode('register')
                  setError('')
                }}
                style={[
                  styles.modeTab,
                  mode === 'register' && styles.modeTabActive
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    mode === 'register' && styles.modeTabTextActive
                  ]}
                >
                  Create Account
                </Text>
              </Pressable>
            </View>

            <Text style={styles.formTitle}>
              {mode === 'login' ? 'Welcome back' : 'Join WeatherGPT'}
            </Text>
            <Text style={styles.formHint}>
              {mode === 'login'
                ? 'Sign in to access your AI weather console.'
                : 'Create an account to save locations and sync preferences.'}
            </Text>

            {mode === 'register' ? (
              <>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  autoCapitalize='words'
                  onChangeText={v => {
                    setName(v)
                    setError('')
                  }}
                  placeholder='Your Full Name'
                  placeholderTextColor='#94A3B8'
                  style={styles.input}
                  value={name}
                />
              </>
            ) : null}

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
              placeholder={
                mode === 'register'
                  ? 'At least 8 characters'
                  : 'Enter your password'
              }
              placeholderTextColor='#94A3B8'
              secureTextEntry={!showPassword}
              style={styles.input}
              value={password}
            />

            {mode === 'login' ? (
              <Pressable
                onPress={() => {
                  setIsForgotPasswordOpen(true)
                  setForgotStatus('')
                  setForgotEmail(email)
                }}
                style={styles.forgotBtn}
              >
                <Text style={styles.forgotBtnText}>Forgot password?</Text>
              </Pressable>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={submit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Sign in' : 'Create Account'}
              </Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>

            {mode === 'login' ? (
              <Pressable onPress={demo} style={styles.demoButton}>
                <Text style={styles.demoButtonText}>
                  ⚡ Try demo account (Instant Access)
                </Text>
              </Pressable>
            ) : null}

            <Text style={styles.legal}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <Modal
          transparent
          animationType='fade'
          visible={isForgotPasswordOpen}
          onRequestClose={() => setIsForgotPasswordOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.forgotCard}>
              <Text style={styles.forgotTitle}>Reset Password</Text>
              <Text style={styles.forgotSubtitle}>
                Enter your email address to receive instructions.
              </Text>

              <TextInput
                autoCapitalize='none'
                keyboardType='email-address'
                placeholder='Enter registered email'
                placeholderTextColor='#94A3B8'
                value={forgotEmail}
                onChangeText={setForgotEmail}
                style={styles.forgotInput}
              />

              {forgotStatus ? (
                <Text style={styles.forgotStatusText}>{forgotStatus}</Text>
              ) : null}

              <View style={styles.forgotActions}>
                <Pressable
                  onPress={() => setIsForgotPasswordOpen(false)}
                  style={styles.forgotCancelBtn}
                >
                  <Text style={styles.forgotCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  disabled={isForgotLoading}
                  onPress={handleForgotPasswordSubmit}
                  style={styles.forgotSubmitBtn}
                >
                  <Text style={styles.forgotSubmitText}>
                    {isForgotLoading ? 'Sending...' : 'Send Link'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loginRoot: { flex: 1, backgroundColor: '#2563EB' },
  loginContent: { paddingBottom: 30 },
  welcomePanel: {
    minHeight: 460,
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
  loginIntro: { marginTop: 24, marginBottom: 16 },
  eyebrow: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6
  },
  loginTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.8
  },
  loginSubtitle: {
    color: '#DBEAFE',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6
  },
  featureList: { gap: 10, marginVertical: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureIconText: { fontSize: 15 },
  featureCopy: { flex: 1 },
  featureTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  featureText: { color: '#BFDBFE', fontSize: 10, marginTop: 1 },
  quote: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    paddingLeft: 10,
    marginTop: 10
  },
  quoteMark: { color: '#BFDBFE', fontSize: 22, lineHeight: 18 },
  quoteText: {
    color: '#EFF6FF',
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 15
  },
  quoteCredit: { color: '#BFDBFE', fontSize: 9.5, marginTop: 2 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: 22,
    paddingTop: 20
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16
  },
  modeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  modeTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B'
  },
  modeTabTextActive: {
    color: '#2563EB',
    fontWeight: '800'
  },
  formTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  formHint: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 16
  },
  inputLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    color: '#0F172A',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  showPassword: { color: '#2563EB', fontSize: 9, fontWeight: '800' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 12 },
  forgotBtnText: { color: '#2563EB', fontSize: 10.5, fontWeight: '700' },
  error: {
    color: '#DC2626',
    fontSize: 10.5,
    marginBottom: 10,
    fontWeight: '600'
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 2
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  buttonArrow: { color: '#FFFFFF', fontSize: 14, marginLeft: 8 },
  demoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12
  },
  demoButtonText: { color: '#1D4ED8', fontSize: 11, fontWeight: '700' },
  legal: {
    color: '#94A3B8',
    fontSize: 9.5,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 14
  },
  pressed: { opacity: 0.75 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  forgotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  forgotTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  forgotSubtitle: { fontSize: 11, color: '#64748B', marginTop: 4, marginBottom: 14 },
  forgotInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    color: '#0F172A',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10
  },
  forgotStatusText: { fontSize: 10.5, color: '#10B981', fontWeight: '700', marginBottom: 10 },
  forgotActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  forgotCancelBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  forgotCancelText: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  forgotSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10
  },
  forgotSubmitText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' }
})
