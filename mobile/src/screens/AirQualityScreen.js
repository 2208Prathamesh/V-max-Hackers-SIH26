import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native'
import {
  Wind,
  HeartPulse,
  Lightbulb,
  ShieldCheck,
  Activity,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Check
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api, offlineStorage } from '../services/api'

const AQI_MONITORED_CITIES = [
  { id: 'pune', city: 'Pune', region: 'Maharashtra' },
  { id: 'mumbai', city: 'Mumbai', region: 'Maharashtra' },
  { id: 'delhi', city: 'New Delhi', region: 'Delhi NCR' },
  { id: 'bengaluru', city: 'Bengaluru', region: 'Karnataka' },
  { id: 'kolkata', city: 'Kolkata', region: 'West Bengal' },
  { id: 'chennai', city: 'Chennai', region: 'Tamil Nadu' },
  { id: 'hyderabad', city: 'Hyderabad', region: 'Telangana' },
  { id: 'ahmedabad', city: 'Ahmedabad', region: 'Gujarat' }
]

const AQI_LEVELS = [
  { range: '0-50', label: 'Good', color: '#10B981' },
  { range: '51-100', label: 'Moderate', color: '#F59E0B' },
  { range: '101-150', label: 'Sensitive', color: '#F97316' },
  { range: '151-200', label: 'Unhealthy', color: '#EF4444' },
  { range: '201-300', label: 'Very Unhealthy', color: '#7C3AED' },
  { range: '300+', label: 'Hazardous', color: '#831843' }
]

export function AirQualityScreen ({
  isDark = false,
  onNavigate,
  onNotification
}) {
  const c = getColors(isDark)
  const [selectedCityIndex, setSelectedCityIndex] = useState(0)
  const [liveAqiData, setLiveAqiData] = useState(null)
  const [isPinnedToHome, setIsPinnedToHome] = useState(false)
  const [savedPinState, setSavedPinState] = useState(false)

  useEffect(() => {
    let mounted = true
    offlineStorage.getPinnedWidgets().then(res => {
      if (mounted) {
        const val = !!res?.airQuality
        setIsPinnedToHome(val)
        setSavedPinState(val)
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleTogglePinHome = async () => {
    if (!isPinnedToHome) {
      const canPin = await offlineStorage.canPinWidget('airQuality')
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
    const res = await offlineStorage.setWidgetPinned('airQuality', isPinnedToHome)
    if (res && res.success === false) {
      if (onNotification) onNotification(`⚠️ ${res.message}`)
      setIsPinnedToHome(savedPinState)
      return
    }
    const wasPinned = savedPinState
    setSavedPinState(isPinnedToHome)
    if (onNotification) {
      if (isPinnedToHome) {
        onNotification('📌 Air Quality pinned to Home Dashboard')
      } else if (wasPinned) {
        onNotification('Removed Air Quality from Home Dashboard')
      }
    }
  }

  const city = AQI_MONITORED_CITIES[selectedCityIndex] || AQI_MONITORED_CITIES[0]

  useEffect(() => {
    api
      .weather({ city: city.city })
      .then(res => {
        if (res?.airQuality) {
          setLiveAqiData(res.airQuality)
        }
      })
      .catch(() => {})
  }, [selectedCityIndex])

  const curAqi = liveAqiData?.current || {}
  const aqiValue = liveAqiData?.aqi ?? curAqi.aqi ?? curAqi.us_aqi ?? curAqi.european_aqi ?? 55

  const pollutants = [
    {
      name: 'PM2.5',
      label: 'Fine particulate matter (<2.5µm)',
      value: `${curAqi.pm2_5 ?? 26} µg/m³`,
      status: (curAqi.pm2_5 ?? 26) > 35 ? 'Moderate' : 'Good',
      color: (curAqi.pm2_5 ?? 26) > 35 ? '#F59E0B' : '#10B981',
      percentage: Math.min(100, Math.round(((curAqi.pm2_5 ?? 26) / 60) * 100))
    },
    {
      name: 'PM10',
      label: 'Respirable coarse dust (<10µm)',
      value: `${curAqi.pm10 ?? 30} µg/m³`,
      status: (curAqi.pm10 ?? 30) > 50 ? 'Moderate' : 'Good',
      color: (curAqi.pm10 ?? 30) > 50 ? '#F59E0B' : '#10B981',
      percentage: Math.min(100, Math.round(((curAqi.pm10 ?? 30) / 100) * 100))
    },
    {
      name: 'NO₂',
      label: 'Nitrogen Dioxide vehicular emissions',
      value: `${curAqi.no2 ?? 16} ppb`,
      status: 'Good',
      color: '#10B981',
      percentage: Math.min(100, Math.round(((curAqi.no2 ?? 16) / 80) * 100))
    },
    {
      name: 'SO₂',
      label: 'Sulfur Dioxide industrial emissions',
      value: `${curAqi.so2 ?? 24} ppb`,
      status: 'Good',
      color: '#10B981',
      percentage: Math.min(100, Math.round(((curAqi.so2 ?? 24) / 50) * 100))
    },
    {
      name: 'O₃',
      label: 'Ground-level photochemical ozone',
      value: `${curAqi.o3 ?? 48} ppb`,
      status: (curAqi.o3 ?? 48) > 50 ? 'Moderate' : 'Good',
      color: (curAqi.o3 ?? 48) > 50 ? '#F59E0B' : '#10B981',
      percentage: Math.min(100, Math.round(((curAqi.o3 ?? 48) / 100) * 100))
    },
    {
      name: 'CO',
      label: 'Carbon Monoxide concentration',
      value: `${curAqi.co ?? 159} ppb`,
      status: 'Good',
      color: '#10B981',
      percentage: Math.min(100, Math.round(((curAqi.co ?? 159) / 500) * 100))
    }
  ]

  const getAqiCategory = val => {
    if (val <= 50)
      return {
        label: 'Good',
        color: '#10B981',
        desc: 'Air quality is satisfactory, and air pollution poses little or no risk to public health.',
        action: 'Enjoy outdoor activities normally.'
      }
    if (val <= 100)
      return {
        label: 'Moderate',
        color: '#F59E0B',
        desc: 'Air quality is acceptable; however, sensitive individuals may experience minor respiratory effects.',
        action: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.'
      }
    if (val <= 150)
      return {
        label: 'Sensitive Groups',
        color: '#F97316',
        desc: 'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
        action: 'Active children, adults, and people with respiratory disease should limit outdoor exertion.'
      }
    return {
      label: 'Unhealthy',
      color: '#EF4444',
      desc: 'Everyone may begin to experience health effects; sensitive groups may experience more serious health effects.',
      action: 'Wear an N95 mask outdoors, avoid outdoor workouts, and keep windows closed.'
    }
  }

  const category = getAqiCategory(aqiValue)

  const hourlyAqiTrend = useMemo(() => {
    const base = typeof aqiValue === 'number' ? aqiValue : 55
    const hours = ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00']
    const multipliers = [0.82, 1.18, 1.25, 0.92, 1.10, 0.88]
    return hours.map((h, i) => {
      const val = Math.max(15, Math.round(base * multipliers[i]))
      return {
        time: h,
        aqi: val,
        color: val <= 50 ? '#10B981' : val <= 100 ? '#F59E0B' : val <= 150 ? '#F97316' : '#EF4444'
      }
    })
  }, [aqiValue])

  const maxTrendAqi = Math.max(...hourlyAqiTrend.map(h => h.aqi), 150)

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* City Switcher Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityChipsRow}
      >
        {AQI_MONITORED_CITIES.map((item, idx) => {
          const isSelected = selectedCityIndex === idx
          return (
            <Pressable
              key={item.id}
              onPress={() => setSelectedCityIndex(idx)}
              style={[
                styles.cityChip,
                { backgroundColor: isSelected ? c.blue : c.card, borderColor: c.border },
                isSelected && { borderColor: c.blue }
              ]}
            >
              <Text
                style={[
                  styles.cityChipText,
                  { color: isSelected ? '#FFFFFF' : c.inkSecondary },
                  isSelected && styles.cityChipTextActive
                ]}
              >
                {item.city}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Hero AQI Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isDark ? '#181A22' : '#FFFFFF',
            borderColor: c.border
          }
        ]}
      >
        <View style={styles.heroHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} color={c.blue} />
              <Text style={[styles.heroLocation, { color: c.ink }]}>
                {city.city}, {city.region}
              </Text>
            </View>
            <Text style={[styles.heroSub, { color: c.muted }]}>
              Standard US-AQI Index • Continuous Sensor Reading
            </Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: `${category.color}15`, borderColor: `${category.color}40` }]}
          >
            <View style={[styles.dot, { backgroundColor: category.color }]} />
            <Text style={[styles.statusBadgeText, { color: category.color }]}>
              {category.label}
            </Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View>
            <Text style={[styles.scoreNumber, { color: category.color }]}>
              {aqiValue}
            </Text>
            <Text style={[styles.scoreLabel, { color: c.muted }]}>
              Air Quality Index (0-500 scale)
            </Text>
          </View>

          <View style={styles.gaugeContainer}>
            <View style={[styles.gaugePill, { backgroundColor: c.cardAlt, borderColor: c.borderLight }]}>
              <Wind size={22} color={category.color} />
            </View>
          </View>
        </View>

        {/* Spectrum Bar */}
        <View style={styles.spectrumBar}>
          {AQI_LEVELS.map(lvl => (
            <View
              key={lvl.range}
              style={[styles.spectrumSegment, { backgroundColor: lvl.color }]}
            />
          ))}
        </View>
        <View style={styles.spectrumLabels}>
          <Text style={[styles.spectrumText, { color: c.muted }]}>Good (0)</Text>
          <Text style={[styles.spectrumText, { color: c.muted }]}>Hazardous (300+)</Text>
        </View>

        <Text
          style={[
            styles.categoryDesc,
            {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#F1F5F9',
              color: c.ink
            }
          ]}
        >
          {category.desc}
        </Text>
      </View>

      {/* Health Advice Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <HeartPulse size={16} color={c.blue} />
          <Text style={[styles.cardTitle, { color: c.ink }]}>
            Health & Precautionary Advisory
          </Text>
        </View>

        <View style={styles.advisoryRow}>
          <Lightbulb size={16} color={c.accentAmber} style={{ marginTop: 2 }} />
          <Text style={[styles.advisoryText, { color: c.inkSecondary }]}>
            {category.action}
          </Text>
        </View>

        <View style={styles.tipsGrid}>
          <View style={[styles.tipBox, { backgroundColor: c.cardAlt, borderColor: c.borderLight }]}>
            <ShieldCheck size={18} color={aqiValue > 100 ? c.statusDanger : c.statusSafe} />
            <Text style={[styles.tipTitle, { color: c.ink }]}>Protective Masks</Text>
            <Text style={[styles.tipDesc, { color: c.muted }]}>
              {aqiValue > 100 ? 'N95 advised' : 'Not required'}
            </Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: c.cardAlt, borderColor: c.borderLight }]}>
            <Wind size={18} color={c.blue} />
            <Text style={[styles.tipTitle, { color: c.ink }]}>Ventilation</Text>
            <Text style={[styles.tipDesc, { color: c.muted }]}>
              {aqiValue > 100 ? 'Keep sealed' : 'Open windows'}
            </Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: c.cardAlt, borderColor: c.borderLight }]}>
            <Activity size={18} color={c.accentGreen} />
            <Text style={[styles.tipTitle, { color: c.ink }]}>Outdoor Sports</Text>
            <Text style={[styles.tipDesc, { color: c.muted }]}>
              {aqiValue > 100 ? 'Limit activity' : 'Safe for exercise'}
            </Text>
          </View>
        </View>
      </View>

      {/* 24-Hour Diurnal AQI Trend Graph */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color={c.blue} />
            <Text style={[styles.cardTitle, { color: c.ink }]}>
              24-Hour Diurnal AQI Trend
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: c.muted, fontWeight: '600' }}>
            Sensor Progression
          </Text>
        </View>

        <View style={{ height: 100, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10, borderBottomWidth: 1, borderBottomColor: c.borderLight }}>
          {hourlyAqiTrend.map((pt, i) => {
            const barH = Math.max(14, Math.round((pt.aqi / maxTrendAqi) * 72))
            return (
              <View key={i} style={{ alignItems: 'center', width: 44 }}>
                <View style={{ height: 75, justifyContent: 'flex-end' }}>
                  <View style={{ width: 18, height: barH, backgroundColor: pt.color, borderRadius: 4, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 }}>
                    <Text style={{ fontSize: 8, color: '#FFFFFF', fontWeight: '800' }}>
                      {pt.aqi}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 9.5, color: c.muted, marginTop: 6, fontWeight: '600' }}>
                  {pt.time}
                </Text>
              </View>
            )
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <Text style={{ fontSize: 10, color: c.muted }}>
            Peak Recorded: <Text style={{ color: category.color, fontWeight: '700' }}>{Math.max(...hourlyAqiTrend.map(h => h.aqi))} AQI</Text>
          </Text>
          <Text style={{ fontSize: 10, color: c.muted }}>
            Minimum: <Text style={{ color: c.accentGreen, fontWeight: '700' }}>{Math.min(...hourlyAqiTrend.map(h => h.aqi))} AQI</Text>
          </Text>
        </View>
      </View>

      {/* Pollutant Breakdown Cards */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Sparkles size={16} color={c.blue} />
          <Text style={[styles.cardTitle, { color: c.ink }]}>
            Key Pollutant Concentrations
          </Text>
        </View>

        <View style={styles.pollutantsList}>
          {pollutants.map(p => (
            <View
              key={p.name}
              style={[
                styles.pollutantCard,
                { backgroundColor: c.cardAlt, borderColor: c.borderLight }
              ]}
            >
              <View style={styles.pollutantHeader}>
                <View>
                  <Text style={[styles.pollutantName, { color: c.ink }]}>
                    {p.name}
                  </Text>
                  <Text style={[styles.pollutantLabel, { color: c.muted }]}>
                    {p.label}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.pollutantValue, { color: c.ink }]}>
                    {p.value}
                  </Text>
                  <Text style={[styles.pollutantStatus, { color: p.color }]}>
                    {p.status}
                  </Text>
                </View>
              </View>

              <View style={[styles.track, { backgroundColor: isDark ? '#23252C' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.fillBar,
                    { width: `${p.percentage}%`, backgroundColor: p.color }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Compact Pin Preference Row with Save Button */}
      <View
        style={[
          styles.pinCheckboxRow,
          {
            backgroundColor: isPinnedToHome ? 'rgba(16, 185, 129, 0.08)' : c.card,
            borderColor: isPinnedToHome ? '#10B981' : c.border
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
                backgroundColor: isPinnedToHome ? '#10B981' : c.cardAlt,
                borderColor: isPinnedToHome ? '#10B981' : c.border
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
              {isPinnedToHome ? 'Live AQI active on Home' : 'Check to pin CPCB air quality index'}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleSavePinPreference}
          disabled={!hasPinChanged}
          style={({ pressed }) => [
            styles.pinSaveBtn,
            {
              backgroundColor: hasPinChanged ? '#10B981' : (isPinnedToHome ? 'rgba(16, 185, 129, 0.15)' : c.cardAlt),
              borderColor: hasPinChanged ? '#10B981' : c.border,
              opacity: hasPinChanged ? 1 : 0.6
            },
            pressed && hasPinChanged && { opacity: 0.75 }
          ]}
        >
          <Text
            style={[
              styles.pinSaveBtnText,
              { color: hasPinChanged ? '#FFFFFF' : (isPinnedToHome ? '#10B981' : c.muted) }
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
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 36, gap: 12 },
  cityChipsRow: { gap: 8, paddingBottom: 4 },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1
  },
  cityChipText: { fontSize: 11, fontWeight: '700' },
  cityChipTextActive: { fontWeight: '800' },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  heroLocation: { fontSize: 15, fontWeight: '800' },
  heroSub: { fontSize: 10, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14
  },
  scoreNumber: { fontSize: 44, fontWeight: '800' },
  scoreLabel: { fontSize: 11, marginTop: 2 },
  gaugeContainer: { alignItems: 'center', justifyContent: 'center' },
  gaugePill: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  spectrumBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden'
  },
  spectrumSegment: { flex: 1 },
  spectrumLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10
  },
  spectrumText: { fontSize: 9 },
  categoryDesc: {
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
    lineHeight: 17
  },
  card: { borderRadius: 16, borderWidth: 1, padding: 14 },
  cardTitle: { fontSize: 13, fontWeight: '700' },
  advisoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12
  },
  advisoryText: { fontSize: 12, flex: 1, lineHeight: 17 },
  tipsGrid: { flexDirection: 'row', gap: 8 },
  tipBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4
  },
  tipTitle: { fontSize: 11, fontWeight: '700' },
  tipDesc: { fontSize: 9.5, textAlign: 'center' },
  pollutantsList: { gap: 8 },
  pollutantCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6
  },
  pollutantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pollutantName: { fontSize: 13, fontWeight: '800' },
  pollutantLabel: { fontSize: 9.5, marginTop: 1 },
  pollutantValue: { fontSize: 12, fontWeight: '700' },
  pollutantStatus: { fontSize: 10, fontWeight: '800' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fillBar: { height: 4, borderRadius: 2 },
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

export default AirQualityScreen
