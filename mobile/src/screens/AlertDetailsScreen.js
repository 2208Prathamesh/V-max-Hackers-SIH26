import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share
} from 'react-native'
import { getColors } from '../theme/colors'
import { alertsData } from '../data/mockData'

export function AlertDetailsScreen ({
  isDark = false,
  alertData,
  onNavigate,
  onNotification
}) {
  const c = getColors(isDark)

  // Use passed alertData or fallback to the primary severe alert
  const alert = alertData || alertsData[0]
  const isSevere =
    alert.severity === 'Severe' || alert.severityLevel === 'high'
  const isModerate = alert.severity === 'Moderate'

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Weather Alert: ${alert.title}`,
        message: `⚠️ [WEATHER ALERT - ${alert.severity || 'Warning'}] ${alert.title} in ${alert.location || alert.region}. Effective: ${alert.time}. Full advisory: ${alert.desc}`
      })
    } catch {
      if (onNotification) onNotification('Alert bulletin copied to clipboard')
    }
  }

  const safetyGuidelines = [
    'Stay indoors during peak storm and lightning hours.',
    'Avoid traveling through low-lying or waterlogged underpasses.',
    'Keep your mobile devices fully charged and emergency lights accessible.',
    'Ensure pets and livestock are moved to safe elevated shelters.',
    'Do not touch exposed electrical poles or fallen power lines.'
  ]

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hazard Header Banner */}
      <View
        style={[
          styles.hazardBanner,
          {
            backgroundColor: isSevere
              ? isDark
                ? '#381C1C'
                : '#FEF2F2'
              : isModerate
              ? isDark
                ? '#352514'
                : '#FFFBEB'
              : isDark
              ? '#302A14'
              : '#FEFCE8',
            borderColor: isSevere
              ? isDark
                ? '#5A2626'
                : '#FCA5A5'
              : isModerate
              ? isDark
                ? '#573715'
                : '#FCD34D'
              : isDark
              ? '#554A1E'
              : '#FEF08A'
          }
        ]}
      >
        <View style={styles.bannerTopRow}>
          <View
            style={[
              styles.severityBadge,
              {
                backgroundColor: isSevere
                  ? '#EF4444'
                  : isModerate
                  ? '#F59E0B'
                  : '#EAB308'
              }
            ]}
          >
            <Text style={styles.severityText}>
              {alert.severity ? alert.severity.toUpperCase() : 'SEVERE'} ALERT
            </Text>
          </View>
          <Text style={[styles.sourceText, { color: c.muted }]}>
            Source: {alert.source || 'IMD Official'}
          </Text>
        </View>

        <Text style={[styles.alertTitle, { color: c.ink }]}>{alert.title}</Text>

        <View style={styles.regionRow}>
          <Text style={styles.pinIcon}>📍</Text>
          <Text style={[styles.regionName, { color: c.inkSecondary }]}>
            {alert.location || alert.region || 'Western Maharashtra & Mumbai'}
          </Text>
        </View>
      </View>

      {/* Time & Validity Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.sectionHeading, { color: c.muted }]}>
          TIMEFRAME & METEOROLOGICAL CONFIDENCE
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={[styles.metaSub, { color: c.muted }]}>EFFECTIVE</Text>
            <Text style={[styles.metaMain, { color: c.ink }]}>
              {alert.time || 'Immediate / Active'}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={[styles.metaSub, { color: c.muted }]}>VALID UNTIL</Text>
            <Text style={[styles.metaMain, { color: c.ink }]}>
              24 Hours from Bulletin
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={[styles.metaSub, { color: c.muted }]}>CONFIDENCE</Text>
            <Text style={[styles.metaMain, { color: '#EF4444' }]}>
              {alert.probability || '85% (High)'}
            </Text>
          </View>
        </View>
      </View>

      {/* Advisory Description */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.sectionHeading, { color: c.muted }]}>
          OFFICIAL METEOROLOGICAL ADVISORY
        </Text>
        <Text style={[styles.bodyText, { color: c.inkSecondary }]}>
          {alert.desc ||
            'Moderate to heavy rainfall accompanied by lightning and gusty winds (40-50 km/h) is very likely over the region. Possible water logging in low-lying areas, local disruption of traffic, and minor damage to vulnerable structures.'}
        </Text>
      </View>

      {/* Safety Actions Checklist */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.sectionHeading, { color: c.muted }]}>
          RECOMMENDED PRECAUTIONARY ACTIONS
        </Text>
        <View style={styles.checklist}>
          {safetyGuidelines.map((item, idx) => (
            <View key={idx} style={styles.checkItem}>
              <Text style={styles.checkIcon}>🛡️</Text>
              <Text style={[styles.checkText, { color: c.inkSecondary }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Helplines Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.sectionHeading, { color: c.muted }]}>
          DISASTER RESPONSE HELPLINES
        </Text>
        <View style={styles.helplineList}>
          <View style={styles.helplineRow}>
            <Text style={[styles.helplineName, { color: c.ink }]}>
              National Disaster Response (NDRF)
            </Text>
            <Text style={[styles.helplinePhone, { color: c.blue }]}>
              011-24363260
            </Text>
          </View>
          <View style={styles.helplineRow}>
            <Text style={[styles.helplineName, { color: c.ink }]}>
              State Disaster Emergency
            </Text>
            <Text style={[styles.helplinePhone, { color: c.blue }]}>1070</Text>
          </View>
          <View style={styles.helplineRow}>
            <Text style={[styles.helplineName, { color: c.ink }]}>
              District Control Center
            </Text>
            <Text style={[styles.helplinePhone, { color: c.blue }]}>1077</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleShare}
          style={[styles.shareBtn, { backgroundColor: c.blue }]}
        >
          <Text style={styles.shareBtnText}>📢 Share Bulletin</Text>
        </Pressable>

        <Pressable
          onPress={() => onNavigate && onNavigate('alerts')}
          style={[
            styles.backBtn,
            { backgroundColor: c.cardAlt, borderColor: c.border }
          ]}
        >
          <Text style={[styles.backBtnText, { color: c.ink }]}>
            ← All Alerts
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 32, gap: 12 },
  hazardBanner: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 14
  },
  severityText: { color: '#FFFFFF', fontSize: 9.5, fontWeight: '900' },
  sourceText: { fontSize: 10, fontWeight: '700' },
  alertTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  pinIcon: { fontSize: 13 },
  regionName: { fontSize: 11.5, fontWeight: '700' },
  card: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaCol: { flex: 1 },
  metaSub: { fontSize: 8.5, fontWeight: '700', marginBottom: 2 },
  metaMain: { fontSize: 11, fontWeight: '800' },
  bodyText: { fontSize: 11.5, lineHeight: 17, fontWeight: '500' },
  checklist: { gap: 8 },
  checkItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  checkIcon: { fontSize: 13 },
  checkText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '500' },
  helplineList: { gap: 6 },
  helplineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  helplineName: { fontSize: 11, fontWeight: '600' },
  helplinePhone: { fontSize: 11.5, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  shareBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shareBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  backBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtnText: { fontSize: 12, fontWeight: '700' }
})
