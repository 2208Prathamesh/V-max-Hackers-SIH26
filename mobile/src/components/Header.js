import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView
} from 'react-native'
import {
  Menu,
  Globe,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Check,
  X,
  User,
  LogOut,
  Settings,
  ShieldAlert
} from 'lucide-react-native'
import { getColors } from '../theme/colors'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
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
          subtitle: 'Live radar, satellite & atmospheric layers'
        }
      case 'chat':
        return {
          title: 'WeatherGPT AI',
          subtitle: 'Natural language meteorologist assistant'
        }
      case 'alerts':
        return {
          title: 'Disaster Bulletins',
          subtitle: 'CAP v1.2 Standard Severe Early Warnings'
        }
      case 'forecast':
        return {
          title: 'NWP Forecast',
          subtitle: '7-day precision meteorological outlook'
        }
      case 'history':
        return {
          title: 'Query Archive',
          subtitle: 'Past AI weather discussions & recommendations'
        }
      case 'saved-locations':
        return {
          title: 'Saved Locations',
          subtitle: 'Real-time telemetry for pinned regions'
        }
      case 'air-quality':
        return {
          title: 'Air Quality Index',
          subtitle: 'Live PM2.5, PM10 sensor telemetry'
        }
      case 'compare':
        return {
          title: 'Compare Cities',
          subtitle: 'Multi-station meteorological telemetry'
        }
      case 'add-location':
        return {
          title: 'Add Location',
          subtitle: 'Bookmark stations and monitoring sites'
        }
      case 'alert-details':
        return {
          title: 'Emergency Advisory',
          subtitle: 'Official disaster authority SOP guidelines'
        }
      case 'premium':
        return {
          title: 'WeatherGPT Pro',
          subtitle: 'Doppler station feeds & automated SMS broadcast'
        }
      case 'profile':
        return {
          title: 'My Profile',
          subtitle: 'Disaster responder tier & preferences'
        }
      case 'aviation':
        return {
          title: 'Aviation METAR',
          subtitle: 'Aerodrome weather & runway vector crosswinds'
        }
      case 'marine':
        return {
          title: 'Marine & Coastal',
          subtitle: 'INCOIS sea state, wave heights & swell alerts'
        }
      case 'urban-flood':
        return {
          title: 'Urban Flash Flood',
          subtitle: 'Catchment saturation & road choke-point telemetry'
        }
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Preferences, sensor units & telemetry protocol'
        }
      case 'dashboard':
      default:
        return {
          title: 'WeatherGPT',
          subtitle: 'Precision meteorological intelligence & real-time radar'
        }
    }
  }

  const pageInfo = getPageInfo()
  const currentLangObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <View
      style={[
        styles.headerRoot,
        {
          backgroundColor: isDark ? 'rgba(18, 19, 22, 0.82)' : 'rgba(255, 255, 255, 0.85)',
          borderBottomColor: c.border
        }
      ]}
    >
      {/* Left side: Hamburger menu button + Title */}
      <View style={styles.leftSection}>
        <Pressable
          onPress={onOpenMenu}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: isDark ? 'rgba(24, 26, 32, 0.65)' : 'rgba(241, 243, 245, 0.75)',
              borderColor: c.border,
              borderTopColor: c.borderHighlight
            },
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='Open navigation drawer'
        >
          <Menu size={20} color={c.ink} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.titleWrapper}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.pageTitle, { color: c.ink }]} numberOfLines={1}>
              {pageInfo.title}
            </Text>
            <View
              style={[
                styles.livePulsePill,
                {
                  backgroundColor: c.liveGreenBg,
                  borderColor: 'rgba(16, 185, 129, 0.3)'
                }
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: c.liveGreen }]} />
              <Text style={[styles.liveText, { color: c.liveGreen }]}>
                LIVE
              </Text>
            </View>
          </View>
          <Text
            style={[styles.pageSubtitle, { color: c.muted }]}
            numberOfLines={1}
          >
            {pageInfo.subtitle}
          </Text>
        </View>
      </View>

      {/* Right side quick action controls */}
      <View style={styles.rightSection}>
        {/* Language selector button */}
        <Pressable
          onPress={() => setIsLangOpen(!isLangOpen)}
          style={({ pressed }) => [
            styles.langButton,
            {
              backgroundColor: isDark ? 'rgba(24, 26, 32, 0.65)' : 'rgba(241, 243, 245, 0.75)',
              borderColor: c.border,
              borderTopColor: c.borderHighlight
            },
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='Change language'
        >
          <Globe size={15} color={c.inkSecondary} />
          <Text style={[styles.langText, { color: c.inkSecondary }]}>
            {currentLangObj.code.toUpperCase()}
          </Text>
          <ChevronDown size={13} color={c.muted} />
        </Pressable>

        {/* Theme Toggle Button */}
        <Pressable
          onPress={onToggleTheme}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: isDark ? 'rgba(24, 26, 32, 0.65)' : 'rgba(241, 243, 245, 0.75)',
              borderColor: c.border,
              borderTopColor: c.borderHighlight
            },
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='Toggle theme'
        >
          {isDark ? (
            <Sun size={18} color='#F59E0B' />
          ) : (
            <Moon size={18} color='#3B82F6' />
          )}
        </Pressable>

        {/* Notifications Bell */}
        <Pressable
          onPress={() => {
            if (onNavigate) onNavigate('alerts')
          }}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: isDark ? 'rgba(24, 26, 32, 0.65)' : 'rgba(241, 243, 245, 0.75)',
              borderColor: c.border,
              borderTopColor: c.borderHighlight
            },
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='View alerts'
        >
          <Bell size={18} color={c.inkSecondary} />
          {alerts.length > 0 && (
            <View style={[styles.badge, { backgroundColor: c.accentRed }]}>
              <Text style={styles.badgeText}>{alerts.length}</Text>
            </View>
          )}
        </Pressable>

        {/* Profile Avatar Button */}
        <Pressable
          onPress={() => setIsProfileOpen(true)}
          style={({ pressed }) => [
            styles.avatarButton,
            {
              backgroundColor: isDark ? 'rgba(24, 26, 32, 0.65)' : 'rgba(241, 243, 245, 0.75)',
              borderColor: c.border,
              borderTopColor: c.borderHighlight
            },
            pressed && styles.buttonPressed
          ]}
          accessibilityLabel='User Profile'
        >
          <View style={[styles.avatarInner, { backgroundColor: c.blue }]}>
            <Text style={styles.avatarInitials}>WG</Text>
          </View>
        </Pressable>
      </View>

      {/* Language Selection Modal */}
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
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.dropdownHeader, { color: c.muted }]}>
                SELECT LANGUAGE
              </Text>
              <Pressable onPress={() => setIsLangOpen(false)} hitSlop={10}>
                <X size={16} color={c.muted} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 280 }}>
              {LANGUAGES.map(lang => {
                const isSelected = language === lang.code
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => {
                      onSelectLanguage && onSelectLanguage(lang.code)
                      setIsLangOpen(false)
                    }}
                    style={({ pressed }) => [
                      styles.langOption,
                      isSelected && { backgroundColor: c.blueLight },
                      pressed && styles.buttonPressed
                    ]}
                  >
                    <Text
                      style={[
                        styles.langOptionText,
                        { color: isSelected ? c.blue : c.ink },
                        isSelected && { fontWeight: '700' }
                      ]}
                    >
                      {lang.label}
                    </Text>
                    {isSelected && <Check size={16} color={c.blue} />}
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Profile Quick Menu Modal */}
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
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <View style={styles.profileHeader}>
              <View style={[styles.avatarBig, { backgroundColor: c.blue }]}>
                <Text style={styles.avatarBigText}>WG</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileName, { color: c.ink }]}>
                  Disaster Operations
                </Text>
                <Text style={[styles.profileEmail, { color: c.muted }]}>
                  command@weathergpt.gov.in
                </Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: c.borderLight }]} />

            <Pressable
              onPress={() => {
                setIsProfileOpen(false)
                if (onNavigate) onNavigate('profile')
              }}
              style={styles.menuItem}
            >
              <User size={18} color={c.inkSecondary} />
              <Text style={[styles.menuItemText, { color: c.ink }]}>
                Responder Profile & Tier
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsProfileOpen(false)
                if (onNavigate) onNavigate('settings')
              }}
              style={styles.menuItem}
            >
              <Settings size={18} color={c.inkSecondary} />
              <Text style={[styles.menuItemText, { color: c.ink }]}>
                System Settings
              </Text>
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: c.borderLight }]} />

            <Pressable
              onPress={() => {
                setIsProfileOpen(false)
                if (onLogout) onLogout()
              }}
              style={styles.menuItem}
            >
              <LogOut size={18} color={c.accentRed} />
              <Text style={[styles.menuItemText, { color: c.accentRed }]}>
                Sign Out
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  headerRoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    zIndex: 50
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  buttonPressed: {
    opacity: 0.7
  },
  titleWrapper: {
    marginLeft: 12,
    flex: 1
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2
  },
  livePulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
    borderWidth: 1
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  pageSubtitle: {
    fontSize: 11,
    marginTop: 1
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 38,
    borderRadius: 10,
    borderWidth: 1
  },
  langText: {
    fontSize: 11,
    fontWeight: '700'
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2
  },
  avatarInner: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  dropdownHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4
  },
  langOptionText: {
    fontSize: 14
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14
  },
  avatarBig: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarBigText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700'
  },
  profileEmail: {
    fontSize: 11,
    marginTop: 2
  },
  menuDivider: {
    height: 1,
    marginVertical: 8
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600'
  }
})

export default Header
