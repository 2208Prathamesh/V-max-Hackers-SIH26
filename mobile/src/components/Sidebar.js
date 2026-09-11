import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal
} from 'react-native'
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  MessageSquare,
  Plane,
  Anchor,
  Waves,
  Wind,
  Calendar,
  Clock,
  Star,
  ArrowLeftRight,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react-native'
import { Brand } from './Brand'
import { getColors } from '../theme/colors'

const SECTIONS = [
  {
    title: 'CORE PLATFORM',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'weather-map', label: 'Doppler Radar Map', icon: Map },
      { id: 'alerts', label: 'Disaster Bulletins', icon: AlertTriangle, badge: '3', badgeColor: '#EF4444' },
      { id: 'chat', label: 'WeatherGPT AI', icon: MessageSquare }
    ]
  },
  {
    title: 'EARLY WARNING SPECIALTIES',
    items: [
      { id: 'aviation', label: 'Aviation METAR', icon: Plane },
      { id: 'marine', label: 'Marine & Coastal', icon: Anchor },
      { id: 'urban-flood', label: 'Urban Flash Flood', icon: Waves },
      { id: 'air-quality', label: 'Air Quality Index', icon: Wind }
    ]
  },
  {
    title: 'FORECAST & TOOLS',
    items: [
      { id: 'forecast', label: '7-Day NWP Forecast', icon: Calendar },
      { id: 'compare', label: 'Compare Cities', icon: ArrowLeftRight },
      { id: 'saved-locations', label: 'Saved Locations', icon: Star },
      { id: 'history', label: '7-Day Offline Archive', icon: Clock }
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'settings', label: 'System Settings', icon: Settings }
    ]
  }
]

export function Sidebar ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  onLogout,
  isDark = false,
  onToggleTheme
}) {
  if (!isOpen) return null

  const c = getColors(isDark)

  const handleItemPress = screenId => {
    onNavigate(screenId)
    onClose()
  }

  return (
    <Modal
      transparent
      animationType='fade'
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop Scrim */}
        <Pressable
          style={[styles.scrim, { backgroundColor: c.scrim }]}
          onPress={onClose}
          accessibilityLabel='Close navigation drawer'
        />

        {/* Drawer Content */}
        <View
          style={[
            styles.drawer,
            {
              backgroundColor: isDark ? '#121316' : '#FFFFFF',
              borderRightColor: c.border
            }
          ]}
        >
          {/* Header with Brand & Close Button */}
          <View style={[styles.drawerHeader, { borderBottomColor: c.borderLight }]}>
            <Brand isDark={isDark} />
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: c.cardAlt, borderColor: c.border },
                pressed && styles.pressed
              ]}
              accessibilityLabel='Close drawer'
            >
              <X size={18} color={c.ink} />
            </Pressable>
          </View>

          {/* Authority Dispatch Tag */}
          <View
            style={[
              styles.authorityBar,
              { backgroundColor: c.cardAlt, borderColor: c.borderLight }
            ]}
          >
            <ShieldCheck size={14} color={c.blue} />
            <Text style={[styles.authorityText, { color: c.inkSecondary }]}>
              IMD & SDMA DISASTER OPERATIONS
            </Text>
          </View>

          {/* Scrollable Navigation Area */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {SECTIONS.map((sec, secIdx) => (
              <View key={sec.title} style={styles.sectionBlock}>
                <Text style={[styles.sectionHeading, { color: c.muted }]}>
                  {sec.title}
                </Text>

                {sec.items.map(item => {
                  const IconComp = item.icon
                  const isActive = currentScreen === item.id

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleItemPress(item.id)}
                      style={({ pressed }) => [
                        styles.navItem,
                        isActive && {
                          backgroundColor: c.blueLight,
                          borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.25)'
                        },
                        pressed && styles.pressed
                      ]}
                    >
                      <View style={styles.navItemLeft}>
                        <View
                          style={[
                            styles.iconPill,
                            isActive && { backgroundColor: c.blue }
                          ]}
                        >
                          <IconComp
                            size={18}
                            color={isActive ? '#FFFFFF' : c.inkSecondary}
                            strokeWidth={isActive ? 2.2 : 1.8}
                          />
                        </View>
                        <Text
                          style={[
                            styles.navLabel,
                            { color: isActive ? c.blue : c.ink },
                            isActive && styles.navLabelActive
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>

                      {item.badge ? (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: item.badgeColor || c.accentRed }
                          ]}
                        >
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      ) : (
                        <ChevronRight
                          size={14}
                          color={isActive ? c.blue : c.mutedLight}
                        />
                      )}
                    </Pressable>
                  )
                })}
              </View>
            ))}
          </ScrollView>

          {/* Drawer Footer with Theme & Logout */}
          <View
            style={[
              styles.drawerFooter,
              { borderTopColor: c.borderLight, backgroundColor: c.cardAlt }
            ]}
          >
            <View style={styles.footerRow}>
              <Pressable
                onPress={onToggleTheme}
                style={[
                  styles.footerActionBtn,
                  { backgroundColor: c.card, borderColor: c.border }
                ]}
              >
                {isDark ? (
                  <>
                    <Sun size={15} color='#F59E0B' />
                    <Text style={[styles.footerBtnText, { color: c.ink }]}>
                      Light Mode
                    </Text>
                  </>
                ) : (
                  <>
                    <Moon size={15} color='#3B82F6' />
                    <Text style={[styles.footerBtnText, { color: c.ink }]}>
                      Dark Mode
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={onLogout}
                style={[
                  styles.footerActionBtn,
                  { backgroundColor: c.card, borderColor: c.border }
                ]}
              >
                <LogOut size={15} color={c.accentRed} />
                <Text style={[styles.footerBtnText, { color: c.accentRed }]}>
                  Sign Out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row'
  },
  scrim: {
    ...StyleSheet.absoluteFillObject
  },
  drawer: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    borderRightWidth: 1,
    elevation: 24,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 4, height: 0 }
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pressed: {
    opacity: 0.7
  },
  authorityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  authorityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 20
  },
  sectionBlock: {
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingHorizontal: 6
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 2
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  iconPill: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '500'
  },
  navLabelActive: {
    fontWeight: '700'
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  drawerFooter: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8
  },
  footerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1
  },
  footerBtnText: {
    fontSize: 12,
    fontWeight: '600'
  }
})

export default Sidebar
