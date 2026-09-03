import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { getColors } from '../theme/colors'
import { alertsData } from '../data/mockData'
import { api } from '../services/api'

const TABS = ['All Alerts', 'Active (3)', 'Warnings', 'Watch']

export function AlertsScreen ({
  isDark = false,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const [activeTab, setActiveTab] = useState('All Alerts')
  const [liveAlerts, setLiveAlerts] = useState([])

  useEffect(() => {
    if (!backendReady) return

    let isMounted = true
    api
      .alerts()
      .then(result => {
        if (!isMounted) return
        setLiveAlerts(Array.isArray(result) ? result : [])
      })
      .catch(() => {
        if (!isMounted) return
        setLiveAlerts([])
      })

    return () => {
      isMounted = false
    }
  }, [backendReady])

  const visibleAlerts = liveAlerts.length > 0 ? liveAlerts : alertsData

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Tabs */}
      <View
        style={[
          styles.tabsRow,
          { backgroundColor: c.card, borderBottomColor: c.border }
        ]}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: c.blue, borderBottomWidth: 2 }
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
      </View>

      {/* Active Alerts Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>
          Active Bulletins <Text style={{ color: c.muted }}>(3)</Text>
        </Text>
        <Text style={[styles.sectionAction, { color: c.blue }]}>Refresh</Text>
      </View>

      {/* Alert Cards */}
      {visibleAlerts.map(alert => (
        <View
          key={alert.id || alert._id || alert.title}
          style={[
            styles.alertCard,
            {
              backgroundColor: c.card,
              borderColor: `${alert.color || '#F59E0B'}50`
            }
          ]}
        >
          <View
            style={[
              styles.alertIconBadge,
              { backgroundColor: `${alert.color || '#F59E0B'}20` }
            ]}
          >
            <Text
              style={[
                styles.alertIconText,
                { color: alert.color || '#F59E0B' }
              ]}
            >
              {alert.icon || '⚠️'}
            </Text>
          </View>

          <View style={styles.alertCardCopy}>
            <Text
              style={[
                styles.alertCardTitle,
                { color: alert.color || '#F59E0B' }
              ]}
            >
              {alert.title}
            </Text>
            <Text style={[styles.alertCardLocation, { color: c.ink }]}>
              {alert.location || alert.area || 'Regional weather alert'}
            </Text>
            <Text style={[styles.alertCardTime, { color: c.muted }]}>
              {alert.time || alert.startTime || 'Live alert'}
            </Text>
            <Text style={[styles.alertCardDetail, { color: c.inkSecondary }]}>
              {alert.detail ||
                alert.message ||
                'Severe weather advisory in effect.'}
            </Text>

            <View style={[styles.metaRow, { borderTopColor: c.borderLight }]}>
              <Text style={[styles.metaLabel, { color: c.muted }]}>
                Severity:{' '}
                <Text
                  style={{ color: alert.color || '#F59E0B', fontWeight: '800' }}
                >
                  {alert.severity || 'Moderate'}
                </Text>
              </Text>
              <Text style={[styles.metaLabel, { color: c.muted }]}>
                Probability:{' '}
                <Text style={[styles.metaValue, { color: c.ink }]}>
                  {alert.probability || 'High'}
                </Text>
              </Text>
              <Pressable
                onPress={() =>
                  onNotification &&
                  onNotification(`Advisory details for ${alert.title}`)
                }
                style={[
                  styles.viewDetailsBtn,
                  { borderColor: alert.color || '#F59E0B' }
                ]}
              >
                <Text
                  style={[
                    styles.viewDetailsText,
                    { color: alert.color || '#F59E0B' }
                  ]}
                >
                  View details →
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}

      {/* Recent Alerts List */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>
          Recent Bulletins
        </Text>
        <Text style={[styles.sectionAction, { color: c.blue }]}>Archive</Text>
      </View>

      <View
        style={[
          styles.recentCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        {[
          {
            title: 'Thunderstorm with Lightning',
            loc: 'Nashik, Maharashtra',
            type: 'Advisory'
          },
          {
            title: 'Moderate Rainfall Warning',
            loc: 'Aurangabad, Maharashtra',
            type: 'Information'
          }
        ].map((item, idx) => (
          <View
            key={item.title}
            style={[
              styles.recentRow,
              { borderBottomColor: c.borderLight },
              idx === 1 && { borderBottomWidth: 0 }
            ]}
          >
            <Text style={[styles.recentRowPin, { color: c.blue }]}>📍</Text>
            <View style={styles.recentRowCopy}>
              <Text style={[styles.recentRowTitle, { color: c.ink }]}>
                {item.title}
              </Text>
              <Text style={[styles.recentRowLoc, { color: c.muted }]}>
                {item.loc}
              </Text>
            </View>
            <View style={[styles.tagBadge, { backgroundColor: c.blueLight }]}>
              <Text style={[styles.tagText, { color: c.blue }]}>
                {item.type}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 14
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 6
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    fontWeight: '800'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  sectionAction: {
    fontSize: 11,
    fontWeight: '700'
  },
  alertCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  alertIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  alertIconText: {
    fontSize: 20,
    fontWeight: '900'
  },
  alertCardCopy: {
    flex: 1
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  alertCardLocation: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  alertCardTime: {
    fontSize: 9,
    marginTop: 2
  },
  alertCardDetail: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1
  },
  metaLabel: {
    fontSize: 10
  },
  metaValue: {
    fontWeight: '800'
  },
  viewDetailsBtn: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  viewDetailsText: {
    fontSize: 10,
    fontWeight: '800'
  },
  recentCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10
  },
  recentRowPin: {
    fontSize: 14
  },
  recentRowCopy: {
    flex: 1
  },
  recentRowTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  recentRowLoc: {
    fontSize: 10,
    marginTop: 2
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700'
  }
})
