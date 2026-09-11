import React from 'react'
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native'
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  MessageSquare,
  Menu
} from 'lucide-react-native'
import { getColors } from '../theme/colors'

export function BottomNav ({
  currentScreen,
  onNavigate,
  onOpenMenu,
  isDark = false,
  alertCount = 0
}) {
  const c = getColors(isDark)

  const TABS = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard
    },
    {
      id: 'weather-map',
      label: 'Radar Map',
      icon: Map
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : null
    },
    {
      id: 'chat',
      label: 'WeatherGPT',
      icon: MessageSquare
    },
    {
      id: 'menu',
      label: 'More',
      icon: Menu,
      isAction: true
    }
  ]

  const handlePress = tab => {
    if (tab.isAction) {
      if (onOpenMenu) onOpenMenu()
    } else {
      if (onNavigate) onNavigate(tab.id)
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(18, 19, 22, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          borderTopColor: c.borderHighlight || c.border
        }
      ]}
    >
      {TABS.map(tab => {
        const IconComponent = tab.icon
        const isActive = !tab.isAction && currentScreen === tab.id

        return (
          <Pressable
            key={tab.id}
            onPress={() => handlePress(tab)}
            style={({ pressed }) => [
              styles.tabItem,
              isActive && {
                backgroundColor: isDark
                  ? 'rgba(59, 130, 246, 0.12)'
                  : 'rgba(37, 99, 235, 0.08)',
                borderRadius: 12
              },
              pressed && styles.tabItemPressed
            ]}
            accessibilityRole='button'
            accessibilityLabel={tab.label}
          >
            <View style={styles.iconWrapper}>
              <IconComponent
                size={22}
                color={isActive ? c.blue : c.muted}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              {tab.badge ? (
                <View style={[styles.badge, { backgroundColor: c.accentRed }]}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? c.blue : c.muted,
                  fontWeight: isActive ? '700' : '500'
                }
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: c.blue }
                ]}
              />
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: Platform.OS === 'ios' ? 76 : 64,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,
    paddingTop: 8,
    borderTopWidth: 1,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative'
  },
  tabItemPressed: {
    opacity: 0.7
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 26
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.1
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 16,
    height: 3,
    borderRadius: 2
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
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
  }
})

export default BottomNav
