import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal } from 'react-native';
import { Brand } from './Brand';
import { Switch } from './Switch';
import { getColors } from '../theme/colors';
import { recentConversationsData } from '../data/mockData';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'alerts', label: 'Alerts', icon: '🔔', badge: '3' },
  { id: 'weather-map', label: 'Weather Map', icon: '🗺️' },
  { id: 'forecast', label: 'Forecast', icon: '📅' },
  { id: 'history', label: 'History', icon: '🕒' },
  { id: 'saved-locations', label: 'Saved Locations', icon: '⭐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

export function Sidebar({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  onLogout,
  isDark = false,
  onToggleTheme
}) {
  if (!isOpen) return null;

  const c = getColors(isDark);

  const handleItemPress = (screenId) => {
    onNavigate(screenId);
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop Scrim */}
        <Pressable
          style={[styles.scrim, { backgroundColor: c.scrim }]}
          onPress={onClose}
          accessibilityLabel="Close navigation drawer"
        />

        {/* Drawer Content */}
        <View style={[styles.drawer, { backgroundColor: c.card, borderRightColor: c.border }]}>
          {/* Header with Brand & Close Button */}
          <View style={[styles.drawerHeader, { borderBottomColor: c.borderLight }]}>
            <Brand isDark={isDark} />
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: c.cardAlt },
                pressed && styles.pressed
              ]}
              accessibilityLabel="Close drawer"
            >
              <Text style={[styles.closeIcon, { color: c.ink }]}>✕</Text>
            </Pressable>
          </View>

          {/* Scrollable Navigation Area */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Nav Items List */}
            <View style={styles.navList}>
              {NAV_ITEMS.map(item => {
                const isActive = currentScreen === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleItemPress(item.id)}
                    style={({ pressed }) => [
                      styles.navItem,
                      isActive && { backgroundColor: c.blueLight },
                      pressed && styles.pressed
                    ]}
                  >
                    <View style={styles.navItemLeft}>
                      <Text style={[styles.navIcon, isActive && { color: c.blue }]}>
                        {item.icon}
                      </Text>
                      <Text
                        style={[
                          styles.navLabel,
                          { color: isActive ? c.blue : c.inkSecondary },
                          isActive && styles.navLabelActive
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>

                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Recent Conversations */}
            <View style={[styles.sectionBlock, { borderTopColor: c.borderLight }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: c.muted }]}>
                  RECENT CONVERSATIONS
                </Text>
              </View>

              <View style={styles.recentChatsList}>
                {recentConversationsData.slice(0, 4).map(chat => (
                  <Pressable
                    key={chat.id}
                    onPress={() => handleItemPress('chat')}
                    style={({ pressed }) => [
                      styles.recentChatItem,
                      pressed && styles.pressed
                    ]}
                  >
                    <Text
                      style={[styles.recentChatTitle, { color: c.inkSecondary }]}
                      numberOfLines={1}
                    >
                      {chat.title}
                    </Text>
                    <Text style={[styles.recentChatTime, { color: c.mutedLight }]}>
                      {chat.time}
                    </Text>
                  </Pressable>
                ))}

                <Pressable
                  onPress={() => handleItemPress('history')}
                  style={styles.viewAllRow}
                >
                  <Text style={[styles.viewAllText, { color: c.blue }]}>View all →</Text>
                </Pressable>
              </View>
            </View>

            {/* Go Premium Card matching UI screenshot */}
            <View style={[styles.premiumCard, { backgroundColor: isDark ? '#261C14' : '#FFF9EB', borderColor: isDark ? '#4E3820' : '#FCE8BD' }]}>
              <View style={styles.premiumHeader}>
                <Text style={styles.crownIcon}>👑</Text>
                <Text style={[styles.premiumTitle, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                  Go Premium
                </Text>
              </View>
              <Text style={[styles.premiumBody, { color: isDark ? '#E2C799' : '#B45309' }]}>
                Unlock advanced maps, ad-free experience and exclusive alerts.
              </Text>
              <Pressable
                onPress={() => handleItemPress('settings')}
                style={({ pressed }) => [
                  styles.premiumButton,
                  pressed && styles.pressed
                ]}
              >
                <Text style={styles.premiumButtonText}>Upgrade Now</Text>
              </Pressable>
            </View>

            {/* Current Location Card matching Screenshot 1 */}
            <View style={[styles.currentLocCard, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
              <View style={styles.currentLocRow}>
                <Text style={[styles.currentLocPin, { color: c.blue }]}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.currentLocLabel, { color: c.muted }]}>Current Location</Text>
                  <Text style={[styles.currentLocCity, { color: c.ink }]}>Pune, Maharashtra</Text>
                  <Text style={[styles.changeLocLink, { color: c.blue }]}>Change Location</Text>
                </View>
              </View>
            </View>

            {/* Theme Toggle Row matching Screenshot 1 */}
            <View style={[styles.themeRow, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
              <View style={styles.themeRowLeft}>
                <Text style={styles.themeSunIcon}>☀️</Text>
                <Text style={[styles.themeRowLabel, { color: c.ink }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <Switch checked={!isDark} onChange={() => onToggleTheme && onToggleTheme()} />
            </View>
          </ScrollView>

          {/* User Profile Footer */}
          <View style={[styles.drawerFooter, { borderTopColor: c.borderLight, backgroundColor: c.cardAlt }]}>
            <View style={styles.userInfo}>
              <View style={styles.footerAvatar}>
                <Text style={styles.footerAvatarText}>SP</Text>
              </View>
              <View style={styles.userCopy}>
                <Text style={[styles.userName, { color: c.ink }]}>Sid Patil</Text>
                <Text style={[styles.userEmail, { color: c.muted }]}>sidpatil@gmail.com</Text>
              </View>
            </View>
            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressed
              ]}
              accessibilityLabel="Log out"
            >
              <Text style={styles.logoutIcon}>🚪</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
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
    width: 295,
    maxWidth: '85%',
    height: '100%',
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
    zIndex: 20
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeIcon: {
    fontSize: 13,
    fontWeight: '700'
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8
  },
  navList: {
    gap: 3
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  navIcon: {
    fontSize: 15
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  navLabelActive: {
    fontWeight: '800'
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  sectionBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1
  },
  sectionHeaderRow: {
    marginBottom: 6,
    paddingHorizontal: 4
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  recentChatsList: {
    gap: 2
  },
  recentChatItem: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 8
  },
  recentChatTitle: {
    fontSize: 11,
    fontWeight: '500'
  },
  recentChatTime: {
    fontSize: 8.5,
    marginTop: 1
  },
  viewAllRow: {
    paddingHorizontal: 6,
    paddingTop: 4
  },
  viewAllText: {
    fontSize: 10,
    fontWeight: '700'
  },
  premiumCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  crownIcon: {
    fontSize: 14
  },
  premiumTitle: {
    fontSize: 11,
    fontWeight: '800'
  },
  premiumBody: {
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 8
  },
  premiumButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  currentLocCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginTop: 4
  },
  currentLocRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6
  },
  currentLocPin: {
    fontSize: 14
  },
  currentLocLabel: {
    fontSize: 8.5,
    fontWeight: '700'
  },
  currentLocCity: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1
  },
  changeLocLink: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4
  },
  themeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  themeSunIcon: {
    fontSize: 15
  },
  themeRowLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  footerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  userCopy: {
    flex: 1
  },
  userName: {
    fontSize: 11,
    fontWeight: '800'
  },
  userEmail: {
    fontSize: 9.5
  },
  logoutButton: {
    padding: 6,
    borderRadius: 8
  },
  logoutIcon: {
    fontSize: 15
  },
  pressed: {
    opacity: 0.7
  }
});
