import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable
} from 'react-native'
import { getColors } from '../theme/colors'
import { api } from '../services/api'

export function ProfileScreen ({
  isDark = false,
  user,
  onNavigate,
  onLogout,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)

  const [name, setName] = useState(user?.name || 'Sid Patil')
  const [email, setEmail] = useState(user?.email || 'sidpatil@gmail.com')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const avatarInitials =
    name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'SP'

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      if (backendReady && api.updateProfile) {
        await api.updateProfile({ name, email })
      }
      setIsEditing(false)
      if (onNotification) {
        onNotification('Profile updated successfully!')
      }
    } catch {
      setIsEditing(false)
      if (onNotification) {
        onNotification('Profile updated locally!')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header Card */}
      <View
        style={[
          styles.profileHero,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{avatarInitials}</Text>
        </View>

        <Text style={[styles.userName, { color: c.ink }]}>{name}</Text>
        <Text style={[styles.userEmail, { color: c.muted }]}>{email}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.planBadge, { backgroundColor: '#F59E0B20' }]}>
            <Text style={styles.planBadgeText}>👑 Pro Member</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
            <Text style={styles.statusBadgeText}>● Active Session</Text>
          </View>
        </View>
      </View>

      {/* Account Stats Row */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <Text style={[styles.statNumber, { color: c.blue }]}>5</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>
            Saved Cities
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>24</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>AI Queries</Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <Text style={[styles.statNumber, { color: '#10B981' }]}>100%</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>IMD Sync</Text>
        </View>
      </View>

      {/* Personal Info Form */}
      <View
        style={[
          styles.formCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: c.ink }]}>
            Account Details
          </Text>
          <Pressable
            onPress={() => {
              if (isEditing) handleSaveProfile()
              else setIsEditing(true)
            }}
          >
            <Text style={[styles.editAction, { color: c.blue }]}>
              {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.fieldLabel, { color: c.muted }]}>FULL NAME</Text>
          {isEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              style={[
                styles.fieldInput,
                {
                  color: c.ink,
                  backgroundColor: c.cardAlt,
                  borderColor: c.border
                }
              ]}
            />
          ) : (
            <Text style={[styles.fieldValue, { color: c.ink }]}>{name}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.fieldLabel, { color: c.muted }]}>EMAIL</Text>
          {isEditing ? (
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              style={[
                styles.fieldInput,
                {
                  color: c.ink,
                  backgroundColor: c.cardAlt,
                  borderColor: c.border
                }
              ]}
            />
          ) : (
            <Text style={[styles.fieldValue, { color: c.ink }]}>{email}</Text>
          )}
        </View>
      </View>

      {/* Quick Shortcuts */}
      <View
        style={[
          styles.formCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.cardTitle, { color: c.ink, marginBottom: 8 }]}>
          Preferences & Controls
        </Text>

        <Pressable
          onPress={() => onNavigate && onNavigate('settings')}
          style={[styles.shortcutRow, { borderBottomColor: c.borderLight }]}
        >
          <Text style={styles.shortcutIcon}>⚙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.shortcutTitle, { color: c.ink }]}>
              Units & Formatting
            </Text>
            <Text style={[styles.shortcutSub, { color: c.muted }]}>
              Celsius / Fahrenheit, wind speed, pressure units
            </Text>
          </View>
          <Text style={[styles.shortcutChevron, { color: c.muted }]}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => onNavigate && onNavigate('premium')}
          style={[styles.shortcutRow, { borderBottomColor: c.borderLight }]}
        >
          <Text style={styles.shortcutIcon}>👑</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.shortcutTitle, { color: c.ink }]}>
              Subscription & Plan
            </Text>
            <Text style={[styles.shortcutSub, { color: c.muted }]}>
              Manage WeatherGPT Pro membership
            </Text>
          </View>
          <Text style={[styles.shortcutChevron, { color: c.muted }]}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => onNavigate && onNavigate('history')}
          style={styles.shortcutRow}
        >
          <Text style={styles.shortcutIcon}>🕒</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.shortcutTitle, { color: c.ink }]}>
              Chat Query History
            </Text>
            <Text style={[styles.shortcutSub, { color: c.muted }]}>
              View past conversations and radar inquiries
            </Text>
          </View>
          <Text style={[styles.shortcutChevron, { color: c.muted }]}>›</Text>
        </Pressable>
      </View>

      {/* Sign Out Button */}
      <Pressable
        onPress={onLogout}
        style={[styles.logoutBtn, { borderColor: '#EF4444' }]}
      >
        <Text style={styles.logoutBtnText}>🚪 Sign Out from Device</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 32, gap: 12 },
  profileHero: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center'
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  userName: { fontSize: 17, fontWeight: '900' },
  userEmail: { fontSize: 11, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  planBadgeText: { color: '#D97706', fontSize: 10, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: '#10B981', fontSize: 10, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center'
  },
  statNumber: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 9.5, fontWeight: '600', marginTop: 2 },
  formCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: { fontSize: 13, fontWeight: '800' },
  editAction: { fontSize: 11.5, fontWeight: '800' },
  formGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 8.5, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  fieldValue: { fontSize: 12, fontWeight: '600' },
  fieldInput: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  shortcutIcon: { fontSize: 18 },
  shortcutTitle: { fontSize: 11.5, fontWeight: '700' },
  shortcutSub: { fontSize: 9, marginTop: 1 },
  shortcutChevron: { fontSize: 18 },
  logoutBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  logoutBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '800' }
})
