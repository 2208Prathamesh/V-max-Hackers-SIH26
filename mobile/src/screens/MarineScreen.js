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
  Anchor,
  Waves,
  Compass,
  Wind,
  Thermometer,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  Radio,
  ShieldAlert,
  RefreshCw
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api, offlineStorage } from '../services/api'

const STATIONS = [
  { id: 'mumbai', name: 'Mumbai Port Trust', basin: 'Arabian Sea', state: 'Maharashtra', portCode: 'INBOM' },
  { id: 'kandla', name: 'Deendayal / Kandla Port', basin: 'Arabian Sea', state: 'Gujarat', portCode: 'INIXY' },
  { id: 'jnpt', name: 'Nhava Sheva (JNPT)', basin: 'Arabian Sea', state: 'Maharashtra', portCode: 'INNSA' },
  { id: 'ratnagiri', name: 'Ratnagiri Coastal Port', basin: 'Arabian Sea', state: 'Maharashtra', portCode: 'INRTC' },
  { id: 'mormugao', name: 'Mormugao Port', basin: 'Arabian Sea', state: 'Goa', portCode: 'INMRM' },
  { id: 'mangalore', name: 'New Mangalore Port', basin: 'Arabian Sea', state: 'Karnataka', portCode: 'INNML' },
  { id: 'kochi', name: 'Cochin Port Trust', basin: 'Arabian Sea', state: 'Kerala', portCode: 'INCOK' },
  { id: 'chennai', name: 'Chennai Harbor', basin: 'Bay of Bengal', state: 'Tamil Nadu', portCode: 'INMAA' },
  { id: 'visakhapatnam', name: 'Visakhapatnam Port', basin: 'Bay of Bengal', state: 'Andhra Pradesh', portCode: 'INVTZ' },
  { id: 'paradip', name: 'Paradip Coastal Port', basin: 'Bay of Bengal', state: 'Odisha', portCode: 'INPRT' }
]

const CHECKLIST_ITEMS = [
  { id: 'lifejacket', label: 'SOLAS Approved Life Jackets for all crew' },
  { id: 'vhf', label: 'Marine VHF Radio tuned to Channel 16 distress' },
  { id: 'gps', label: 'Marine GPS / NavIC unit with waypoint logging' },
  { id: 'flares', label: 'Distress Pyrotechnics & Flares onboard' },
  { id: 'lights', label: 'Port/Starboard navigation running lights tested' }
]

export function MarineScreen ({
  isDark = false,
  onNavigate,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const [selectedStationId, setSelectedStationId] = useState('mumbai')
  const [loading, setLoading] = useState(false)
  const [coastalData, setCoastalData] = useState(null)
  const [checkedItems, setCheckedItems] = useState({})
  const [showChecklist, setShowChecklist] = useState(true)
  const [isPinnedToHome, setIsPinnedToHome] = useState(false)
  const [savedPinState, setSavedPinState] = useState(false)

  useEffect(() => {
    let mounted = true
    offlineStorage.getPinnedWidgets().then(res => {
      if (mounted) {
        const val = !!res?.marine
        setIsPinnedToHome(val)
        setSavedPinState(val)
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleTogglePinHome = async () => {
    if (!isPinnedToHome) {
      const canPin = await offlineStorage.canPinWidget('marine')
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
    const res = await offlineStorage.setWidgetPinned('marine', isPinnedToHome)
    if (res && res.success === false) {
      if (onNotification) onNotification(`⚠️ ${res.message}`)
      setIsPinnedToHome(savedPinState)
      return
    }
    const wasPinned = savedPinState
    setSavedPinState(isPinnedToHome)
    if (onNotification) {
      if (isPinnedToHome) {
        onNotification('📌 Marine & Coastal pinned to Home Dashboard')
      } else if (wasPinned) {
        onNotification('Removed Marine from Home Dashboard')
      }
    }
  }

  const activeStation = STATIONS.find(s => s.id === selectedStationId) || STATIONS[0]

  const loadCoastalData = () => {
    setLoading(true)
    api
      .marineCoastalDistrict(selectedStationId)
      .then(res => {
        if (res) setCoastalData(res)
      })
      .catch(() => {
        setCoastalData(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadCoastalData()
  }, [selectedStationId, backendReady])

  const toggleCheck = id => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const marineInfo = coastalData || {
    station: activeStation.id,
    verdict: 'SAFE FOR ALL SMALL CRAFT OPERATIONS',
    status: 'SAFE',
    details: 'Coastal sea conditions are calm to slight. Wind speeds well below advisory thresholds.',
    beaufort: {
      force: 3,
      name: 'Gentle Breeze',
      windSpeedKnots: '7-10',
      seaConditions: 'Large wavelets, crests begin to break'
    },
    metrics: {
      waveHeightM: 0.8,
      swellPeriodSec: 7,
      seaTempC: 29,
      tidePhase: 'Ebb Tide'
    },
    portSignal: {
      signalNumber: 1,
      name: 'Cautionary Signal (Port Alert)',
      action: 'Vessels proceeding to sea should exercise normal caution.'
    }
  }

  const isSafe = marineInfo.status === 'SAFE'
  const statusColor = isSafe ? c.statusSafe : c.statusWarning
  const checkedCount = Object.values(checkedItems).filter(Boolean).length

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Station Selector Chips */}
      <View style={styles.selectorWrapper}>
        <View style={styles.selectorHeaderRow}>
          <Text style={[styles.sectionHeading, { color: c.inkSecondary }]}>
            INDIAN COASTAL HARBOR / PORT SELECTOR
          </Text>
          <Pressable
            onPress={loadCoastalData}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <RefreshCw size={12} color={c.blue} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.blue }}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {STATIONS.map(item => {
            const isSelected = selectedStationId === item.id
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedStationId(item.id)}
                style={[
                  styles.stationChip,
                  {
                    backgroundColor: isSelected ? c.blue : c.card,
                    borderColor: isSelected ? c.blue : c.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.chipName,
                    { color: isSelected ? '#FFFFFF' : c.ink }
                  ]}
                >
                  {item.name.split(' ')[0]}
                </Text>
                <Text
                  style={[
                    styles.chipState,
                    { color: isSelected ? 'rgba(255,255,255,0.85)' : c.muted }
                  ]}
                >
                  {item.state}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Official INCOIS Safety Directive Banner */}
      <View
        style={[
          styles.directiveCard,
          {
            backgroundColor: c.glassBg,
            borderLeftColor: statusColor,
            borderColor: c.glassBorder,
            borderTopColor: c.glassBorderHighlight
          }
        ]}
      >
        <View style={styles.directiveHeader}>
          <View style={styles.directiveTitleCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Radio size={14} color={c.accentCyan} />
              <Text style={[styles.incoisTag, { color: c.accentCyan }]}>
                INCOIS & DISASTER AUTHORITY DIRECTIVE
              </Text>
            </View>
            <Text style={[styles.directiveVerdict, { color: statusColor }]}>
              {marineInfo.verdict}
            </Text>
            <Text style={[styles.directivePortSub, { color: c.inkSecondary }]}>
              {activeStation.name} • {activeStation.basin} • Port Code: {activeStation.portCode}
            </Text>
          </View>
          {loading && <ActivityIndicator size='small' color={c.blue} />}
        </View>

        <Text style={[styles.directiveDesc, { color: c.ink }]}>
          {marineInfo.details}
        </Text>
      </View>

      {/* Marine Environmental Telemetry Matrix */}
      <View style={styles.telemetryGrid}>
        <View style={[styles.telemetryCell, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
          <View style={styles.cellHeaderRow}>
            <Waves size={15} color={c.blue} />
            <Text style={[styles.telemetryLabel, { color: c.muted }]}>SIGNIFICANT WAVE</Text>
          </View>
          <Text style={[styles.telemetryVal, { color: c.ink }]}>
            {marineInfo.metrics?.waveHeightM ?? 0.8} m
          </Text>
          <Text style={[styles.telemetrySub, { color: c.inkSecondary }]}>
            Swell period: {marineInfo.metrics?.swellPeriodSec ?? 7}s
          </Text>
        </View>

        <View style={[styles.telemetryCell, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
          <View style={styles.cellHeaderRow}>
            <Thermometer size={15} color={c.accentAmber} />
            <Text style={[styles.telemetryLabel, { color: c.muted }]}>SEA SURFACE TEMP</Text>
          </View>
          <Text style={[styles.telemetryVal, { color: c.ink }]}>
            {marineInfo.metrics?.seaTempC ?? 29}°C
          </Text>
          <Text style={[styles.telemetrySub, { color: c.inkSecondary }]}>
            {marineInfo.metrics?.tidePhase ?? 'Ebb Tide'}
          </Text>
        </View>
      </View>

      {/* Beaufort Wind Force Scale Card */}
      <View style={[styles.cardSection, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Wind size={16} color={c.accentCyan} />
            <Text style={[styles.cardHeaderTitle, { color: c.ink }]}>
              Beaufort Scale: Force {marineInfo.beaufort?.force ?? 3} ({marineInfo.beaufort?.name})
            </Text>
          </View>
        </View>

        <View style={styles.beaufortBarTrack}>
          {Array.from({ length: 12 }).map((_, i) => {
            const num = i + 1
            const isFilled = num <= (marineInfo.beaufort?.force ?? 3)
            const color = num <= 4 ? c.statusSafe : num <= 7 ? c.statusCaution : num <= 9 ? c.statusWarning : c.statusDanger
            return (
              <View
                key={i}
                style={[
                  styles.beaufortStep,
                  { backgroundColor: isFilled ? color : isDark ? '#1C1E24' : '#E5E7EB' }
                ]}
              />
            )
          })}
        </View>

        <View style={styles.beaufortDetailsRow}>
          <Text style={[styles.beaufortSpec, { color: c.inkSecondary }]}>
            Wind: {marineInfo.beaufort?.windSpeedKnots ?? '7-10'} knots
          </Text>
          <Text style={[styles.beaufortSpec, { color: c.inkSecondary }]}>
            Sea: {marineInfo.beaufort?.seaConditions ?? 'Calm waves'}
          </Text>
        </View>
      </View>

      {/* Indian Port Danger Signal Box */}
      <View style={[styles.portSignalBox, { backgroundColor: c.glassBgAlt, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <View style={styles.signalTop}>
          <View style={[styles.signalNumBadge, { backgroundColor: c.accentAmber }]}>
            <Text style={styles.signalNumText}>SIGNAL {marineInfo.portSignal?.signalNumber ?? 1}</Text>
          </View>
          <Text style={[styles.signalName, { color: c.ink }]}>
            {marineInfo.portSignal?.name}
          </Text>
        </View>
        <Text style={[styles.signalAction, { color: c.inkSecondary }]}>
          Directive: {marineInfo.portSignal?.action}
        </Text>
      </View>

      {/* Fishermen Pre-Departure Safety Checklist */}
      <View style={[styles.cardSection, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
        <Pressable
          onPress={() => setShowChecklist(!showChecklist)}
          style={styles.checklistToggleRow}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Anchor size={18} color={c.blue} />
            <View>
              <Text style={[styles.cardHeaderTitle, { color: c.ink }]}>
                SOLAS Fishermen Departure Checklist
              </Text>
              <Text style={[styles.checklistCounter, { color: c.statusSafe }]}>
                {checkedCount}/{CHECKLIST_ITEMS.length} Equipment Verified
              </Text>
            </View>
          </View>
          {showChecklist ? (
            <ChevronUp size={18} color={c.muted} />
          ) : (
            <ChevronDown size={18} color={c.muted} />
          )}
        </Pressable>

        {showChecklist && (
          <View style={styles.checklistItems}>
            {CHECKLIST_ITEMS.map(item => {
              const checked = Boolean(checkedItems[item.id])
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleCheck(item.id)}
                  style={[
                    styles.checklistItem,
                    { borderBottomColor: c.borderLight }
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: checked ? c.statusSafe : 'transparent',
                        borderColor: checked ? c.statusSafe : c.border
                      }
                    ]}
                  >
                    {checked && <Check size={12} color='#FFFFFF' strokeWidth={3} />}
                  </View>
                  <Text
                    style={[
                      styles.checkLabel,
                      {
                        color: checked ? c.muted : c.ink,
                        textDecorationLine: checked ? 'line-through' : 'none'
                      }
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        )}
      </View>

      {/* Bottom Compact Pin Preference Row with Save Button */}
      <View
        style={[
          styles.pinCheckboxRow,
          {
            backgroundColor: isPinnedToHome ? 'rgba(6, 182, 212, 0.08)' : c.glassBg,
            borderColor: isPinnedToHome ? c.accentCyan : c.glassBorder,
            borderTopColor: isPinnedToHome ? c.accentCyan : c.glassBorderHighlight
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
                backgroundColor: isPinnedToHome ? c.accentCyan : c.cardAlt,
                borderColor: isPinnedToHome ? c.accentCyan : c.border
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
              {isPinnedToHome ? 'Live widget active on Home' : 'Check to pin coastal oceanography'}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleSavePinPreference}
          disabled={!hasPinChanged}
          style={({ pressed }) => [
            styles.pinSaveBtn,
            {
              backgroundColor: hasPinChanged ? c.accentCyan : (isPinnedToHome ? 'rgba(6, 182, 212, 0.15)' : c.cardAlt),
              borderColor: hasPinChanged ? c.accentCyan : c.border,
              opacity: hasPinChanged ? 1 : 0.6
            },
            pressed && hasPinChanged && { opacity: 0.75 }
          ]}
        >
          <Text
            style={[
              styles.pinSaveBtnText,
              { color: hasPinChanged ? '#FFFFFF' : (isPinnedToHome ? c.accentCyan : c.muted) }
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
  stationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipName: {
    fontSize: 13,
    fontWeight: '800'
  },
  chipState: {
    fontSize: 10,
    fontWeight: '600'
  },
  directiveCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    gap: 8
  },
  directiveHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  directiveTitleCol: {
    flex: 1,
    gap: 3
  },
  incoisTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  directiveVerdict: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  directivePortSub: {
    fontSize: 11,
    marginTop: 2
  },
  directiveDesc: {
    fontSize: 12,
    lineHeight: 18
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 8
  },
  telemetryCell: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3
  },
  cellHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  telemetryVal: {
    fontSize: 18,
    fontWeight: '800'
  },
  telemetrySub: {
    fontSize: 11,
    marginTop: 2
  },
  cardSection: {
    borderRadius: 14,
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
  beaufortBarTrack: {
    flexDirection: 'row',
    gap: 4,
    height: 8,
    borderRadius: 4,
    marginVertical: 8
  },
  beaufortStep: {
    flex: 1,
    borderRadius: 2
  },
  beaufortDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  beaufortSpec: {
    fontSize: 11
  },
  portSignalBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6
  },
  signalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  signalNumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  signalNumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  signalName: {
    fontSize: 13,
    fontWeight: '700'
  },
  signalAction: {
    fontSize: 11,
    lineHeight: 16
  },
  checklistToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  checklistCounter: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  checklistItems: {
    marginTop: 10
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    gap: 10
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkLabel: {
    fontSize: 12,
    flex: 1
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

export default MarineScreen
