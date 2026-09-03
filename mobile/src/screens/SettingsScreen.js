import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { Switch } from '../components/Switch';
import { getColors } from '../theme/colors';

const SETTINGS_TABS = [
  'General',
  'Units & Format',
  'Notifications',
  'Weather Preferences',
  'Privacy & Data',
  'Appearance',
  'Language',
  'Connected Accounts',
  'About'
];

export function SettingsScreen({
  isDark = false,
  onToggleTheme,
  unit = 'C',
  onToggleUnit,
  language = 'en',
  onSelectLanguage,
  onLogout,
  onNotification
}) {
  const c = getColors(isDark);
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const [activeTab, setActiveTab] = useState('General');
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [dailyForecast, setDailyForecast] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [breakingNews, setBreakingNews] = useState(true);
  const [windUnit, setWindUnit] = useState('km/h');
  const [pressureUnit, setPressureUnit] = useState('hPa');
  const [precipUnit, setPrecipUnit] = useState('mm');

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
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabItem,
                isActive && { backgroundColor: c.blueLight, borderColor: c.blue }
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
          );
        })}
      </ScrollView>

      {/* Main Grid: Left Settings Blocks + Right Account & Privacy Summary */}
      <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
        {/* Left Column: General, Units, Notifications, Delete */}
        <View style={[styles.col, isWide && styles.colLeft]}>
          {/* General Section */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.sectionTitle, { color: c.ink }]}>General</Text>

            {/* Profile Information Row */}
            <View style={[styles.settingRow, { borderBottomColor: c.borderLight }]}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>👤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Profile Information</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Update your name, email and profile picture.
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  if (onNotification) onNotification('Edit Profile modal');
                }}
                style={[styles.smallActionBtn, { backgroundColor: c.cardAlt, borderColor: c.border }]}
              >
                <Text style={[styles.smallActionBtnText, { color: c.blue }]}>Edit Profile</Text>
              </Pressable>
            </View>

            {/* Change Password Row */}
            <View style={[styles.settingRow, { borderBottomColor: c.borderLight }]}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Change Password</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Update your password to keep your account secure.
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  if (onNotification) onNotification('Change Password modal');
                }}
                style={[styles.smallActionBtn, { backgroundColor: c.cardAlt, borderColor: c.border }]}
              >
                <Text style={[styles.smallActionBtnText, { color: c.blue }]}>Change</Text>
              </Pressable>
            </View>

            {/* Time Zone Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>🕒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Time Zone</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Set your default time zone for accurate updates.
                  </Text>
                </View>
              </View>
              <View style={[styles.dropdownPill, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>
                  (UTC+05:30) Asia/Kolkata
                </Text>
                <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
              </View>
            </View>
          </View>

          {/* Units & Format Section */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.sectionTitle, { color: c.ink }]}>Units & Format</Text>

            {/* Temperature */}
            <View style={[styles.settingRow, { borderBottomColor: c.borderLight }]}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>🌡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Temperature</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Choose your preferred temperature unit.
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => onToggleUnit(unit === 'C' ? 'F' : 'C')}
                style={[styles.dropdownPill, { backgroundColor: c.cardAlt, borderColor: c.border }]}
              >
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>
                  {unit === 'C' ? '°C (Celsius)' : '°F (Fahrenheit)'}
                </Text>
                <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
              </Pressable>
            </View>

            {/* Wind Speed */}
            <View style={[styles.settingRow, { borderBottomColor: c.borderLight }]}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>💨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Wind Speed</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Choose your preferred wind speed unit.
                  </Text>
                </View>
              </View>
              <View style={[styles.dropdownPill, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>{windUnit}</Text>
                <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
              </View>
            </View>

            {/* Pressure */}
            <View style={[styles.settingRow, { borderBottomColor: c.borderLight }]}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>⏲️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Pressure</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Choose your preferred pressure unit.
                  </Text>
                </View>
              </View>
              <View style={[styles.dropdownPill, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>{pressureUnit}</Text>
                <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
              </View>
            </View>

            {/* Precipitation */}
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>💧</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Precipitation</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Choose your preferred precipitation unit.
                  </Text>
                </View>
              </View>
              <View style={[styles.dropdownPill, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
                <Text style={[styles.dropdownPillText, { color: c.ink }]}>{precipUnit}</Text>
                <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
              </View>
            </View>
          </View>

          {/* Notifications Section */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.sectionTitle, { color: c.ink }]}>Notifications</Text>

            <View style={[styles.settingRow, { borderBottomColor: c.borderLight }]}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Weather Alerts</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Receive severe weather alerts and warnings.
                  </Text>
                </View>
              </View>
              <Switch checked={weatherAlerts} onChange={setWeatherAlerts} />
            </View>

            <View style={[styles.settingRow, { borderBottomColor: c.borderLight }]}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>📅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Daily Forecast</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Get your daily weather forecast every morning.
                  </Text>
                </View>
              </View>
              <Switch checked={dailyForecast} onChange={setDailyForecast} />
            </View>

            <View style={[styles.settingRow, { borderBottomColor: c.borderLight }]}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>✉️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Weekly Summary</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Receive weekly weather summary and outlook.
                  </Text>
                </View>
              </View>
              <Switch checked={weeklySummary} onChange={setWeeklySummary} />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Text style={styles.settingIcon}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: c.ink }]}>Breaking News</Text>
                  <Text style={[styles.settingSub, { color: c.muted }]}>
                    Important weather news and updates.
                  </Text>
                </View>
              </View>
              <Switch checked={breakingNews} onChange={setBreakingNews} />
            </View>
          </View>

          {/* Delete Account Card */}
          <View style={[styles.deleteAccountCard, { backgroundColor: isDark ? '#3D1C1B' : '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deleteTitle}>Delete Account</Text>
              <Text style={[styles.deleteSub, { color: c.muted }]}>
                Permanently delete your account and all your data.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                if (onNotification) onNotification('Delete Account confirmation');
              }}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>Delete Account</Text>
            </Pressable>
          </View>
        </View>

        {/* Right Column: Account Summary, Data & Privacy, Need Help */}
        <View style={[styles.col, isWide && styles.colRight]}>
          {/* Account Summary Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Account Summary</Text>

            <View style={styles.accountHeaderRow}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>SP</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.accountName, { color: c.ink }]}>Sid Patil</Text>
                <Text style={[styles.accountEmail, { color: c.muted }]}>sidpatil@gmail.com</Text>
                <View style={styles.freePlanBadge}>
                  <Text style={styles.freePlanText}>Free Plan</Text>
                </View>
              </View>
            </View>

            <View style={[styles.accountStatsList, { borderTopColor: c.borderLight }]}>
              <View style={styles.accountStatRow}>
                <Text style={[styles.accountStatLabel, { color: c.muted }]}>Member Since</Text>
                <Text style={[styles.accountStatVal, { color: c.ink }]}>May 12, 2024</Text>
              </View>
              <View style={styles.accountStatRow}>
                <Text style={[styles.accountStatLabel, { color: c.muted }]}>Locations Saved</Text>
                <Text style={[styles.accountStatVal, { color: c.ink }]}>5</Text>
              </View>
              <View style={styles.accountStatRow}>
                <Text style={[styles.accountStatLabel, { color: c.muted }]}>Conversations</Text>
                <Text style={[styles.accountStatVal, { color: c.ink }]}>48</Text>
              </View>
              <View style={styles.accountStatRow}>
                <Text style={[styles.accountStatLabel, { color: c.muted }]}>Alerts Set</Text>
                <Text style={[styles.accountStatVal, { color: c.ink }]}>3</Text>
              </View>
            </View>
          </View>

          {/* Data & Privacy Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.privacyHeaderRow}>
              <Text style={styles.privacyIcon}>🛡️</Text>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Data & Privacy</Text>
            </View>
            <Text style={[styles.privacySub, { color: c.muted }]}>
              We respect your privacy and keep your data secure.
            </Text>

            <View style={styles.linksList}>
              {['Manage Data', 'Download My Data', 'Privacy Policy', 'Terms of Service'].map(link => (
                <Pressable
                  key={link}
                  style={[styles.linkRow, { borderBottomColor: c.borderLight }]}
                >
                  <Text style={[styles.linkText, { color: c.inkSecondary }]}>{link}</Text>
                  <Text style={[styles.linkChevron, { color: c.muted }]}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Need Help? Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.privacyHeaderRow}>
              <Text style={styles.privacyIcon}>🎧</Text>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Need Help?</Text>
            </View>
            <Text style={[styles.privacySub, { color: c.muted }]}>
              We're here to help you with any questions.
            </Text>

            <View style={styles.linksList}>
              {['Help Center', 'Contact Support', 'Send Feedback'].map(link => (
                <Pressable
                  key={link}
                  style={[styles.linkRow, { borderBottomColor: c.borderLight }]}
                >
                  <Text style={[styles.linkText, { color: c.blue }]}>{link}</Text>
                  <Text style={[styles.linkChevron, { color: c.blue }]}>↗</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 36,
    gap: 12
  },
  tabsRow: {
    gap: 8,
    paddingBottom: 2
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600'
  },
  tabTextActive: {
    fontWeight: '800'
  },
  mainGrid: {
    gap: 12
  },
  mainGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  col: {
    gap: 12
  },
  colLeft: {
    flex: 7
  },
  colRight: {
    flex: 5
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  settingIcon: {
    fontSize: 16
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  settingSub: {
    fontSize: 10,
    marginTop: 2
  },
  smallActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  smallActionBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  dropdownPillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  chevron: {
    fontSize: 10
  },
  deleteAccountCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  deleteTitle: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800'
  },
  deleteSub: {
    fontSize: 10,
    marginTop: 2
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800'
  },
  accountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  accountAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  accountName: {
    fontSize: 14,
    fontWeight: '800'
  },
  accountEmail: {
    fontSize: 11,
    marginTop: 1
  },
  freePlanBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  freePlanText: {
    color: '#2563EB',
    fontSize: 9,
    fontWeight: '800'
  },
  accountStatsList: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1
  },
  accountStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  accountStatLabel: {
    fontSize: 11
  },
  accountStatVal: {
    fontSize: 11,
    fontWeight: '800'
  },
  privacyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  privacyIcon: {
    fontSize: 16
  },
  privacySub: {
    fontSize: 10
  },
  linksList: {
    gap: 2,
    marginTop: 4
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  linkText: {
    fontSize: 11,
    fontWeight: '600'
  },
  linkChevron: {
    fontSize: 14
  }
});
