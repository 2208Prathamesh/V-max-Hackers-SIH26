import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
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

const C = {
  ink: '#10243E',
  muted: '#8190A5',
  blue: '#2169D4',
  white: '#FFFFFF',
  border: '#E4EAF1'
}
const hourly = [
  ['Now', '28', '65%', 'sun-cloud'],
  ['9 AM', '29', '60%', 'rain'],
  ['10 AM', '30', '70%', 'rain'],
  ['11 AM', '31', '80%', 'rain'],
  ['12 PM', '31', '70%', 'cloud']
]

function Brand ({ dark = false }) {
  return (
    <View style={styles.brand}>
      <View style={styles.mark}>
        <View style={styles.sunDot} />
        <View style={styles.cloudShape} />
      </View>
      <Text style={[styles.brandName, dark && styles.darkBrandName]}>
        WeatherGPT
      </Text>
    </View>
  )
}

function Feature ({ icon, title, text }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  )
}

function LoginScreen ({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const submit = () =>
    email.trim() && password.trim()
      ? onLogin()
      : setError('Enter your email and password to continue.')
  const demo = () => {
    setEmail('sidpatil@gmail.com')
    setPassword('password123')
    setError('')
    onLogin()
  }
  return (
    <SafeAreaView style={styles.loginRoot}>
      <StatusBar style='light' />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps='handled'
        >
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=85&w=1200&auto=format&fit=crop'
            }}
            style={styles.welcomePanel}
            imageStyle={styles.welcomeImage}
          >
            <View style={styles.welcomeOverlay} />
            <Brand />
            <View style={styles.loginIntro}>
              <Text style={styles.eyebrow}>YOUR WEATHER, UNDERSTOOD</Text>
              <Text style={styles.loginTitle}>Your AI weather companion</Text>
              <Text style={styles.loginSubtitle}>
                Real-time forecasts, smart alerts and personalized insights -
                all in one place.
              </Text>
            </View>
            <View style={styles.featureList}>
              <Feature
                icon='?'
                title='Chat Naturally'
                text='Ask anything about weather in natural language.'
              />
              <Feature
                icon='!'
                title='Instant Alerts'
                text='Get notified about severe weather and important updates.'
              />
              <Feature
                icon='+'
                title='Location Based'
                text='Accurate weather updates for any location you care about.'
              />
              <Feature
                icon='~'
                title='Smart Insights'
                text='Get climate trends and helpful recommendations.'
              />
            </View>
            <View style={styles.quote}>
              <Text style={styles.quoteMark}>“</Text>
              <Text style={styles.quoteText}>
                The best time to plant a tree was 20 years ago. The second best
                time is now.
              </Text>
              <Text style={styles.quoteCredit}>- Weather wisdom</Text>
            </View>
          </ImageBackground>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formHint}>Sign in to see your sky.</Text>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <TextInput
              autoCapitalize='none'
              keyboardType='email-address'
              onChangeText={v => {
                setEmail(v)
                setError('')
              }}
              placeholder='you@example.com'
              placeholderTextColor={C.muted}
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
              placeholderTextColor={C.muted}
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
              <Text style={styles.buttonArrow}>-&gt;</Text>
            </Pressable>
            <Pressable onPress={demo} style={styles.demoButton}>
              <Text style={styles.demoButtonText}>Try the demo account</Text>
            </Pressable>
            <Text style={styles.legal}>
              By continuing, you agree to our Terms and Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function Dashboard ({ onLogout, onOpenChat }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <SafeAreaView style={styles.dashboardRoot}>
      <StatusBar style='dark' />
      <ScrollView
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.greeting}>GOOD MORNING, SID</Text>
            <Text style={styles.dashboardTitle}>Your day in the sky</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setMenuOpen(true)}
              style={styles.menuButton}
              accessibilityLabel='Open navigation menu'
            >
              <Text style={styles.menuButtonText}>☰</Text>
            </Pressable>
            <Pressable
              onPress={onLogout}
              style={styles.avatar}
              accessibilityLabel='Log out'
            >
              <Text style={styles.avatarText}>SP</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>+</Text>
          <Text style={styles.locationText}>Pune, Maharashtra</Text>
          <Text style={styles.locationChevron}>v</Text>
        </View>
        <View style={styles.weatherHero}>
          <View style={styles.heroGlow} />
          <View>
            <Text style={styles.heroDate}>THU, AUG 27 | 8:42 AM</Text>
            <Text style={styles.heroCondition}>Partly cloudy</Text>
            <Text style={styles.temperature}>
              28<Text style={styles.degree}>°</Text>
            </Text>
            <Text style={styles.feelsLike}>Feels like 30°</Text>
          </View>
          <View style={styles.heroWeatherIcon}>
            <Text style={styles.heroSun}>O</Text>
            <Text style={styles.heroCloud}>---</Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <Metric label='HUMIDITY' value='72%' />
          <Metric label='WIND' value='12 km/h' />
          <Metric label='VISIBILITY' value='8 km' />
        </View>
        <SectionHeader title='Hourly forecast' action='Next 24h' />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyRow}
        >
          {hourly.map(([time, temp, chance, icon], index) => (
            <View
              key={time}
              style={[styles.hourCard, index === 0 && styles.hourCardActive]}
            >
              <Text style={[styles.hourTime, index === 0 && styles.activeText]}>
                {time}
              </Text>
              <Text style={[styles.hourIcon, index === 0 && styles.activeText]}>
                {icon === 'rain' ? '///' : icon === 'cloud' ? '---' : 'O/'}
              </Text>
              <Text style={[styles.hourTemp, index === 0 && styles.activeText]}>
                {temp}°
              </Text>
              <Text style={styles.rainChance}>{chance}</Text>
            </View>
          ))}
        </ScrollView>
        <SectionHeader title='Smart alert' action='View all' />
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Text style={styles.alertIconText}>!</Text>
          </View>
          <View style={styles.alertCopy}>
            <Text style={styles.alertTitle}>Rain likely this afternoon</Text>
            <Text style={styles.alertBody}>
              Carry an umbrella after 2 PM. Probability peaks at 80%.
            </Text>
          </View>
          <Text style={styles.alertArrow}>-&gt;</Text>
        </View>
        <SectionHeader title='Quick actions' action='Explore' />
        <View style={styles.quickGrid}>
          <QuickAction icon='▣' label='Weather forecast' tone='blue' />
          <QuickAction icon='⌖' label='Weather map' tone='green' />
          <QuickAction icon='!' label='Alerts' tone='red' />
          <QuickAction icon='≋' label='Air quality' tone='purple' />
        </View>
        <View style={styles.splitHeader}>
          <Text style={styles.sectionTitle}>Recent conversations</Text>
          <Text style={styles.sectionAction}>View all -&gt;</Text>
        </View>
        <View style={styles.listCard}>
          {[
            'Will it rain tomorrow in Pune?',
            'Weather update for my farm',
            'Cyclone update in Bay of Bengal',
            'What is the temperature today?'
          ].map((item, index) => (
            <View key={item} style={styles.listRow}>
              <Text style={styles.listIcon}>□</Text>
              <Text style={styles.listText}>{item}</Text>
              <Text style={styles.listTime}>
                {index === 0 ? '8:15 AM' : 'Yesterday'}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.splitHeader}>
          <Text style={styles.sectionTitle}>Saved locations</Text>
          <Text style={styles.sectionAction}>View all -&gt;</Text>
        </View>
        <View style={styles.listCard}>
          {[
            ['Pune, Maharashtra', '28°', 'Current location'],
            ['Mumbai, Maharashtra', '29°', '180 km away'],
            ['Nagpur, Maharashtra', '32°', '520 km away']
          ].map(([location, temp, note]) => (
            <View key={location} style={styles.listRow}>
              <Text style={styles.locationListPin}>+</Text>
              <View style={styles.locationListCopy}>
                <Text style={styles.listText}>{location}</Text>
                <Text style={styles.locationNote}>{note}</Text>
              </View>
              <Text style={styles.listTemp}>{temp}</Text>
            </View>
          ))}
        </View>
        <View style={styles.askCard}>
          <View>
            <Text style={styles.askEyebrow}>WEATHERGPT</Text>
            <Text style={styles.askTitle}>Ask about your weather</Text>
            <Text style={styles.askBody}>
              Get a clear answer, without the forecast jargon.
            </Text>
          </View>
          <Pressable style={styles.askButton}>
            <Text style={styles.askButtonText}>Ask -&gt;</Text>
          </Pressable>
        </View>
      </ScrollView>
      {false && (
        <View style={styles.tabBar}>
          {['Today', 'Forecast', 'Alerts', 'Profile'].map((label, i) => (
            <View key={label} style={styles.tab}>
              <View style={[styles.tabDot, i === 0 && styles.tabDotActive]} />
              <Text style={[styles.tabLabel, i === 0 && styles.tabLabelActive]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      )}
      {menuOpen ? (
        <View style={styles.drawerLayer}>
          <Pressable
            style={styles.drawerScrim}
            onPress={() => setMenuOpen(false)}
          />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Brand dark />
              <Pressable
                onPress={() => setMenuOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.drawerCaption}>WEATHERGPT</Text>
            {[
              '⌂  Dashboard',
              '□  Chat',
              '!  Alerts',
              '◇  Weather map',
              '◌  History',
              '☆  Saved locations',
              '⚙  Settings'
            ].map((item, index) => (
              <Pressable
                key={item}
                onPress={() => {
                  setMenuOpen(false)
                  if (index === 1) onOpenChat()
                }}
                style={[
                  styles.drawerItem,
                  index === 0 && styles.drawerItemActive
                ]}
              >
                <Text
                  style={[
                    styles.drawerItemText,
                    index === 0 && styles.drawerItemTextActive
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
            <View style={styles.drawerFooter}>
              <Text style={styles.drawerFooterTitle}>Current location</Text>
              <Text style={styles.drawerFooterText}>Pune, Maharashtra</Text>
              <Text style={styles.drawerFooterLink}>Change location</Text>
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

function ChatScreen ({ onBack }) {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const sendMessage = () => {
    const text = draft.trim()
    if (!text) return
    setMessages(current => [...current, text])
    setDraft('')
  }
  return (
    <SafeAreaView style={styles.dashboardRoot}>
      <StatusBar style='dark' />
      <View style={styles.chatTopBar}>
        <Pressable
          onPress={onBack}
          style={styles.chatBack}
          accessibilityLabel='Back to dashboard'
        >
          <Text style={styles.chatBackText}>&lt;</Text>
        </Pressable>
        <View>
          <Text style={styles.chatTitle}>Chat with WeatherGPT</Text>
          <Text style={styles.chatSubtitle}>
            Ask anything about weather in natural language
          </Text>
        </View>
        <View style={styles.chatOnline}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.todayPill}>
          <Text style={styles.todayText}>Today</Text>
        </View>
        <View style={styles.userBubble}>
          <Text style={styles.bubbleMeta}>10:21 AM</Text>
          <Text style={styles.userBubbleText}>
            Will it rain tomorrow in Pune? ✓✓
          </Text>
        </View>
        <View style={styles.botRow}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>✦</Text>
          </View>
          <View style={styles.botBubble}>
            <Text style={styles.botText}>
              Yes, there is a high chance of rain tomorrow in Pune. Here&apos;s
              the detailed forecast:
            </Text>
            <Text style={styles.bubbleMeta}>10:22 AM</Text>
            <ForecastReply />
          </View>
        </View>
        {messages.map((message, index) => (
          <View key={`${message}-${index}`} style={styles.userBubble}>
            <Text style={styles.bubbleMeta}>Now</Text>
            <Text style={styles.userBubbleText}>{message} ✓✓</Text>
          </View>
        ))}
        <View style={styles.botRow}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>✦</Text>
          </View>
          <View style={styles.botBubble}>
            <Text style={styles.botText}>
              Would you like a full hourly forecast, air quality, or travel
              advice?
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.chatComposerWrap}>
        <View style={styles.chatComposer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={sendMessage}
            placeholder='Ask anything about weather...'
            placeholderTextColor={C.muted}
            style={styles.chatInput}
            returnKeyType='send'
          />
          <Pressable onPress={sendMessage} style={styles.chatSend}>
            <Text style={styles.chatSendText}>-&gt;</Text>
          </Pressable>
        </View>
        <Text style={styles.chatDisclaimer}>
          WeatherGPT can make mistakes. Please verify critical information.
        </Text>
      </View>
    </SafeAreaView>
  )
}

function ForecastReply () {
  return (
    <View style={styles.forecastReply}>
      <View style={styles.rainSummary}>
        <Text style={styles.rainGlyph}>///</Text>
        <View>
          <Text style={styles.rainPercent}>80%</Text>
          <Text style={styles.rainLabel}>Chance of rain</Text>
        </View>
        <View style={styles.rainDetail}>
          <Text style={styles.detailStrong}>Moderate rain</Text>
          <Text style={styles.detailText}>2:00 PM - 8:00 PM</Text>
        </View>
      </View>
      <View style={styles.forecastStats}>
        <Metric label='MIN TEMP' value='22°C' />
        <Metric label='MAX TEMP' value='29°C' />
        <Metric label='WIND' value='16 km/h SW' />
        <Metric label='HUMIDITY' value='74%' />
      </View>
      <Text style={styles.replyNote}>
        Make sure to carry an umbrella and avoid waterlogged areas.
      </Text>
    </View>
  )
}

function Metric ({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  )
}
function SectionHeader ({ title, action }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionAction}>{action} -&gt;</Text>
    </View>
  )
}
function QuickAction ({ icon, label, tone }) {
  return (
    <Pressable style={[styles.quickAction, styles[`quick${tone}`]]}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  )
}
export default function App () {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('dashboard')
  return isLoggedIn ? (
    currentScreen === 'chat' ? (
      <ChatScreen onBack={() => setCurrentScreen('dashboard')} />
    ) : (
      <Dashboard
        onLogout={() => setIsLoggedIn(false)}
        onOpenChat={() => setCurrentScreen('chat')}
      />
    )
  ) : (
    <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loginRoot: { flex: 1, backgroundColor: C.blue },
  loginContent: { paddingBottom: 30 },
  welcomePanel: {
    minHeight: 570,
    padding: 24,
    paddingTop: 34,
    justifyContent: 'space-between',
    overflow: 'hidden'
  },
  welcomeImage: { resizeMode: 'cover' },
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(25, 101, 205, 0.68)'
  },
  loginAtmosphere: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  largeSun: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#3780E0',
    top: -85,
    right: -55
  },
  horizon: {
    position: 'absolute',
    height: 230,
    width: '130%',
    bottom: -150,
    left: '-15%',
    borderRadius: 200,
    backgroundColor: '#2B75DC'
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 42, height: 36, justifyContent: 'center' },
  sunDot: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFB84D',
    top: 0,
    right: 1
  },
  cloudShape: {
    width: 34,
    height: 18,
    borderRadius: 12,
    backgroundColor: C.white,
    bottom: 2,
    left: 1
  },
  brandName: {
    color: C.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  darkBrandName: { color: C.ink },
  loginIntro: { marginTop: 42, marginBottom: 24 },
  eyebrow: {
    color: '#BBD9FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12
  },
  loginTitle: {
    color: C.white,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '800',
    letterSpacing: -1
  },
  loginSubtitle: {
    color: '#DDEBFF',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 330
  },
  featureList: { gap: 17, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureIconText: { color: C.blue, fontSize: 22, fontWeight: '800' },
  featureCopy: { flex: 1 },
  featureTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3
  },
  featureText: { color: '#E2F0FF', fontSize: 11, lineHeight: 16 },
  quote: {
    backgroundColor: 'rgba(11, 47, 91, 0.63)',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  quoteMark: { color: '#D6ECFF', fontSize: 28, lineHeight: 26, marginRight: 4 },
  quoteText: { color: '#F3F8FF', flex: 1, fontSize: 11, lineHeight: 17 },
  quoteCredit: {
    color: '#BDD9F4',
    fontSize: 10,
    marginTop: 10,
    marginLeft: 25,
    width: '100%'
  },
  formCard: {
    backgroundColor: C.white,
    borderRadius: 0,
    padding: 24,
    shadowColor: '#0C3F8F',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7
  },
  formTitle: { color: C.ink, fontSize: 23, fontWeight: '800' },
  formHint: { color: C.muted, fontSize: 14, marginTop: 5, marginBottom: 24 },
  inputLabel: {
    color: '#64758C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: C.ink,
    fontSize: 15,
    marginBottom: 17
  },
  passwordLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  showPassword: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  error: { color: '#C24138', fontSize: 12, marginTop: -8, marginBottom: 12 },
  primaryButton: {
    height: 52,
    backgroundColor: C.blue,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12
  },
  pressed: { opacity: 0.8 },
  primaryButtonText: { color: C.white, fontSize: 15, fontWeight: '800' },
  buttonArrow: { color: C.white, fontSize: 18 },
  demoButton: { alignItems: 'center', paddingVertical: 17 },
  demoButtonText: { color: C.blue, fontWeight: '700', fontSize: 13 },
  legal: {
    color: '#A1ACBA',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15
  },
  dashboardRoot: { flex: 1, backgroundColor: '#F5F8FC' },
  dashboardContent: { padding: 22, paddingBottom: 110 },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22
  },
  greeting: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 7
  },
  dashboardTitle: {
    color: C.ink,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.7
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D5E8FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: C.blue, fontWeight: '800', fontSize: 13 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  locationPin: {
    color: C.blue,
    fontWeight: '900',
    fontSize: 18,
    marginRight: 8
  },
  locationText: { color: '#54667D', fontSize: 14, fontWeight: '600' },
  locationChevron: { color: C.blue, fontSize: 14, marginLeft: 7 },
  weatherHero: {
    height: 218,
    backgroundColor: C.blue,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  heroGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    right: -55,
    top: -80,
    backgroundColor: '#3982E4'
  },
  heroDate: {
    color: '#BBD9FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  heroCondition: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 17
  },
  temperature: {
    color: C.white,
    fontSize: 68,
    lineHeight: 76,
    fontWeight: '800',
    letterSpacing: -4
  },
  degree: { fontSize: 35, fontWeight: '500', letterSpacing: 0 },
  feelsLike: { color: '#C9DFFF', fontSize: 12 },
  heroWeatherIcon: {
    width: 100,
    height: 90,
    marginTop: 22,
    alignItems: 'center'
  },
  heroSun: { color: '#FFD267', fontSize: 61, fontWeight: '300' },
  heroCloud: {
    color: C.white,
    fontSize: 33,
    fontWeight: '800',
    marginTop: -28
  },
  metricsRow: {
    backgroundColor: C.white,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 17,
    marginTop: -1,
    borderWidth: 1,
    borderColor: C.border
  },
  metric: { alignItems: 'center' },
  metricLabel: {
    color: '#97A4B3',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 6
  },
  metricValue: { color: C.ink, fontSize: 14, fontWeight: '800' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 27,
    marginBottom: 13
  },
  sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '800' },
  sectionAction: { color: C.blue, fontSize: 11, fontWeight: '700' },
  hourlyRow: { gap: 9 },
  hourCard: {
    width: 66,
    height: 116,
    backgroundColor: C.white,
    borderRadius: 15,
    alignItems: 'center',
    paddingTop: 13,
    borderWidth: 1,
    borderColor: C.border
  },
  hourCardActive: { backgroundColor: C.blue, borderColor: C.blue },
  hourTime: { color: '#7A8BA0', fontSize: 11, fontWeight: '700' },
  activeText: { color: C.white },
  hourIcon: {
    color: '#F2AC35',
    fontSize: 17,
    fontWeight: '800',
    marginVertical: 13
  },
  hourTemp: { color: C.ink, fontSize: 15, fontWeight: '800' },
  rainChance: { color: '#78A8DF', fontSize: 10, marginTop: 5 },
  alertCard: {
    backgroundColor: '#FFF8E7',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F6E8C1'
  },
  alertIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFD985',
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertIconText: { color: '#805919', fontSize: 18, fontWeight: '900' },
  alertCopy: { flex: 1, paddingHorizontal: 12 },
  alertTitle: {
    color: '#523E17',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4
  },
  alertBody: { color: '#806B3E', fontSize: 11, lineHeight: 16 },
  alertArrow: { color: '#AD7B1F', fontSize: 17 },
  askCard: {
    marginTop: 24,
    backgroundColor: '#163A65',
    borderRadius: 20,
    padding: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  askEyebrow: {
    color: '#8FC3FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 7
  },
  askTitle: { color: C.white, fontSize: 17, fontWeight: '800' },
  askBody: { color: '#B6CBE4', fontSize: 11, marginTop: 5, maxWidth: 200 },
  askButton: {
    backgroundColor: C.white,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 10
  },
  askButtonText: { color: C.blue, fontSize: 11, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuButtonText: { color: C.ink, fontSize: 20, fontWeight: '800' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction: {
    width: '48%',
    minHeight: 82,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border
  },
  quickblue: { backgroundColor: '#EEF6FF' },
  quickgreen: { backgroundColor: '#EFFAF3' },
  quickred: { backgroundColor: '#FFF2F1' },
  quickpurple: { backgroundColor: '#F5F0FF' },
  quickIcon: {
    color: C.blue,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 7
  },
  quickLabel: { color: C.ink, fontSize: 11, fontWeight: '700' },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 27,
    marginBottom: 13
  },
  listCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14
  },
  listRow: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  listIcon: { color: '#7C8EA4', fontSize: 15 },
  listText: { color: C.ink, fontSize: 11, fontWeight: '600', flex: 1 },
  listTime: { color: '#8A9AAC', fontSize: 9 },
  locationListPin: { color: C.blue, fontSize: 18, fontWeight: '800' },
  locationListCopy: { flex: 1 },
  locationNote: { color: '#8291A3', fontSize: 9, marginTop: 3 },
  listTemp: { color: C.ink, fontSize: 13, fontWeight: '800' },
  drawerLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    flexDirection: 'row'
  },
  drawerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 29, 53, 0.4)'
  },
  drawer: {
    width: 286,
    backgroundColor: C.white,
    padding: 22,
    paddingTop: 28,
    shadowColor: '#0C2D56',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 6, height: 0 },
    elevation: 12
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0F4F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButtonText: { color: C.ink, fontSize: 22, lineHeight: 22 },
  drawerCaption: {
    color: '#98A5B5',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12
  },
  drawerItem: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 5
  },
  drawerItemActive: { backgroundColor: '#EAF3FF' },
  drawerItemText: { color: '#31445C', fontSize: 14, fontWeight: '600' },
  drawerItemTextActive: { color: C.blue, fontWeight: '800' },
  drawerFooter: {
    marginTop: 'auto',
    backgroundColor: '#F6F9FC',
    borderRadius: 14,
    padding: 15
  },
  drawerFooterTitle: {
    color: '#93A1B2',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  drawerFooterText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8
  },
  drawerFooterLink: { color: C.blue, fontSize: 11, fontWeight: '700' },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 78,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8
  },
  tab: { alignItems: 'center', gap: 6, minWidth: 58 },
  tabDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#B5C0CC' },
  tabDotActive: { width: 20, backgroundColor: C.blue },
  tabLabel: { color: '#8B98A8', fontSize: 10, fontWeight: '600' },
  tabLabelActive: { color: C.blue, fontWeight: '800' }
})
