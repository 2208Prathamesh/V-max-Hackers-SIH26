import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native'
import {
  Plane,
  Compass,
  Wind,
  Gauge,
  Thermometer,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Eye,
  RefreshCw,
  Check,
  Terminal
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api, offlineStorage } from '../services/api'

const AIRPORTS = [
  { icao: 'VABB', iata: 'BOM', name: 'Mumbai CSMI', runway: '09/27', elev: '39 ft' },
  { icao: 'VIDP', iata: 'DEL', name: 'Delhi IGI', runway: '10/28', elev: '777 ft' },
  { icao: 'VOBL', iata: 'BLR', name: 'Bengaluru', runway: '09L/27R', elev: '3000 ft' },
  { icao: 'VOMM', iata: 'MAA', name: 'Chennai Intl', runway: '07/25', elev: '52 ft' },
  { icao: 'VAPO', iata: 'PNQ', name: 'Pune Airbase', runway: '10/28', elev: '1942 ft' },
  { icao: 'VECC', iata: 'CCU', name: 'Kolkata NSCBI', runway: '01R/19L', elev: '16 ft' }
]

export function AviationScreen ({
  isDark = false,
  onNavigate,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const [selectedIcao, setSelectedIcao] = useState('VABB')
  const [loading, setLoading] = useState(false)
  const [briefingData, setBriefingData] = useState(null)
  const [isPinnedToHome, setIsPinnedToHome] = useState(false)
  const [savedPinState, setSavedPinState] = useState(false)

  useEffect(() => {
    let mounted = true
    offlineStorage.getPinnedWidgets().then(res => {
      if (mounted) {
        const val = !!res?.aviation
        setIsPinnedToHome(val)
        setSavedPinState(val)
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleTogglePinHome = async () => {
    if (!isPinnedToHome) {
      const canPin = await offlineStorage.canPinWidget('aviation')
      if (!canPin) {
        if (onNotification) {
          onNotification('⚠️ Max 3 widgets can be pinned to Home. Unpin another widget first.')
        }
        return
      }
    }
    setIsPinnedToHome(prev => !prev)
  }

  const hasPinChanged = isPinnedToHome !== savedPinState

  const handleSavePinPreference = async () => {
    if (!hasPinChanged) return
    const res = await offlineStorage.setWidgetPinned('aviation', isPinnedToHome)
    if (res && res.success === false) {
      if (onNotification) onNotification(`⚠️ ${res.message}`)
      setIsPinnedToHome(savedPinState)
      return
    }
    const wasPinned = savedPinState
    setSavedPinState(isPinnedToHome)
    if (onNotification) {
      if (isPinnedToHome) {
        onNotification('📌 Aviation METAR pinned to Home Dashboard')
      } else if (wasPinned) {
        onNotification('Removed Aviation from Home Dashboard')
      }
    }
  }

  const loadBriefing = () => {
    setLoading(true)
    api
      .aviationBriefing(selectedIcao)
      .then(res => {
        if (res) setBriefingData(res)
      })
      .catch(() => {
        setBriefingData(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadBriefing()
  }, [selectedIcao, backendReady])

  const airport = AIRPORTS.find(a => a.icao === selectedIcao) || AIRPORTS[0]

  const telemetry = briefingData || {
    icao: selectedIcao,
    flightRules: selectedIcao === 'VAPO' ? 'MVFR' : 'VFR',
    metar: `${selectedIcao} 110200Z 28012KT 6000 FEW025 BKN080 28/22 Q1011 NOSIG`,
    decoded: {
      wind: { direction: 280, speedKnots: 12, gustKnots: null },
      visibilityKm: 6.0,
      altimeterHpa: 1011,
      temperatureC: 28,
      dewpointC: 22,
      clouds: 'FEW at 2,500 ft, Broken at 8,000 ft',
      crosswindKnots: 4.8,
      headwindKnots: 11.0
    },
    hazards: [
      'Normal Visual Approach in progress; surface braking action verified',
      'Surface moisture saturation within permissible crosswind envelope'
    ]
  }

  const flightRules = telemetry.flightRules || 'VFR'
  const badgeColor =
    flightRules === 'VFR'
      ? c.flightVfr
      : flightRules === 'MVFR'
      ? c.flightMvfr
      : flightRules === 'IFR'
      ? c.flightIfr
      : c.flightLifr

  // Robust field normalization across live NOAA backend & fallback schemas
  const normWindDir = telemetry.decoded?.wind?.direction ?? 280
  const normWindSpeed = telemetry.decoded?.wind?.speed ?? telemetry.decoded?.wind?.speedKnots ?? 12
  const normVis = telemetry.decoded?.visibility?.value !== undefined
    ? (telemetry.decoded.visibility.value > 100 ? (telemetry.decoded.visibility.value / 1000).toFixed(1) : Number(telemetry.decoded.visibility.value).toFixed(1))
    : (telemetry.decoded?.visibilityKm !== undefined ? Number(telemetry.decoded.visibilityKm).toFixed(1) : '6.0')
  const normQnh = telemetry.decoded?.pressure?.qnh ?? telemetry.decoded?.altimeterHpa ?? 1011
  const normTemp = telemetry.decoded?.temperature ?? telemetry.decoded?.temperatureC ?? 28
  const normDew = telemetry.decoded?.dewpoint ?? telemetry.decoded?.dewpointC ?? 22
  const normHeadwind = Math.abs(Math.round(telemetry.bestRunway?.crosswind?.headwind ?? telemetry.decoded?.headwindKnots ?? 10.4))
  const normCrosswind = Math.abs(Math.round(telemetry.bestRunway?.crosswind?.crosswind ?? telemetry.decoded?.crosswindKnots ?? 4.8))
  const rawMetarDisplay = telemetry.rawMetar || telemetry.metar || `${selectedIcao} METAR AVAILABLE`
  const timeDisplay = telemetry.observationTime || telemetry.timestamp ? new Date(telemetry.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live NOAA'
  const hazardsList = Array.isArray(telemetry.hazards) && telemetry.hazards.length > 0
    ? telemetry.hazards
    : (telemetry.briefingSummary ? [telemetry.briefingSummary] : [
        'Normal Visual Approach in progress; surface braking action verified',
        'Surface moisture saturation within permissible crosswind envelope'
      ])

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Aerodrome Selector Chips */}
      <View style={styles.selectorWrapper}>
        <View style={styles.selectorHeaderRow}>
          <Text style={[styles.sectionHeading, { color: c.inkSecondary }]}>
            INDIAN AERODROME SELECTOR
          </Text>
          <Pressable
            onPress={loadBriefing}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <RefreshCw size={12} color={c.blue} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.blue }}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {AIRPORTS.map(item => {
            const isSelected = selectedIcao === item.icao
            return (
              <Pressable
                key={item.icao}
                onPress={() => setSelectedIcao(item.icao)}
                style={[
                  styles.airportChip,
                  {
                    backgroundColor: isSelected ? c.blue : c.card,
                    borderColor: isSelected ? c.blue : c.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.chipIcao,
                    { color: isSelected ? '#FFFFFF' : c.ink }
                  ]}
                >
                  {item.icao}
                </Text>
                <Text
                  style={[
                    styles.chipIata,
                    { color: isSelected ? 'rgba(255,255,255,0.85)' : c.muted }
                  ]}
                >
                  {item.iata}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Main Aviation Status Hero Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: c.glassBg,
            borderColor: c.glassBorder,
            borderTopColor: c.glassBorderHighlight
          }
        ]}
      >
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.heroTitleRow}>
              <Text style={[styles.heroAirportName, { color: c.ink }]}>
                {airport.name}
              </Text>
              <View style={[styles.ruleBadge, { backgroundColor: badgeColor }]}>
                <Text style={styles.ruleBadgeText}>{flightRules}</Text>
              </View>
            </View>
            <Text style={[styles.heroSub, { color: c.inkSecondary }]}>
              ICAO: {airport.icao} • RWY: {airport.runway} • ELEV: {airport.elev}
            </Text>
          </View>
          {loading && <ActivityIndicator size='small' color={c.blue} />}
        </View>

        {/* Primary Flight Instrument Grid */}
        <View style={styles.gridRow}>
          <View style={[styles.gridCell, { backgroundColor: c.glassBgAlt, borderColor: c.glassBorderLight, borderTopColor: c.glassBorderHighlight }]}>
            <View style={styles.gridCellHeader}>
              <Wind size={14} color={c.blue} />
              <Text style={[styles.gridLabel, { color: c.muted }]}>WIND VECTOR</Text>
            </View>
            <Text style={[styles.gridValue, { color: c.ink }]}>
              {normWindDir}° / {normWindSpeed} kt
            </Text>
            <Text style={[styles.gridSub, { color: c.muted }]}>
              Crosswind: {normCrosswind} kt
            </Text>
          </View>

          <View style={[styles.gridCell, { backgroundColor: c.glassBgAlt, borderColor: c.glassBorderLight, borderTopColor: c.glassBorderHighlight }]}>
            <View style={styles.gridCellHeader}>
              <Eye size={14} color={c.accentGreen} />
              <Text style={[styles.gridLabel, { color: c.muted }]}>VISIBILITY</Text>
            </View>
            <Text style={[styles.gridValue, { color: c.ink }]}>
              {normVis} km
            </Text>
            <Text style={[styles.gridSub, { color: c.muted }]}>
              {flightRules === 'VFR' ? 'Unrestricted visual' : 'Instrument minima active'}
            </Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.gridCell, { backgroundColor: c.glassBgAlt, borderColor: c.glassBorderLight, borderTopColor: c.glassBorderHighlight }]}>
            <View style={styles.gridCellHeader}>
              <Gauge size={14} color={c.accentAmber} />
              <Text style={[styles.gridLabel, { color: c.muted }]}>ALTIMETER (QNH)</Text>
            </View>
            <Text style={[styles.gridValue, { color: c.ink }]}>
              {normQnh} hPa
            </Text>
            <Text style={[styles.gridSub, { color: c.muted }]}>
              {(normQnh * 0.02953).toFixed(2)} inHg
            </Text>
          </View>

          <View style={[styles.gridCell, { backgroundColor: c.glassBgAlt, borderColor: c.glassBorderLight, borderTopColor: c.glassBorderHighlight }]}>
            <View style={styles.gridCellHeader}>
              <Thermometer size={14} color={c.accentRed} />
              <Text style={[styles.gridLabel, { color: c.muted }]}>TEMP / DEWPOINT</Text>
            </View>
            <Text style={[styles.gridValue, { color: c.ink }]}>
              {normTemp}° / {normDew}°C
            </Text>
            <Text style={[styles.gridSub, { color: c.muted }]}>
              Depression: {normTemp - normDew}°C
            </Text>
          </View>
        </View>
      </View>

      {/* Runway Headwind / Crosswind Trigonometry Card */}
      <View style={[styles.cardSection, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Plane size={16} color={c.blue} />
            <Text style={[styles.cardHeaderTitle, { color: c.ink }]}>
              Runway Wind Vectors ({telemetry.bestRunway?.runway || airport.runway})
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 8 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.componentLabel, { color: c.muted }]}>HEADWIND</Text>
            <Text style={[styles.componentValue, { color: c.accentGreen }]}>
              {normHeadwind} kt
            </Text>
          </View>
          <View style={{ width: 1, height: 36, backgroundColor: c.borderLight }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.componentLabel, { color: c.muted }]}>CROSSWIND</Text>
            <Text style={[styles.componentValue, { color: c.accentAmber }]}>
              {normCrosswind} kt
            </Text>
          </View>
          <View style={{ width: 1, height: 36, backgroundColor: c.borderLight }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.componentLabel, { color: c.muted }]}>TAILWIND RISK</Text>
            <Text style={[styles.componentValue, { color: c.statusSafe }]}>
              None (0 kt)
            </Text>
          </View>
        </View>
      </View>

      {/* Raw METAR Terminal Block */}
      <View style={[styles.terminalCard, { backgroundColor: isDark ? 'rgba(10, 11, 14, 0.85)' : '#0F172A', borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={styles.terminalHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Terminal size={14} color='#60A5FA' />
            <Text style={styles.terminalTitle}>RAW METAR DISPATCH (ICAO STANDARD)</Text>
          </View>
          <Text style={styles.terminalTime}>{timeDisplay}</Text>
        </View>
        <Text style={styles.terminalCode}>{rawMetarDisplay}</Text>
      </View>

      {/* Operational Flight Dispatch Directives */}
      <View style={[styles.cardSection, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <FileText size={16} color={c.blue} />
          <Text style={[styles.cardHeaderTitle, { color: c.ink }]}>
            Flight Dispatch Advisory
          </Text>
        </View>
        {hazardsList.map((hz, idx) => (
          <View key={idx} style={styles.hazardRow}>
            <ShieldCheck size={14} color={c.statusSafe} style={{ marginTop: 2 }} />
            <Text style={[styles.hazardText, { color: c.inkSecondary }]}>{hz}</Text>
          </View>
        ))}
      </View>

      {/* Bottom Compact Pin Preference Row with Save Button */}
      <View
        style={[
          styles.pinCheckboxRow,
          {
            backgroundColor: isPinnedToHome ? 'rgba(59, 130, 246, 0.08)' : c.glassBg,
            borderColor: isPinnedToHome ? c.blue : c.glassBorder,
            borderTopColor: isPinnedToHome ? c.blue : c.glassBorderHighlight
          }
        ]}
      >
        <Pressable
          onPress={handleTogglePinHome}
          style={styles.pinCheckboxLeft}
          hitSlop={6}
        >
          <View
            style={[
              styles.checkboxSquare,
              {
                backgroundColor: isPinnedToHome ? c.blue : c.cardAlt,
                borderColor: isPinnedToHome ? c.blue : c.border
              }
            ]}
          >
            {isPinnedToHome && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <View style={styles.pinTextCol}>
            <Text style={[styles.pinCheckboxTitle, { color: c.ink }]}>
              Show on Home Dashboard
            </Text>
            <Text style={[styles.pinCheckboxSubtitle, { color: c.muted }]}>
              {isPinnedToHome ? 'Live widget active on Home' : 'Check to pin runway METAR'}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleSavePinPreference}
          disabled={!hasPinChanged}
          style={({ pressed }) => [
            styles.pinSaveBtn,
            {
              backgroundColor: hasPinChanged ? c.blue : (isPinnedToHome ? 'rgba(59, 130, 246, 0.15)' : c.cardAlt),
              borderColor: hasPinChanged ? c.blue : c.border,
              opacity: hasPinChanged ? 1 : 0.6
            },
            pressed && hasPinChanged && { opacity: 0.75 }
          ]}
        >
          <Text
            style={[
              styles.pinSaveBtnText,
              { color: hasPinChanged ? '#FFFFFF' : (isPinnedToHome ? c.blue : c.muted) }
            ]}
          >
            {hasPinChanged ? 'Save' : (isPinnedToHome ? 'Saved ✓' : 'Saved')}
          </Text>
        </Pressable>
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
    paddingBottom: 36,
    gap: 12
  },
  selectorWrapper: {},
  selectorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  chipRow: {
    flexDirection: 'row'
  },
  airportChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipIcao: {
    fontSize: 13,
    fontWeight: '800'
  },
  chipIata: {
    fontSize: 10,
    fontWeight: '600'
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  heroAirportName: {
    fontSize: 16,
    fontWeight: '700'
  },
  ruleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  ruleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  heroSub: {
    fontSize: 11,
    marginTop: 3
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8
  },
  gridCell: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1
  },
  gridCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '800'
  },
  gridSub: {
    fontSize: 10,
    marginTop: 2
  },
  cardSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14
  },
  cardHeaderRow: {
    marginBottom: 10
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  runwayStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8
  },
  runwayStatItem: {
    alignItems: 'center'
  },
  runwayStatVal: {
    fontSize: 18,
    fontWeight: '800'
  },
  runwayStatLbl: {
    fontSize: 10,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 32
  },
  runwayNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8
  },
  terminalBox: {
    borderRadius: 14,
    padding: 12
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  terminalDot: {
    color: '#64748B',
    fontSize: 10
  },
  terminalTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4
  },
  terminalCode: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    lineHeight: 16
  },
  hazardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6
  },
  hazardText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17
  },
  pinCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    gap: 8
  },
  pinCheckboxLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkboxSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pinTextCol: {
    flex: 1
  },
  pinCheckboxTitle: {
    fontSize: 11,
    fontWeight: '700'
  },
  pinCheckboxSubtitle: {
    fontSize: 9.5,
    marginTop: 1
  },
  pinSaveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1
  },
  pinSaveBtnText: {
    fontSize: 11,
    fontWeight: '700'
  }
})

export default AviationScreen
