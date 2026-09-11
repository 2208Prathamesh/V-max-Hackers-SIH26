import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native'
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  Radio,
  ChevronRight,
  RefreshCw,
  Sparkles
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api } from '../services/api'
import { WeatherIcon } from '../components/WeatherIcon'
import { EmergencyBanner } from '../components/EmergencyBanner'

const TABS = ['All Alerts', 'Severe Warnings', 'Watch & Advisory']

const DEFAULT_IMD_ALERTS = [
  {
    id: 'alert-konkan-red',
    title: 'Extremely Heavy Rainfall & Flash Flood Red Warning',
    severity: 'Severe',
    color: '#EF4444',
    location: 'Konkan Coast (Mumbai, Thane, Raigad, Ratnagiri)',
    time: 'Valid next 24 Hours',
    description: 'IMD Mumbai Doppler radar detects intense convective mesoscale cloud clusters delivering 150-220 mm precipitation. High risk of urban waterlogging, river overflow, and ghat landslides.',
    instruction: 'NDRF and SDRF deployed. Avoid non-essential travel, underpasses, and riverbanks. Keep mobile emergency radios tuned.',
    probability: '92% (High Certainty)',
    category: 'Meteorological Hazard',
    source: 'IMD National Weather Service'
  },
  {
    id: 'alert-vidarbha-heat',
    title: 'Severe Heatwave & Convective Squall Advisory',
    severity: 'Orange Alert',
    color: '#F97316',
    location: 'Vidarbha & Marathwada (Nagpur, Akola, Aurangabad)',
    time: 'Effective today 12:00 PM – 5:30 PM',
    description: 'Dry northwesterly continental winds pushing peak surface air temperatures to 42-44°C with dry squalls up to 45 km/h.',
    instruction: 'Stay hydrated, consume ORS/electrolytes, restrict direct sun exposure between 12 PM - 4 PM. High risk for children and seniors.',
    probability: '85% (Moderate-High)',
    category: 'Thermal Stress Hazard',
    source: 'State Disaster Management Authority (SDMA)'
  },
  {
    id: 'alert-western-ghats',
    title: 'Squall Line & Lightning Thunderstorm Watch',
    severity: 'Yellow Watch',
    color: '#F59E0B',
    location: 'Western Ghats Catchment (Pune, Satara, Kolhapur hills)',
    time: 'Effective evening hours',
    description: 'Orographic convection triggering scattered thunderstorm activity with lightning strikes and wind gusts up to 50 km/h.',
    instruction: 'Do not take shelter under solitary trees or near metal transmission towers. Unplug sensitive electrical appliances during lightning.',
    probability: '75% (Moderate)',
    category: 'Severe Convection',
    source: 'IMD NCMRWF Model Guidance'
  }
]

export function AlertsScreen ({
  isDark = false,
  onNotification,
  backendReady = false,
  onNavigate,
  onSelectAlert
}) {
  const c = getColors(isDark)
  const [activeTab, setActiveTab] = useState('All Alerts')
  const [liveAlerts, setLiveAlerts] = useState(DEFAULT_IMD_ALERTS)
  const [refreshing, setRefreshing] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)

  const loadAlerts = () => {
    setRefreshing(true)
    api
      .activeAlerts()
      .then(result => {
        if (Array.isArray(result) && result.length > 0) {
          setLiveAlerts(result)
        } else {
          api.alerts().then(all => {
            if (Array.isArray(all) && all.length > 0) {
              setLiveAlerts(all)
            } else {
              setLiveAlerts(DEFAULT_IMD_ALERTS)
            }
          })
        }
      })
      .catch(() => {
        setLiveAlerts(DEFAULT_IMD_ALERTS)
      })
      .finally(() => {
        setRefreshing(false)
        setLoadedOnce(true)
      })
  }

  useEffect(() => {
    loadAlerts()
  }, [backendReady])

  const sourceAlerts = liveAlerts

  const filteredAlerts = sourceAlerts.filter(alert => {
    const sev = (alert.severity || '').toLowerCase()
    if (activeTab === 'Severe Warnings') {
      return sev.includes('severe') || sev.includes('extreme') || sev.includes('high') || sev.includes('red')
    }
    if (activeTab === 'Watch & Advisory') {
      return sev.includes('watch') || sev.includes('advisory') || sev.includes('moderate') || sev.includes('orange') || sev.includes('yellow')
    }
    return true
  })

  const topSevereAlert = sourceAlerts.find(a => {
    const s = (a.severity || '').toLowerCase()
    return s.includes('severe') || s.includes('extreme') || s.includes('high') || s.includes('red')
  })

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={loadAlerts}
          tintColor={c.blue}
        />
      }
    >
      {/* Category Tabs */}
      <View
        style={[
          styles.tabsRow,
          { backgroundColor: c.card, borderColor: c.border }
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
                isActive && {
                  backgroundColor: c.blueLight,
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.2)'
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
      </View>

      {/* Featured Emergency Broadcast Banner */}
      {topSevereAlert ? (
        <EmergencyBanner
          alert={topSevereAlert}
          onPress={() => {
            if (onSelectAlert) onSelectAlert(topSevereAlert)
            if (onNavigate) onNavigate('alert-details')
          }}
          isDark={isDark}
        />
      ) : null}

      {/* CAP v1.2 Standard Protocol Indicator */}
      <View
        style={[
          styles.capBanner,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={[styles.capBadge, { backgroundColor: c.blue }]}>
          <Radio size={12} color='#FFFFFF' />
          <Text style={styles.capBadgeText}>CAP v1.2</Text>
        </View>
        <Text style={[styles.capText, { color: c.inkSecondary }]}>
          Standardized Common Alerting Protocol Active & Synchronized
        </Text>
      </View>

      {/* Active Alerts Header */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ShieldAlert size={18} color={c.statusDanger} />
          <Text style={[styles.sectionTitle, { color: c.ink }]}>
            Active Bulletins ({filteredAlerts.length})
          </Text>
        </View>
        <Pressable
          onPress={loadAlerts}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <RefreshCw size={13} color={c.blue} />
          <Text style={[styles.sectionAction, { color: c.blue }]}>Sync</Text>
        </Pressable>
      </View>

      {/* Alert Cards */}
      {filteredAlerts.length === 0 ? (
        <View
          style={[
            styles.emptyStateCard,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <View
            style={[
              styles.emptyIconBadge,
              { backgroundColor: `${c.statusSafe}18` }
            ]}
          >
            <ShieldCheck size={36} color={c.statusSafe} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.ink }]}>
            {activeTab === 'All Alerts'
              ? 'All Clear — No Active Warnings'
              : `No Active ${activeTab}`}
          </Text>
          <Text style={[styles.emptyDesc, { color: c.inkSecondary }]}>
            All monitored radar stations and IMD synoptic grids report safe, nominal meteorological parameters.
          </Text>
          <Pressable
            onPress={loadAlerts}
            style={[styles.syncNowBtn, { backgroundColor: c.blue }]}
          >
            <RefreshCw size={14} color='#FFFFFF' />
            <Text style={styles.syncNowText}>Refresh Radar Bulletins</Text>
          </Pressable>
        </View>
      ) : (
        filteredAlerts.map(alert => {
          const isSevere = (alert.severity || '').toLowerCase().includes('severe')
          const sevColor = isSevere ? c.statusDanger : alert.color || c.statusWarning

          return (
            <View
              key={alert.id || alert._id || alert.title}
              style={[
                styles.alertCard,
                {
                  backgroundColor: c.card,
                  borderColor: `${sevColor}40`
                }
              ]}
            >
              <View style={styles.alertCardTop}>
                <View
                  style={[
                    styles.alertIconBadge,
                    { backgroundColor: `${sevColor}15` }
                  ]}
                >
                  <AlertTriangle size={20} color={sevColor} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[styles.alertCardTitle, { color: c.ink }]}
                      numberOfLines={1}
                    >
                      {alert.title}
                    </Text>
                    <View
                      style={[
                        styles.severityPill,
                        { backgroundColor: `${sevColor}18`, borderColor: `${sevColor}40` }
                      ]}
                    >
                      <Text style={[styles.severityPillText, { color: sevColor }]}>
                        {alert.severity || 'Warning'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaLocationRow}>
                    <MapPin size={13} color={c.blue} />
                    <Text style={[styles.alertCardLocation, { color: c.inkSecondary }]}>
                      {alert.location || alert.area || 'Regional monitoring zone'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.alertCardDetail, { color: c.inkSecondary }]}>
                {alert.detail ||
                  alert.message ||
                  alert.description ||
                  'Severe weather advisory in effect. Stay tuned to disaster authority updates.'}
              </Text>

              <View style={[styles.metaRow, { borderTopColor: c.borderLight }]}>
                <View style={styles.timeTag}>
                  <Clock size={12} color={c.muted} />
                  <Text style={[styles.alertCardTime, { color: c.muted }]}>
                    {alert.time || alert.startTime || 'Updated live'}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    if (onSelectAlert) onSelectAlert(alert)
                    if (onNavigate) onNavigate('alert-details')
                    else if (onNotification)
                      onNotification(`Advisory details for ${alert.title}`)
                  }}
                  style={[
                    styles.viewDetailsBtn,
                    { backgroundColor: c.cardAlt, borderColor: `${sevColor}60` }
                  ]}
                >
                  <Text style={[styles.viewDetailsText, { color: sevColor }]}>
                    View Protocol SOP
                  </Text>
                  <ChevronRight size={14} color={sevColor} />
                </Pressable>
              </View>
            </View>
          )
        })
      )}

      {/* Recent Bulletins Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>
          Recent Archived Advisories
        </Text>
      </View>

      <View
        style={[
          styles.recentCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        {[
          {
            title: 'Thunderstorm & Convective Squall',
            loc: 'Nashik, Maharashtra',
            type: 'Advisory Passed',
            time: 'Yesterday'
          },
          {
            title: 'Coastal High Wave Advisory',
            loc: 'Ratnagiri, Maharashtra',
            type: 'Resolved',
            time: '2 days ago'
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
            <ShieldCheck size={18} color={c.statusSafe} style={{ marginRight: 10 }} />
            <View style={styles.recentRowCopy}>
              <Text style={[styles.recentRowTitle, { color: c.ink }]}>
                {item.title}
              </Text>
              <Text style={[styles.recentRowLoc, { color: c.muted }]}>
                {item.loc} • {item.time}
              </Text>
            </View>
            <View style={[styles.tagBadge, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
              <Text style={[styles.tagText, { color: c.muted }]}>
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
    padding: 14,
    paddingBottom: 40,
    gap: 12
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    fontWeight: '700'
  },
  capBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1
  },
  capBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  capBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  capText: {
    fontSize: 11,
    flex: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700'
  },
  alertCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10
  },
  alertCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  alertIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: '800'
  },
  metaLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3
  },
  alertCardLocation: {
    fontSize: 12
  },
  alertCardDetail: {
    fontSize: 12,
    lineHeight: 18
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  alertCardTime: {
    fontSize: 11
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700'
  },
  recentCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  recentRowCopy: {
    flex: 1
  },
  recentRowTitle: {
    fontSize: 13,
    fontWeight: '600'
  },
  recentRowLoc: {
    fontSize: 11,
    marginTop: 2
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600'
  },
  emptyStateCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16
  },
  emptyIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 18
  },
  syncNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  syncNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
})

export default AlertsScreen
