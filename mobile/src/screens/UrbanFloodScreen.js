import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import {
  Waves,
  AlertTriangle,
  Landmark,
  ShieldAlert,
  Gauge,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Check
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api, offlineStorage } from '../services/api'

const METROS = [
  { id: 'Mumbai', name: 'Mumbai MMR', state: 'Maharashtra' },
  { id: 'Pune', name: 'Pune PMC/PCMC', state: 'Maharashtra' },
  { id: 'Bengaluru', name: 'Bengaluru BBMP', state: 'Karnataka' },
  { id: 'Chennai', name: 'Chennai GCC', state: 'Tamil Nadu' },
  { id: 'Delhi', name: 'Delhi NCR', state: 'National Capital' },
  { id: 'Kolkata', name: 'Kolkata KMC', state: 'West Bengal' }
]

const HOTSPOTS_FALLBACK = {
  Mumbai: [
    { name: 'Hindmata Cinema Junction', status: 'CRITICAL', depthCm: 45, advice: 'Avoid completely; municipal dewatering pumps operating' },
    { name: 'Milan Subway Underpass', status: 'CLOSED', depthCm: 60, advice: 'Subway traffic diverted to elevated flyover corridor' },
    { name: 'Kurla West (LBS Marg)', status: 'MODERATE', depthCm: 25, advice: 'Transit with heavy ground clearance vehicles only' },
    { name: 'Gandhi Market, King Circle', status: 'CRITICAL', depthCm: 50, advice: 'Water logging active on south-bound arterial lane' }
  ],
  Pune: [
    { name: 'Swargate Flyover Base', status: 'MODERATE', depthCm: 20, advice: 'Slow moving traffic; drainage channels active' },
    { name: 'Sinhagad Road (Ekta Nagari)', status: 'HIGH', depthCm: 35, advice: 'Khadakwasla dam discharge warning in effect' },
    { name: 'Bavdhan Underpass', status: 'CLEAR', depthCm: 5, advice: 'Clear for all vehicle classifications' }
  ],
  Bengaluru: [
    { name: 'Silk Board Junction', status: 'HIGH', depthCm: 30, advice: 'Heavy gridlock due to stormwater pooling' },
    { name: 'Bellandur EcoSpace', status: 'CRITICAL', depthCm: 50, advice: 'Use Outer Ring Road elevated lanes' },
    { name: 'Hebbal Flyover Loops', status: 'CLEAR', depthCm: 8, advice: 'Free flow reported by traffic telemetry' }
  ],
  Delhi: [
    { name: 'Minto Bridge Underpass', status: 'CLOSED', depthCm: 65, advice: 'Underpass submerged; traffic diverted via Connaught Place' },
    { name: 'ITO Road Junction', status: 'HIGH', depthCm: 32, advice: 'Heavy surface accumulation; avoid low sedans' },
    { name: 'Zakhira Underpass (Rohtak Rd)', status: 'CRITICAL', depthCm: 48, advice: 'Pumping operations ongoing; use ring road bypass' }
  ],
  Chennai: [
    { name: 'Velachery Lake Bypass', status: 'CRITICAL', depthCm: 52, advice: 'Canal overflow active; motorized boats on standby' },
    { name: 'Vyasarpadi Subway', status: 'CLOSED', depthCm: 58, advice: 'Northern transit corridor diverted via Perambur bridge' },
    { name: 'Tambaram Mudichur Lowland', status: 'HIGH', depthCm: 36, advice: 'Adyar basin catchment discharge alert in effect' }
  ],
  Kolkata: [
    { name: 'Thanthania Kalibari (College St)', status: 'HIGH', depthCm: 38, advice: 'Lock-gates operating; tram services temporarily halted' },
    { name: 'Park Circus Underpass', status: 'CRITICAL', depthCm: 46, advice: 'Waterlogged approach lanes; use EM Bypass link' },
    { name: 'Ultadanga Flyover Base', status: 'MODERATE', depthCm: 22, advice: 'Slow transit; municipal gully emptiers deployed' }
  ]
}

const HYDROGRAPH_FALLBACK = {
  Mumbai: [
    { time: '10:00', rainfallMm: 8, runoffCm: 14 },
    { time: '11:00', rainfallMm: 16, runoffCm: 22 },
    { time: '12:00', rainfallMm: 34, runoffCm: 38 },
    { time: '13:00', rainfallMm: 48, runoffCm: 50 },
    { time: '14:00', rainfallMm: 38, runoffCm: 45 },
    { time: '15:00', rainfallMm: 28, runoffCm: 38 }
  ],
  Pune: [
    { time: '10:00', rainfallMm: 4, runoffCm: 8 },
    { time: '11:00', rainfallMm: 10, runoffCm: 14 },
    { time: '12:00', rainfallMm: 22, runoffCm: 26 },
    { time: '13:00', rainfallMm: 30, runoffCm: 35 },
    { time: '14:00', rainfallMm: 24, runoffCm: 30 },
    { time: '15:00', rainfallMm: 18, runoffCm: 22 }
  ],
  Bengaluru: [
    { time: '10:00', rainfallMm: 6, runoffCm: 10 },
    { time: '11:00', rainfallMm: 18, runoffCm: 24 },
    { time: '12:00', rainfallMm: 36, runoffCm: 42 },
    { time: '13:00', rainfallMm: 44, runoffCm: 50 },
    { time: '14:00', rainfallMm: 26, runoffCm: 38 },
    { time: '15:00', rainfallMm: 16, runoffCm: 28 }
  ],
  Delhi: [
    { time: '10:00', rainfallMm: 5, runoffCm: 12 },
    { time: '11:00', rainfallMm: 14, runoffCm: 20 },
    { time: '12:00', rainfallMm: 28, runoffCm: 36 },
    { time: '13:00', rainfallMm: 42, runoffCm: 54 },
    { time: '14:00', rainfallMm: 32, runoffCm: 40 },
    { time: '15:00', rainfallMm: 20, runoffCm: 28 }
  ],
  Chennai: [
    { time: '10:00', rainfallMm: 8, runoffCm: 15 },
    { time: '11:00', rainfallMm: 22, runoffCm: 30 },
    { time: '12:00', rainfallMm: 40, runoffCm: 48 },
    { time: '13:00', rainfallMm: 52, runoffCm: 58 },
    { time: '14:00', rainfallMm: 36, runoffCm: 44 },
    { time: '15:00', rainfallMm: 24, runoffCm: 34 }
  ],
  Kolkata: [
    { time: '10:00', rainfallMm: 6, runoffCm: 12 },
    { time: '11:00', rainfallMm: 16, runoffCm: 24 },
    { time: '12:00', rainfallMm: 32, runoffCm: 38 },
    { time: '13:00', rainfallMm: 46, runoffCm: 48 },
    { time: '14:00', rainfallMm: 28, runoffCm: 34 },
    { time: '15:00', rainfallMm: 18, runoffCm: 25 }
  ]
}

export function UrbanFloodScreen ({
  isDark = false,
  onNavigate,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const [selectedCity, setSelectedCity] = useState('Mumbai')
  const [loading, setLoading] = useState(false)
  const [floodData, setFloodData] = useState(null)
  const [isPinnedToHome, setIsPinnedToHome] = useState(false)
  const [savedPinState, setSavedPinState] = useState(false)

  useEffect(() => {
    let mounted = true
    offlineStorage.getPinnedWidgets().then(res => {
      if (mounted) {
        const val = !!res?.urbanFlood
        setIsPinnedToHome(val)
        setSavedPinState(val)
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleTogglePinHome = async () => {
    if (!isPinnedToHome) {
      const canPin = await offlineStorage.canPinWidget('urbanFlood')
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
    const res = await offlineStorage.setWidgetPinned('urbanFlood', isPinnedToHome)
    if (res && res.success === false) {
      if (onNotification) onNotification(`⚠️ ${res.message}`)
      setIsPinnedToHome(savedPinState)
      return
    }
    const wasPinned = savedPinState
    setSavedPinState(isPinnedToHome)
    if (onNotification) {
      if (isPinnedToHome) {
        onNotification('📌 Urban Flood pinned to Home Dashboard')
      } else if (wasPinned) {
        onNotification('Removed Urban Flood from Home Dashboard')
      }
    }
  }
  const [selectedHotspot, setSelectedHotspot] = useState(null)

  const loadFloodTelemetry = () => {
    setLoading(true)
    api
      .urbanFloodIndex({ city: selectedCity })
      .then(res => {
        if (res) setFloodData(res)
      })
      .catch(() => {
        setFloodData(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadFloodTelemetry()
  }, [selectedCity, backendReady])

  const telemetry = floodData || {
    city: selectedCity,
    saturationLevelPct: 82,
    saturationStatus: 'CRITICAL SATURATION',
    estimatedRunoffDepthCm: 38,
    drainageCapacityScore: 4.2,
    status: 'RED ALERT',
    recommendations: [
      'Municipal storm pump stations running at 100% capacity.',
      'Citizens advised to avoid underpasses and low-lying coastal arterial routes.',
      'Deploy localized sandbags and mobile dewatering units.'
    ]
  }

  const hotspots =
    HOTSPOTS_FALLBACK[selectedCity] || HOTSPOTS_FALLBACK.Mumbai
  const hydrograph =
    HYDROGRAPH_FALLBACK[selectedCity] || HYDROGRAPH_FALLBACK.Mumbai

  const maxRain = Math.max(...hydrograph.map(h => h.rainfallMm), 40)
  const maxDepth = Math.max(...hydrograph.map(h => h.runoffCm), 50)
  const latestHydro = hydrograph[hydrograph.length - 1] || { rainfallMm: 20, runoffCm: 25 }

  const transitClearance = [
    { type: 'Pedestrians', limit: '15 cm', status: latestHydro.runoffCm > 15 ? 'UNSAFE' : 'PASSABLE', color: latestHydro.runoffCm > 15 ? c.statusDanger : c.statusSafe },
    { type: 'Two Wheelers', limit: '20 cm', status: latestHydro.runoffCm > 20 ? 'RISKY' : 'CLEAR', color: latestHydro.runoffCm > 20 ? c.statusDanger : c.statusSafe },
    { type: 'Low Sedans', limit: '30 cm', status: latestHydro.runoffCm > 30 ? 'CLOSED' : 'ALERT', color: latestHydro.runoffCm > 30 ? c.statusDanger : c.statusWarning },
    { type: 'Heavy Transit / SUV', limit: '50 cm', status: latestHydro.runoffCm > 50 ? 'CAUTION' : 'OPERATIONAL', color: latestHydro.runoffCm > 50 ? c.statusWarning : c.statusSafe }
  ]

  const isCritical = telemetry.saturationLevelPct > 75
  const statusColor = isCritical ? c.statusDanger : c.statusWarning

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* City Switcher Row */}
      <View style={styles.selectorWrapper}>
        <View style={styles.selectorHeaderRow}>
          <Text style={[styles.sectionHeading, { color: c.inkSecondary }]}>
            URBAN METROPOLITAN BASIN
          </Text>
          <Pressable
            onPress={loadFloodTelemetry}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <RefreshCw size={12} color={c.blue} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.blue }}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {METROS.map(m => {
            const isSelected = selectedCity === m.id
            return (
              <Pressable
                key={m.id}
                onPress={() => setSelectedCity(m.id)}
                style={[
                  styles.cityChip,
                  {
                    backgroundColor: isSelected ? c.blue : c.card,
                    borderColor: isSelected ? c.blue : c.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.cityName,
                    { color: isSelected ? '#FFFFFF' : c.ink }
                  ]}
                >
                  {m.name.split(' ')[0]}
                </Text>
                <Text
                  style={[
                    styles.cityState,
                    { color: isSelected ? 'rgba(255,255,255,0.85)' : c.muted }
                  ]}
                >
                  {m.state}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Flood Hero Card */}
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
          <View>
            <View style={styles.heroTitleRow}>
              <Text style={[styles.heroCityTitle, { color: c.ink }]}>
                {selectedCity} Stormwater Catchment
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>{telemetry.status}</Text>
              </View>
            </View>
            <Text style={[styles.heroSub, { color: c.inkSecondary }]}>
              Real-time runoff sensor telemetry & road choke-point telemetry
            </Text>
          </View>
          {loading && <ActivityIndicator size='small' color={c.blue} />}
        </View>

        {/* Dual Saturation Gauges */}
        <View style={styles.gaugeGrid}>
          <View style={[styles.gaugeCell, { backgroundColor: c.glassBgAlt, borderColor: c.glassBorderLight, borderTopColor: c.glassBorderHighlight }]}>
            <View style={styles.gaugeHeaderRow}>
              <Waves size={15} color={statusColor} />
              <Text style={[styles.gaugeLabel, { color: c.muted }]}>SOIL SATURATION</Text>
            </View>
            <Text style={[styles.gaugeVal, { color: statusColor }]}>
              {telemetry.saturationLevelPct}%
            </Text>
            <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#23252C' : '#E2E8F0' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, telemetry.saturationLevelPct)}%`,
                    backgroundColor: statusColor
                  }
                ]}
              />
            </View>
            <Text style={[styles.gaugeSub, { color: c.inkSecondary }]}>
              {telemetry.saturationStatus}
            </Text>
          </View>

          <View style={[styles.gaugeCell, { backgroundColor: c.glassBgAlt, borderColor: c.glassBorderLight, borderTopColor: c.glassBorderHighlight }]}>
            <View style={styles.gaugeHeaderRow}>
              <Gauge size={15} color={c.blue} />
              <Text style={[styles.gaugeLabel, { color: c.muted }]}>EST. RUNOFF DEPTH</Text>
            </View>
            <Text style={[styles.gaugeVal, { color: c.ink }]}>
              {telemetry.estimatedRunoffDepthCm} cm
            </Text>
            <Text style={[styles.gaugeSub, { color: c.inkSecondary, marginTop: 10 }]}>
              Drainage Score: {telemetry.drainageCapacityScore}/10
            </Text>
          </View>
        </View>
      </View>

      {/* Urban Micro-Hotspots Choke Points */}
      <View style={[styles.cardSection, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Waves size={16} color={c.blue} />
          <Text style={[styles.cardHeaderTitle, { color: c.ink }]}>
            High-Risk Inundation Hotspots ({selectedCity})
          </Text>
        </View>

        {hotspots.map((spot, idx) => {
          const isSelected = selectedHotspot?.name === spot.name
          const isCrit = spot.status === 'CRITICAL' || spot.status === 'CLOSED'
          const spotBadgeColor = isCrit ? c.statusDanger : spot.status === 'HIGH' ? c.statusWarning : c.statusSafe

          return (
            <Pressable
              key={idx}
              onPress={() => setSelectedHotspot(isSelected ? null : spot)}
              style={[
                styles.hotspotCard,
                {
                  backgroundColor: isSelected ? c.surfaceSubtle : c.glassBgAlt,
                  borderColor: isSelected ? c.blue : c.glassBorderLight,
                  borderTopColor: isSelected ? c.blue : c.glassBorderHighlight
                }
              ]}
            >
              <View style={styles.hotspotTop}>
                <Text style={[styles.hotspotName, { color: c.ink }]}>
                  {spot.name}
                </Text>
                <View style={[styles.spotBadge, { backgroundColor: spotBadgeColor }]}>
                  <Text style={styles.spotBadgeText}>{spot.status}</Text>
                </View>
              </View>

              <View style={styles.hotspotBottom}>
                <Text style={[styles.depthLabel, { color: c.muted }]}>
                  Est. Depth: <Text style={{ color: c.ink, fontWeight: '800' }}>{spot.depthCm} cm</Text>
                </Text>
                <Text style={[styles.adviceLabel, { color: c.inkSecondary }]}>
                  {spot.advice}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      {/* 6-Hour Inundation Hydrograph & Catchment Runoff Visualizer */}
      <View style={[styles.cardSection, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Waves size={16} color={c.blue} />
            <Text style={[styles.cardHeaderTitle, { color: c.ink }]}>
              6-Hour Catchment Hydrograph
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c.blue }} />
              <Text style={{ fontSize: 9, color: c.muted }}>Rain (mm)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: statusColor }} />
              <Text style={{ fontSize: 9, color: c.muted }}>Runoff (cm)</Text>
            </View>
          </View>
        </View>

        {/* Bar Chart Container */}
        <View style={{ height: 110, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10, borderBottomWidth: 1, borderBottomColor: c.borderLight }}>
          {hydrograph.map((pt, i) => {
            const rainH = Math.max(8, Math.round((pt.rainfallMm / maxRain) * 80))
            const depthH = Math.max(8, Math.round((pt.runoffCm / maxDepth) * 80))
            return (
              <View key={i} style={{ alignItems: 'center', width: 44 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 82 }}>
                  {/* Rain Bar */}
                  <View style={{ width: 14, height: rainH, backgroundColor: c.blue, borderRadius: 3 }}>
                    <Text style={{ fontSize: 7, color: '#FFF', fontWeight: '700', textAlign: 'center', marginTop: 2 }}>
                      {pt.rainfallMm}
                    </Text>
                  </View>
                  {/* Runoff Depth Bar */}
                  <View style={{ width: 14, height: depthH, backgroundColor: statusColor, borderRadius: 3 }}>
                    <Text style={{ fontSize: 7, color: '#FFF', fontWeight: '700', textAlign: 'center', marginTop: 2 }}>
                      {pt.runoffCm}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 9, color: c.muted, marginTop: 6, fontWeight: '600' }}>
                  {pt.time}
                </Text>
              </View>
            )
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <Text style={{ fontSize: 10, color: c.muted }}>
            Peak Discharge: <Text style={{ color: c.ink, fontWeight: '700' }}>{Math.max(...hydrograph.map(h => h.rainfallMm))} mm/hr</Text>
          </Text>
          <Text style={{ fontSize: 10, color: c.muted }}>
            Peak Water Depth: <Text style={{ color: statusColor, fontWeight: '700' }}>{Math.max(...hydrograph.map(h => h.runoffCm))} cm</Text>
          </Text>
        </View>
      </View>

      {/* Transit & Commute Clearance Evaluator */}
      <View style={[styles.cardSection, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <ShieldAlert size={16} color={statusColor} />
          <Text style={[styles.cardHeaderTitle, { color: c.ink }]}>
            Commute & Transit Clearance Evaluator
          </Text>
        </View>
        <View style={{ gap: 8 }}>
          {transitClearance.map((tc, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: c.glassBgAlt, borderRadius: 8, borderWidth: 1, borderColor: c.glassBorderLight }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: c.ink }}>{tc.type}</Text>
                <Text style={{ fontSize: 10, color: c.muted }}>Safe limit: {tc.limit}</Text>
              </View>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: `${tc.color}15`, borderWidth: 1, borderColor: `${tc.color}40` }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: tc.color }}>{tc.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Municipal Disaster Advisory Guidance */}
      <View style={[styles.cardSection, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Landmark size={16} color={c.blue} />
          <Text style={[styles.cardHeaderTitle, { color: c.ink }]}>
            Municipal Control Room Directives
          </Text>
        </View>
        {(telemetry.recommendations || []).map((rec, i) => (
          <View key={i} style={styles.recRow}>
            <ShieldCheck size={14} color={c.statusSafe} style={{ marginTop: 2 }} />
            <Text style={[styles.recText, { color: c.inkSecondary }]}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Bottom Compact Pin Preference Row with Save Button */}
      <View
        style={[
          styles.pinCheckboxRow,
          {
            backgroundColor: isPinnedToHome ? 'rgba(245, 158, 11, 0.08)' : c.glassBg,
            borderColor: isPinnedToHome ? c.accentAmber : c.glassBorder,
            borderTopColor: isPinnedToHome ? c.accentAmber : c.glassBorderHighlight
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
                backgroundColor: isPinnedToHome ? c.accentAmber : c.cardAlt,
                borderColor: isPinnedToHome ? c.accentAmber : c.border
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
              {isPinnedToHome ? 'Live widget active on Home' : 'Check to pin urban flood telemetry'}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleSavePinPreference}
          disabled={!hasPinChanged}
          style={({ pressed }) => [
            styles.pinSaveBtn,
            {
              backgroundColor: hasPinChanged ? c.accentAmber : (isPinnedToHome ? 'rgba(245, 158, 11, 0.15)' : c.cardAlt),
              borderColor: hasPinChanged ? c.accentAmber : c.border,
              opacity: hasPinChanged ? 1 : 0.6
            },
            pressed && hasPinChanged && { opacity: 0.75 }
          ]}
        >
          <Text
            style={[
              styles.pinSaveBtnText,
              { color: hasPinChanged ? '#FFFFFF' : (isPinnedToHome ? c.accentAmber : c.muted) }
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
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cityName: {
    fontSize: 13,
    fontWeight: '800'
  },
  cityState: {
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
  heroCityTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  heroSub: {
    fontSize: 11,
    marginTop: 3
  },
  gaugeGrid: {
    flexDirection: 'row',
    gap: 8
  },
  gaugeCell: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4
  },
  gaugeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  gaugeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  gaugeVal: {
    fontSize: 22,
    fontWeight: '800'
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    marginVertical: 4
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3
  },
  gaugeSub: {
    fontSize: 10
  },
  cardSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  hotspotCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    gap: 6
  },
  hotspotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  hotspotName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1
  },
  spotBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  spotBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  hotspotBottom: {
    gap: 2
  },
  depthLabel: {
    fontSize: 11
  },
  adviceLabel: {
    fontSize: 11,
    lineHeight: 16
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6
  },
  recText: {
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

export default UrbanFloodScreen
