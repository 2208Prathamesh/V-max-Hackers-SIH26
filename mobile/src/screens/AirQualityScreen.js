import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions
} from 'react-native'
import { getColors } from '../theme/colors'
import { allCityDatabase } from '../data/mockData'

const POLLUTANTS = [
  {
    name: 'PM2.5',
    label: 'Fine Particulate Matter',
    value: '18.2 µg/m³',
    status: 'Good',
    percentage: 36,
    color: '#10B981'
  },
  {
    name: 'PM10',
    label: 'Respirable Particulate Matter',
    value: '42.0 µg/m³',
    status: 'Moderate',
    percentage: 55,
    color: '#F59E0B'
  },
  {
    name: 'NO₂',
    label: 'Nitrogen Dioxide',
    value: '14.5 ppb',
    status: 'Good',
    percentage: 25,
    color: '#10B981'
  },
  {
    name: 'O₃',
    label: 'Surface Ozone',
    value: '28.1 ppb',
    status: 'Good',
    percentage: 40,
    color: '#10B981'
  },
  {
    name: 'SO₂',
    label: 'Sulfur Dioxide',
    value: '3.2 ppb',
    status: 'Good',
    percentage: 15,
    color: '#10B981'
  },
  {
    name: 'CO',
    label: 'Carbon Monoxide',
    value: '0.4 ppm',
    status: 'Good',
    percentage: 10,
    color: '#10B981'
  }
]

const AQI_LEVELS = [
  { range: '0-50', label: 'Good', color: '#10B981' },
  { range: '51-100', label: 'Moderate', color: '#F59E0B' },
  { range: '101-150', label: 'Sensitive', color: '#F97316' },
  { range: '151-200', label: 'Unhealthy', color: '#EF4444' },
  { range: '201-300', label: 'Very Unhealthy', color: '#8B5CF6' },
  { range: '300+', label: 'Hazardous', color: '#831843' }
]

export function AirQualityScreen ({
  isDark = false,
  onNavigate,
  onNotification
}) {
  const c = getColors(isDark)
  const { width } = useWindowDimensions()
  const [selectedCityIndex, setSelectedCityIndex] = useState(0)

  const city = allCityDatabase[selectedCityIndex] || allCityDatabase[0]
  const aqiValue = city.aqi || 68

  const getAqiCategory = val => {
    if (val <= 50)
      return {
        label: 'Good',
        color: '#10B981',
        desc: 'Air quality is satisfactory, and air pollution poses little or no risk.',
        action: 'Enjoy outdoor activities normally.'
      }
    if (val <= 100)
      return {
        label: 'Moderate',
        color: '#F59E0B',
        desc: 'Air quality is acceptable; however, very sensitive individuals may experience slight respiratory irritation.',
        action: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.'
      }
    if (val <= 150)
      return {
        label: 'Unhealthy for Sensitive Groups',
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
        {allCityDatabase.slice(0, 5).map((item, idx) => {
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
            backgroundColor: isDark ? '#1F1B2E' : '#FAF5FF',
            borderColor: isDark ? '#3B2A56' : '#E9D5FF'
          }
        ]}
      >
        <View style={styles.heroHeader}>
          <View>
            <Text style={[styles.heroLocation, { color: c.ink }]}>
              {city.city}, {city.region}
            </Text>
            <Text style={[styles.heroSub, { color: c.muted }]}>
              Standard US-AQI Index • Live Sensor Reading
            </Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: `${category.color}20` }]}
          >
            <Text style={[styles.statusBadgeText, { color: category.color }]}>
              ● {category.label}
            </Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View>
            <Text style={[styles.scoreNumber, { color: isDark ? '#C084FC' : '#7E22CE' }]}>
              {aqiValue}
            </Text>
            <Text style={[styles.scoreLabel, { color: c.muted }]}>
              Index Value (0-500 scale)
            </Text>
          </View>

          <View style={styles.gaugeContainer}>
            <View style={styles.gaugePill}>
              <Text style={styles.gaugeEmoji}>💨</Text>
              <Text style={[styles.gaugeSubText, { color: c.ink }]}>Air Quality</Text>
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
              backgroundColor: isDark ? '#261F38' : '#F3E8FF',
              color: isDark ? '#E9D5FF' : '#581C87'
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
        <Text style={[styles.cardTitle, { color: c.ink }]}>
          🏥 Health & Precautionary Advisory
        </Text>
        <View style={styles.advisoryRow}>
          <Text style={styles.advisoryIcon}>💡</Text>
          <Text style={[styles.advisoryText, { color: c.inkSecondary }]}>
            {category.action}
          </Text>
        </View>
        <View style={styles.tipsGrid}>
          <View style={[styles.tipBox, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
            <Text style={styles.tipIcon}>😷</Text>
            <Text style={[styles.tipTitle, { color: c.ink }]}>Masks</Text>
            <Text style={[styles.tipDesc, { color: c.muted }]}>
              {aqiValue > 100 ? 'N95 advised' : 'Not required'}
            </Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
            <Text style={styles.tipIcon}>🪟</Text>
            <Text style={[styles.tipTitle, { color: c.ink }]}>Ventilation</Text>
            <Text style={[styles.tipDesc, { color: c.muted }]}>
              {aqiValue > 100 ? 'Keep closed' : 'Open windows'}
            </Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
            <Text style={styles.tipIcon}>🏃</Text>
            <Text style={[styles.tipTitle, { color: c.ink }]}>Outdoor Sports</Text>
            <Text style={[styles.tipDesc, { color: c.muted }]}>
              {aqiValue > 100 ? 'Limit activity' : 'Safe for exercise'}
            </Text>
          </View>
        </View>
      </View>

      {/* Pollutant Breakdown Cards */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.cardTitle, { color: c.ink, marginBottom: 12 }]}>
          🔬 Key Pollutant Concentrations
        </Text>
        <View style={styles.pollutantsList}>
          {POLLUTANTS.map(p => (
            <View
              key={p.name}
              style={[
                styles.pollutantCard,
                { backgroundColor: c.cardAlt, borderColor: c.border }
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

              {/* Progress track */}
              <View style={[styles.track, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 28, gap: 14 },
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 16
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  heroLocation: { fontSize: 15, fontWeight: '800' },
  heroSub: { fontSize: 9.5, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14
  },
  scoreNumber: { fontSize: 52, fontWeight: '900', letterSpacing: -1 },
  scoreLabel: { fontSize: 10, fontWeight: '600', marginTop: -2 },
  gaugeContainer: { alignItems: 'center' },
  gaugePill: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  gaugeEmoji: { fontSize: 26 },
  gaugeSubText: { fontSize: 8.5, fontWeight: '800', marginTop: 2 },
  spectrumBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6
  },
  spectrumSegment: { flex: 1 },
  spectrumLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  spectrumText: { fontSize: 8.5, fontWeight: '600' },
  categoryDesc: {
    fontSize: 10.5,
    lineHeight: 15,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    fontWeight: '600'
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16
  },
  cardTitle: { fontSize: 13, fontWeight: '800' },
  advisoryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 12
  },
  advisoryIcon: { fontSize: 15 },
  advisoryText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '500' },
  tipsGrid: {
    flexDirection: 'row',
    gap: 8
  },
  tipBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center'
  },
  tipIcon: { fontSize: 18, marginBottom: 4 },
  tipTitle: { fontSize: 10, fontWeight: '700' },
  tipDesc: { fontSize: 8.5, marginTop: 2, textAlign: 'center' },
  pollutantsList: { gap: 8 },
  pollutantCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1
  },
  pollutantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  pollutantName: { fontSize: 11, fontWeight: '800' },
  pollutantLabel: { fontSize: 8.5 },
  pollutantValue: { fontSize: 11, fontWeight: '800' },
  pollutantStatus: { fontSize: 9, fontWeight: '700' },
  track: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden'
  },
  fillBar: { height: '100%', borderRadius: 2.5 }
})
