import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native'
import {
  User,
  Lock,
  Clock,
  Thermometer,
  Wind,
  Gauge,
  Bell,
  Moon,
  Sun,
  Globe,
  Trash2,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Check
} from 'lucide-react-native'
import { Switch } from '../components/Switch'
import { getColors } from '../theme/colors'
import { api } from '../services/api'

const SETTINGS_TABS = [
  'General',
  'Units & Format',
  'Notifications',
  'Appearance',
  'Language',
  'About'
]

export function SettingsScreen ({
  isDark = false,
  onToggleTheme,
  unit = 'C',
  onToggleUnit,
  language = 'en',
  onSelectLanguage,
  onLogout,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const { width } = useWindowDimensions()
  const isWide = width > 768

  const [activeTab, setActiveTab] = useState('General')
  const [weatherAlerts, setWeatherAlerts] = useState(true)
  const [dailyForecast, setDailyForecast] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(false)
  const [breakingNews, setBreakingNews] = useState(true)
  const [windUnit, setWindUnit] = useState('km/h')
  const [pressureUnit, setPressureUnit] = useState('hPa')
  const [precipUnit, setPrecipUnit] = useState('mm')

  useEffect(() => {
    if (!backendReady) return
    let isMounted = true
    api
      .getSettings()
      .then(serverSettings => {
        if (!isMounted || !serverSettings) return
        if (serverSettings.notifications) {
          if (serverSettings.notifications.weatherAlerts !== undefined)
            setWeatherAlerts(serverSettings.notifications.weatherAlerts)
          if (serverSettings.notifications.dailyForecast !== undefined)
            setDailyForecast(serverSettings.notifications.dailyForecast)
          if (serverSettings.notifications.weeklySummary !== undefined)
            setWeeklySummary(serverSettings.notifications.weeklySummary)
          if (serverSettings.notifications.breakingNews !== undefined)
            setBreakingNews(serverSettings.notifications.breakingNews)
        }
        if (serverSettings.windUnit) setWindUnit(serverSettings.windUnit)
        if (serverSettings.pressureUnit)
          setPressureUnit(serverSettings.pressureUnit)
        if (serverSettings.precipitationUnit)
          setPrecipUnit(serverSettings.precipitationUnit)
        if (serverSettings.temperatureUnit && onToggleUnit) {
          onToggleUnit(
            serverSettings.temperatureUnit === 'fahrenheit' ? 'F' : 'C'
          )
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [backendReady])

  const handleUpdatePreference = async (key, val) => {
    if (backendReady) {
      try {
        await api.updateSettings({ [key]: val })
      } catch {}
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Settings Navigation Tabs Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {SETTINGS_TABS.map(tab => {
          const isActive = activeTab === tab
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabItem,
                isActive && {
                  backgroundColor: c.blueLight,
                  borderColor: c.blue
                }
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? c.blue : c.muted },
                  isActive && styles.tabTextActive
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Main Grid */}
      <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
        <View style={[styles.col, isWide && styles.colLeft]}>
          {/* General Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: c.ink }]}>General Account</Text>

            {/* Profile Information Row */}
            <View
              style={[styles.settingRow, { borderBottomColor: c.borderLight }]}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.cardAlt }]}>
                  <User size={18} color={c.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>
                    Profile Information
                  </Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Disaster responder credentials & tier.
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  if (onNotification) onNotification('Responder profile synchronized')
                }}
                style={[
                  styles.smallActionBtn,
                  { backgroundColor: c.cardAlt, borderColor: c.border }
                ]}
              >
                <Text style={[styles.smallActionBtnText, { color: c.blue }]}>
                  Edit
                </Text>
              </Pressable>
            </View>

            {/* Time Zone Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.cardAlt }]}>
                  <Clock size={18} color={c.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>
                    Standard Time Zone
                  </Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Disaster telemetric synchronization.
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.dropdownPill,
                  { backgroundColor: c.cardAlt, borderColor: c.border }
                ]}
              >
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>
                  Asia/Kolkata (IST)
                </Text>
              </View>
            </View>
          </View>

          {/* Units & Format Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: c.ink }]}>
              Meteorological Measurement Units
            </Text>

            {/* Temperature */}
            <View
              style={[styles.settingRow, { borderBottomColor: c.borderLight }]}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.cardAlt }]}>
                  <Thermometer size={18} color='#EF4444' />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>
                    Temperature Unit
                  </Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Celsius or Fahrenheit scale
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  const nextUnit = unit === 'C' ? 'F' : 'C'
                  onToggleUnit(nextUnit)
                  handleUpdatePreference(
                    'temperatureUnit',
                    nextUnit === 'F' ? 'fahrenheit' : 'celsius'
                  )
                }}
                style={[
                  styles.dropdownPill,
                  { backgroundColor: c.cardAlt, borderColor: c.border }
                ]}
              >
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>
                  {unit === 'C' ? '°C (Celsius)' : '°F (Fahrenheit)'}
                </Text>
                <ChevronDown size={13} color={c.muted} />
              </Pressable>
            </View>

            {/* Wind Speed */}
            <View
              style={[styles.settingRow, { borderBottomColor: c.borderLight }]}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.cardAlt }]}>
                  <Wind size={18} color='#10B981' />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>
                    Wind Speed Unit
                  </Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Standard surface wind telemetry
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  const nextWind = windUnit === 'km/h' ? 'knots' : 'km/h'
                  setWindUnit(nextWind)
                  handleUpdatePreference('windUnit', nextWind)
                }}
                style={[
                  styles.dropdownPill,
                  { backgroundColor: c.cardAlt, borderColor: c.border }
                ]}
              >
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>
                  {windUnit}
                </Text>
                <ChevronDown size={13} color={c.muted} />
              </Pressable>
            </View>

            {/* Pressure */}
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.cardAlt }]}>
                  <Gauge size={18} color='#F59E0B' />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>
                    Atmospheric Pressure
                  </Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Barometric isobar scale
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.dropdownPill,
                  { backgroundColor: c.cardAlt, borderColor: c.border }
                ]}
              >
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>
                  {pressureUnit}
                </Text>
              </View>
            </View>
          </View>

          {/* Notifications Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: c.ink }]}>
              Early Warning Notifications
            </Text>

            <View
              style={[styles.settingRow, { borderBottomColor: c.borderLight }]}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.cardAlt }]}>
                  <Bell size={18} color={c.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>
                    Severe Weather Bulletins
                  </Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Immediate CAP v1.2 push alerts
                  </Text>
                </View>
              </View>
              <Switch
                checked={weatherAlerts}
                onChange={val => {
                  setWeatherAlerts(val)
                  handleUpdatePreference('weatherAlerts', val)
                }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: c.cardAlt }]}>
                  <Clock size={18} color={c.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>
                    Daily Meteorological Briefing
                  </Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Morning atmospheric summary
                  </Text>
                </View>
              </View>
              <Switch
                checked={dailyForecast}
                onChange={val => {
                  setDailyForecast(val)
                  handleUpdatePreference('dailyForecast', val)
                }}
              />
            </View>
          </View>
        </View>

        {/* Right Column: Appearance & Sign Out */}
        <View style={[styles.col, isWide && styles.colRight]}>
          {/* Appearance Section */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: c.ink }]}>
              Appearance & Theme
            </Text>

            <View style={styles.themeOptionsRow}>
              <Pressable
                onPress={() => isDark && onToggleTheme()}
                style={[
                  styles.themeBox,
                  {
                    backgroundColor: !isDark ? c.blueLight : c.cardAlt,
                    borderColor: !isDark ? c.blue : c.border
                  }
                ]}
              >
                <Sun size={24} color={!isDark ? c.blue : c.muted} />
                <Text
                  style={[
                    styles.themeBoxText,
                    { color: !isDark ? c.blue : c.ink, fontWeight: !isDark ? '800' : '600' }
                  ]}
                >
                  Light Theme
                </Text>
              </Pressable>

              <Pressable
                onPress={() => !isDark && onToggleTheme()}
                style={[
                  styles.themeBox,
                  {
                    backgroundColor: isDark ? c.blueLight : c.cardAlt,
                    borderColor: isDark ? c.blue : c.border
                  }
                ]}
              >
                <Moon size={24} color={isDark ? c.blue : c.muted} />
                <Text
                  style={[
                    styles.themeBoxText,
                    { color: isDark ? c.blue : c.ink, fontWeight: isDark ? '800' : '600' }
                  ]}
                >
                  Dark Theme
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Sign Out Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <Pressable
              onPress={onLogout}
              style={[
                styles.logoutBtn,
                { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2', borderColor: '#EF4444' }
              ]}
            >
              <LogOut size={16} color='#EF4444' />
              <Text style={styles.logoutBtnText}>Sign Out of WeatherGPT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 36, gap: 12 },
  tabsRow: { gap: 8, paddingBottom: 4 },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabTextActive: { fontWeight: '800' },
  mainGrid: { gap: 12 },
  mainGridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { gap: 12 },
  colLeft: { flex: 6 },
  colRight: { flex: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingLabel: { fontSize: 13, fontWeight: '600' },
  settingSub: { fontSize: 10.5, marginTop: 2 },
  smallActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  smallActionBtnText: { fontSize: 11, fontWeight: '700' },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  dropdownPillText: { fontSize: 11, fontWeight: '700' },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6
  },
  themeBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8
  },
  themeBoxText: { fontSize: 12 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  logoutBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '800' }
})

export default SettingsScreen
