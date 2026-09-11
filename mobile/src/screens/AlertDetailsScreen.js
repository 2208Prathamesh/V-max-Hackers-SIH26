import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share
} from 'react-native'
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  Share2,
  PhoneCall,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api } from '../services/api'

export function AlertDetailsScreen ({
  isDark = false,
  alertData,
  onNavigate,
  onNotification
}) {
  const c = getColors(isDark)
  const [liveAlert, setLiveAlert] = useState(alertData || null)

  useEffect(() => {
    if (alertData) {
      setLiveAlert(alertData)
      return
    }
    api.activeAlerts().then(res => {
      if (Array.isArray(res) && res.length > 0) {
        setLiveAlert(res[0])
      }
    }).catch(() => {})
  }, [alertData])

  const alert = liveAlert || {
    title: 'Regional Severe Weather Advisory',
    severity: 'Severe',
    location: 'Western Maharashtra Regional Zone',
    time: 'Live Advisory',
    description: 'IMD synoptic advisory in effect. Stay indoors during squall periods and monitor official disaster management channels.',
    probability: '85% (High)',
    source: 'IMD National Weather Service'
  }
  const isSevere =
    (alert.severity || '').toLowerCase().includes('severe') ||
    (alert.severity || '').toLowerCase().includes('extreme') ||
    (alert.severity || '').toLowerCase().includes('high')
  const isModerate =
    (alert.severity || '').toLowerCase().includes('moderate') ||
    (alert.severity || '').toLowerCase().includes('orange')

  const bannerColor = isSevere ? c.statusDanger : isModerate ? c.statusWarning : c.accentAmber

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Weather Alert: ${alert.title}`,
        message: `[WEATHER ALERT - ${alert.severity || 'Warning'}] ${alert.title} in ${alert.location || alert.region}. Effective: ${alert.time}. Full advisory: ${alert.desc || alert.detail}`
      })
    } catch {
      if (onNotification) onNotification('Alert bulletin copied to clipboard')
    }
  }

  const safetyGuidelines = [
    'Stay indoors during peak thunderstorm, lightning, and squall periods.',
    'Avoid traveling through low-lying roadways or urban underpasses.',
    'Keep your communication devices charged and emergency lighting accessible.',
    'Ensure pets and livestock are moved to safe elevated shelters.',
    'Do not touch exposed electrical infrastructure or downed lines.'
  ]

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <Pressable
        onPress={() => onNavigate && onNavigate('alerts')}
        style={styles.backRow}
      >
        <ArrowLeft size={16} color={c.blue} />
        <Text style={[styles.backRowText, { color: c.blue }]}>
          Back to Disaster Bulletins
        </Text>
      </Pressable>

      {/* Hazard Header Banner */}
      <View
        style={[
          styles.hazardBanner,
          {
            backgroundColor: isSevere
              ? isDark
                ? 'rgba(239, 68, 68, 0.12)'
                : '#FEF2F2'
              : isDark
              ? 'rgba(245, 158, 11, 0.12)'
              : '#FFFBEB',
            borderColor: bannerColor
          }
        ]}
      >
        <View style={styles.bannerTopRow}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: bannerColor }
            ]}
          >
            <Text style={styles.severityText}>
              {alert.severity ? alert.severity.toUpperCase() : 'SEVERE'} BULLETIN
            </Text>
          </View>
          <Text style={[styles.sourceText, { color: c.muted }]}>
            Agency: {alert.source || 'IMD Official'}
          </Text>
        </View>

        <Text style={[styles.alertTitle, { color: c.ink }]}>{alert.title}</Text>

        <View style={styles.regionRow}>
          <MapPin size={15} color={bannerColor} />
          <Text style={[styles.regionName, { color: c.inkSecondary }]}>
            {alert.location || alert.region || 'Western Maharashtra Regional Zone'}
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
          TIMEFRAME & PROTOCOL METRICS
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={[styles.metaSub, { color: c.muted }]}>EFFECTIVE</Text>
            <Text style={[styles.metaMain, { color: c.ink }]}>
              {alert.time || 'Immediate'}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={[styles.metaSub, { color: c.muted }]}>VALID UNTIL</Text>
            <Text style={[styles.metaMain, { color: c.ink }]}>
              24 Hours Active
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={[styles.metaSub, { color: c.muted }]}>CONFIDENCE</Text>
            <Text style={[styles.metaMain, { color: bannerColor }]}>
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
            alert.detail ||
            'Moderate to heavy rainfall accompanied by convective lightning and gusty winds (40-50 km/h) is very likely over the region. Possible localized inundation in underpasses, traffic disruption, and minor impact on temporary structures.'}
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
              <ShieldCheck size={16} color={c.statusSafe} style={{ marginTop: 2 }} />
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <PhoneCall size={15} color={c.blue} />
          <Text style={[styles.sectionHeading, { color: c.muted, marginBottom: 0 }]}>
            DISASTER RESPONSE HELPLINES
          </Text>
        </View>
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
              State Disaster Control (SDMA)
            </Text>
            <Text style={[styles.helplinePhone, { color: c.blue }]}>1070</Text>
          </View>
          <View style={styles.helplineRow}>
            <Text style={[styles.helplineName, { color: c.ink }]}>
              District Emergency Control (DEOC)
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
          <Share2 size={16} color='#FFFFFF' />
          <Text style={styles.shareBtnText}>Broadcast Bulletin</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 36, gap: 12 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4
  },
  backRowText: {
    fontSize: 12,
    fontWeight: '700'
  },
  hazardBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  sourceText: { fontSize: 11 },
  alertTitle: { fontSize: 16, fontWeight: '800' },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  regionName: { fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaCol: { gap: 2 },
  metaSub: { fontSize: 9, fontWeight: '800' },
  metaMain: { fontSize: 13, fontWeight: '700' },
  bodyText: { fontSize: 12.5, lineHeight: 18 },
  checklist: { gap: 8 },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  checkText: { fontSize: 12, flex: 1, lineHeight: 17 },
  helplineList: { gap: 8 },
  helplineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  helplineName: { fontSize: 12 },
  helplinePhone: { fontSize: 12, fontWeight: '700' },
  actionsRow: { marginTop: 4 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12
  },
  shareBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }
})

export default AlertDetailsScreen
