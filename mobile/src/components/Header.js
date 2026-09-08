import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView
} from 'react-native'
import { getColors } from '../theme/colors'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' }
]

export function Header ({
  currentScreen,
  isDark,
  onToggleTheme,
  onOpenMenu,
  onNavigate,
  onLogout,
  language = 'en',
  onSelectLanguage,
  alerts = []
}) {
  const c = getColors(isDark)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const getPageInfo = () => {
    switch (currentScreen) {
      case 'weather-map':
        return {
          title: 'Weather Map',
          subtitle: 'Explore real-time weather conditions across India'
        }
      case 'chat':
        return {
          title: 'Chat with WeatherGPT',
          subtitle: 'Ask anything about weather in natural language'
        }
      case 'alerts':
        return {
          title: 'Active Weather Alerts',
          subtitle: 'Real-time severe warnings & radar bulletins'
        }
      case 'forecast':
        return {
          title: 'Extended Forecast',
          subtitle: '7-day precision meteorological outlook'
        }
      case 'history':
        return {
          title: 'Conversation History',
          subtitle: 'Archive of past weather queries & AI advice'
        }
      case 'saved-locations':
        return {
          title: 'Saved Locations',
          subtitle: 'Live weather updates for your bookmarked places'
        }
      case 'air-quality':
        return {
          title: 'Air Quality Index',
          subtitle: 'Live atmospheric sensor readings & pollutant levels'
        }
      case 'compare':
        return {
          title: 'Compare Locations',
          subtitle: 'Side-by-side multi-city meteorological comparison'
        }
      case 'add-location':
        return {
          title: 'Add New Location',
          subtitle: 'Search and bookmark cities across India'
        }
      case 'alert-details':
        return {
          title: 'Emergency Alert Bulletin',
          subtitle: 'Official IMD warning & precautionary guidelines'
        }
      case 'premium':
        return {
          title: 'WeatherGPT Pro',
          subtitle: 'Upgrade for advanced Doppler radar & SMS alerts'
        }
      case 'profile':
        return {
          title: 'User Profile',
          subtitle: 'Account details, tier & saved preferences'
        }
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Manage preferences, units & account'
        }
      case 'dashboard':
      default:
        return {
          title: 'GOOD MORNING, SID',
          subtitle: 'Your day in the sky'
        }
    }
  }

  const pageInfo = getPageInfo()
  const currentLangLabel =
    LANGUAGES.find(l => l.code === language)?.label || 'English'

  return (
    <View
      style={[
        styles.headerRoot,
        { backgroundColor: c.card, borderBottomColor: c.border }
      ]}
    >
      {/* Left side: Menu hamburger button + Page Title/Greeting */}
      <View style={styles.leftSection}>
        <Pressable
          onPress={onOpenMenu}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: c.cardAlt, borderColor: c.border },
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='Open navigation menu'
        >
          <Text style={[styles.menuIconText, { color: c.ink }]}>☰</Text>
        </Pressable>

        <View style={styles.titleWrapper}>
          {currentScreen === 'dashboard' ? (
            <>
              <Text style={[styles.dashboardGreeting, { color: c.blue }]}>
                {pageInfo.title}
              </Text>
              <Text
                style={[styles.pageTitle, { color: c.ink }]}
                numberOfLines={1}
              >
                {pageInfo.subtitle}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[styles.pageTitle, { color: c.ink }]}
                numberOfLines={1}
              >
                {pageInfo.title}
              </Text>
              <Text
                style={[styles.pageSubtitle, { color: c.muted }]}
                numberOfLines={1}
              >
                {pageInfo.subtitle}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Right side action icons matching UI screenshot */}
      <View style={styles.rightSection}>
        {/* Language selector button */}
        <Pressable
          onPress={() => setIsLangOpen(!isLangOpen)}
          style={({ pressed }) => [
            styles.langButton,
            { backgroundColor: c.cardAlt, borderColor: c.border },
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.globeIcon}>🌐</Text>
          <Text style={[styles.langText, { color: c.inkSecondary }]}>
            {language === 'en' ? 'English' : currentLangLabel.split(' ')[0]}
          </Text>
          <Text style={[styles.chevronText, { color: c.muted }]}>▾</Text>
        </Pressable>

        {/* Theme Toggle Button */}
        <Pressable
          onPress={onToggleTheme}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: c.cardAlt, borderColor: c.border },
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='Toggle Dark / Light Theme'
        >
          <Text style={styles.themeIconText}>{isDark ? '☀️' : '🌙'}</Text>
        </Pressable>

        {/* Notifications Bell Button */}
        <Pressable
          onPress={() => setIsAlertsOpen(!isAlertsOpen)}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: c.cardAlt, borderColor: c.border },
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='Notifications'
        >
          <Text style={[styles.bellIconText, { color: c.inkSecondary }]}>
            🔔
          </Text>
          {alerts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{alerts.length}</Text>
            </View>
          )}
        </Pressable>

        {/* User Profile Avatar */}
        <Pressable
          onPress={() => setIsProfileOpen(!isProfileOpen)}
          style={({ pressed }) => [
            styles.avatarButton,
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='Profile Menu'
        >
          <Text style={styles.avatarText}>SP</Text>
        </Pressable>
      </View>

      {/* Language Modal / Dropdown */}
      {isLangOpen && (
        <Modal
          transparent
          animationType='fade'
          visible={isLangOpen}
          onRequestClose={() => setIsLangOpen(false)}
        >
          <Pressable
            style={styles.modalScrim}
            onPress={() => setIsLangOpen(false)}
          >
            <View
              style={[
                styles.dropdownCard,
                styles.langDropdown,
                { backgroundColor: c.card, borderColor: c.border }
              ]}
            >
              <Text style={[styles.dropdownHeader, { color: c.muted }]}>
                SELECT LANGUAGE
              </Text>
              {LANGUAGES.map(lang => (
                <Pressable
                  key={lang.code}
                  onPress={() => {
                    onSelectLanguage && onSelectLanguage(lang.code)
                    setIsLangOpen(false)
                  }}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    language === lang.code && { backgroundColor: c.blueLight },
                    pressed && styles.buttonPressed
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: language === lang.code ? c.blue : c.ink }
                    ]}
                  >
                    {lang.label}
                  </Text>
                  {language === lang.code && (
                    <Text style={{ color: c.blue, fontWeight: '700' }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Quick Alerts Dropdown Modal */}
      {isAlertsOpen && (
        <Modal
          transparent
          animationType='fade'
          visible={isAlertsOpen}
          onRequestClose={() => setIsAlertsOpen(false)}
        >
          <Pressable
            style={styles.modalScrim}
            onPress={() => setIsAlertsOpen(false)}
          >
            <View
              style={[
                styles.dropdownCard,
                styles.alertsDropdown,
                { backgroundColor: c.card, borderColor: c.border }
              ]}
            >
              <View style={styles.alertsModalHeader}>
                <Text style={[styles.alertsModalTitle, { color: c.ink }]}>
                  Active Alerts ({alerts.length})
                </Text>
                <Pressable
                  onPress={() => {
                    setIsAlertsOpen(false)
                    onNavigate && onNavigate('alerts')
                  }}
                >
                  <Text style={[styles.viewAllLink, { color: c.blue }]}>
                    View all
                  </Text>
                </Pressable>
              </View>
              <ScrollView style={{ maxHeight: 220 }}>
                {alerts.map(alt => (
                  <Pressable
                    key={alt.id}
                    onPress={() => {
                      setIsAlertsOpen(false)
                      onNavigate && onNavigate('alerts')
                    }}
                    style={[
                      styles.alertSummaryItem,
                      { borderBottomColor: c.borderLight }
                    ]}
                  >
                    <View
                      style={[styles.alertDot, { backgroundColor: alt.color }]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.alertSummaryTitle, { color: c.ink }]}
                        numberOfLines={1}
                      >
                        {alt.title}
                      </Text>
                      <Text
                        style={[styles.alertSummarySub, { color: c.muted }]}
                      >
                        {alt.location}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Profile Menu Dropdown Modal */}
      {isProfileOpen && (
        <Modal
          transparent
          animationType='fade'
          visible={isProfileOpen}
          onRequestClose={() => setIsProfileOpen(false)}
        >
          <Pressable
            style={styles.modalScrim}
            onPress={() => setIsProfileOpen(false)}
          >
            <View
              style={[
                styles.dropdownCard,
                styles.profileDropdown,
                { backgroundColor: c.card, borderColor: c.border }
              ]}
            >
              <View
                style={[
                  styles.profileHeader,
                  { borderBottomColor: c.borderLight }
                ]}
              >
                <Text style={[styles.profileName, { color: c.ink }]}>
                  Sid Patil
                </Text>
                <Text style={[styles.profileEmail, { color: c.muted }]}>
                  sidpatil@gmail.com
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setIsProfileOpen(false)
                  onNavigate && onNavigate('profile')
                }}
                style={styles.dropdownItem}
              >
                <Text style={[styles.dropdownItemText, { color: c.ink }]}>
                  👤 My Profile
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsProfileOpen(false)
                  onNavigate && onNavigate('premium')
                }}
                style={styles.dropdownItem}
              >
                <Text style={[styles.dropdownItemText, { color: '#F59E0B', fontWeight: '700' }]}>
                  👑 Upgrade to Pro
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsProfileOpen(false)
                  onNavigate && onNavigate('settings')
                }}
                style={styles.dropdownItem}
              >
                <Text style={[styles.dropdownItemText, { color: c.ink }]}>
                  ⚙️ Account Settings
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsProfileOpen(false)
                  onToggleTheme && onToggleTheme()
                }}
                style={styles.dropdownItem}
              >
                <Text style={[styles.dropdownItemText, { color: c.ink }]}>
                  {isDark ? '☀️  Light Theme' : '🌙  Dark Theme'}
                </Text>
              </Pressable>

              <View
                style={[styles.divider, { backgroundColor: c.borderLight }]}
              />

              <Pressable
                onPress={() => {
                  setIsProfileOpen(false)
                  onLogout && onLogout()
                }}
                style={styles.dropdownItem}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    { color: '#EF4444', fontWeight: '700' }
                  ]}
                >
                  🚪 Sign Out
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  headerRoot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  buttonPressed: {
    opacity: 0.75
  },
  menuIconText: {
    fontSize: 18,
    fontWeight: '800'
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  dashboardGreeting: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 2
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  pageSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 11,
    borderWidth: 1
  },
  globeIcon: {
    fontSize: 12
  },
  langText: {
    fontSize: 11,
    fontWeight: '600'
  },
  chevronText: {
    fontSize: 10,
    marginLeft: 1
  },
  themeIconText: {
    fontSize: 15
  },
  bellIconText: {
    fontSize: 15
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 65,
    paddingRight: 16
  },
  dropdownCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  langDropdown: {
    width: 180
  },
  alertsDropdown: {
    width: 270
  },
  profileDropdown: {
    width: 210
  },
  dropdownHeader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '600'
  },
  alertsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    marginBottom: 4
  },
  alertsModalTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  viewAllLink: {
    fontSize: 11,
    fontWeight: '700'
  },
  alertSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  alertSummaryTitle: {
    fontSize: 11,
    fontWeight: '700'
  },
  alertSummarySub: {
    fontSize: 9
  },
  profileHeader: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    marginBottom: 4
  },
  profileName: {
    fontSize: 13,
    fontWeight: '800'
  },
  profileEmail: {
    fontSize: 10
  },
  divider: {
    height: 1,
    marginVertical: 4
  }
})
