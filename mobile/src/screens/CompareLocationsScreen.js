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

export function CompareLocationsScreen ({
  isDark = false,
  unit = 'C',
  onNavigate
}) {
  const c = getColors(isDark)
  const { width } = useWindowDimensions()

  const [city1Id, setCity1Id] = useState(allCityDatabase[0]?.id || 'loc-1')
  const [city2Id, setCity2Id] = useState(allCityDatabase[1]?.id || 'loc-2')
  const [activePicker, setActivePicker] = useState(null) // 'city1' | 'city2' | null

  const city1 =
    allCityDatabase.find(item => item.id === city1Id) || allCityDatabase[0]
  const city2 =
    allCityDatabase.find(item => item.id === city2Id) ||
    allCityDatabase[1] ||
    allCityDatabase[0]

  const formatTemp = tempC => {
    if (tempC == null) return '--'
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`
    }
    return `${tempC}°C`
  }

  const handleSwap = () => {
    const temp = city1Id
    setCity1Id(city2Id)
    setCity2Id(temp)
  }

  const comparisonRows = [
    { label: 'Condition', val1: city1.condition, val2: city2.condition },
    {
      label: 'Feels Like',
      val1: formatTemp(city1.feelsLikeC),
      val2: formatTemp(city2.feelsLikeC)
    },
    {
      label: 'Humidity',
      val1: `${city1.humidity}%`,
      val2: `${city2.humidity}%`
    },
    {
      label: 'Wind Speed',
      val1: `${city1.windSpeedKmh} km/h`,
      val2: `${city2.windSpeedKmh} km/h`
    },
    {
      label: 'Wind Direction',
      val1: city1.windDirection || 'NW',
      val2: city2.windDirection || 'W'
    },
    {
      label: 'Air Quality (AQI)',
      val1: city1.aqi || 68,
      val2: city2.aqi || 82
    },
    {
      label: 'UV Index',
      val1: city1.uvIndex || '6 (High)',
      val2: city2.uvIndex || '8 (Very High)'
    },
    {
      label: 'Rain Probability',
      val1: city1.condition.toLowerCase().includes('rain') ? '80%' : '15%',
      val2: city2.condition.toLowerCase().includes('rain') ? '75%' : '20%'
    }
  ]

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header bar with Swap Button */}
      <View
        style={[
          styles.headerCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: c.ink }]}>
            Side-by-Side Comparison
          </Text>
          <Text style={[styles.headerSub, { color: c.muted }]}>
            Compare real-time weather across 2 regions
          </Text>
        </View>

        <Pressable
          onPress={handleSwap}
          style={[styles.swapBtn, { backgroundColor: c.blueLight }]}
          accessibilityLabel='Swap locations'
        >
          <Text style={[styles.swapBtnText, { color: c.blue }]}>⇄ Swap</Text>
        </Pressable>
      </View>

      {/* City Pickers Row */}
      <View style={styles.pickersGrid}>
        {/* City 1 Picker Box */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.pickerLabel, { color: c.muted }]}>
            LOCATION 1
          </Text>
          <Pressable
            onPress={() =>
              setActivePicker(activePicker === 'city1' ? null : 'city1')
            }
            style={[
              styles.pickerBtn,
              { backgroundColor: c.card, borderColor: c.border },
              activePicker === 'city1' && { borderColor: c.blue }
            ]}
          >
            <Text style={[styles.pickerValue, { color: c.ink }]} numberOfLines={1}>
              {city1.city}
            </Text>
            <Text style={[styles.pickerChevron, { color: c.muted }]}>▾</Text>
          </Pressable>
        </View>

        {/* City 2 Picker Box */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.pickerLabel, { color: c.muted }]}>
            LOCATION 2
          </Text>
          <Pressable
            onPress={() =>
              setActivePicker(activePicker === 'city2' ? null : 'city2')
            }
            style={[
              styles.pickerBtn,
              { backgroundColor: c.card, borderColor: c.border },
              activePicker === 'city2' && { borderColor: c.blue }
            ]}
          >
            <Text style={[styles.pickerValue, { color: c.ink }]} numberOfLines={1}>
              {city2.city}
            </Text>
            <Text style={[styles.pickerChevron, { color: c.muted }]}>▾</Text>
          </Pressable>
        </View>
      </View>

      {/* Dropdown Options List if a picker is open */}
      {activePicker && (
        <View
          style={[
            styles.dropdownTray,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <Text style={[styles.dropdownTrayTitle, { color: c.muted }]}>
            Select {activePicker === 'city1' ? 'First' : 'Second'} Location:
          </Text>
          <View style={styles.cityOptionsRow}>
            {allCityDatabase.map(item => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (activePicker === 'city1') setCity1Id(item.id)
                  else setCity2Id(item.id)
                  setActivePicker(null)
                }}
                style={[
                  styles.cityOptionChip,
                  { backgroundColor: c.cardAlt, borderColor: c.border },
                  (activePicker === 'city1'
                    ? city1Id === item.id
                    : city2Id === item.id) && {
                    backgroundColor: c.blueLight,
                    borderColor: c.blue
                  }
                ]}
              >
                <Text
                  style={[
                    styles.cityOptionText,
                    {
                      color:
                        (activePicker === 'city1'
                          ? city1Id === item.id
                          : city2Id === item.id)
                          ? c.blue
                          : c.ink
                    }
                  ]}
                >
                  {item.city}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Big Side-by-Side Hero Cards */}
      <View style={styles.heroCardsRow}>
        {/* Card 1 */}
        <View
          style={[
            styles.heroCityCard,
            {
              backgroundColor: isDark ? '#1C293E' : '#EFF6FF',
              borderColor: isDark ? '#2E476C' : '#BFDBFE'
            }
          ]}
        >
          <Text style={[styles.heroCityName, { color: c.blue }]}>
            {city1.city}
          </Text>
          <Text style={[styles.heroCitySub, { color: c.muted }]}>
            {city1.region}
          </Text>
          <Text style={[styles.heroCityTemp, { color: c.ink }]}>
            {formatTemp(city1.tempC)}
          </Text>
          <Text style={[styles.heroCityCond, { color: c.inkSecondary }]}>
            {city1.condition}
          </Text>
        </View>

        {/* Card 2 */}
        <View
          style={[
            styles.heroCityCard,
            {
              backgroundColor: isDark ? '#231E3D' : '#F5F3FF',
              borderColor: isDark ? '#433878' : '#DDD6FE'
            }
          ]}
        >
          <Text style={[styles.heroCityName, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>
            {city2.city}
          </Text>
          <Text style={[styles.heroCitySub, { color: c.muted }]}>
            {city2.region}
          </Text>
          <Text style={[styles.heroCityTemp, { color: c.ink }]}>
            {formatTemp(city2.tempC)}
          </Text>
          <Text style={[styles.heroCityCond, { color: c.inkSecondary }]}>
            {city2.condition}
          </Text>
        </View>
      </View>

      {/* Comparison Metrics Table */}
      <View
        style={[
          styles.tableCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.tableTitle, { color: c.ink }]}>
          Detailed Metric Breakdown
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { flex: 1.2, color: c.muted }]}>
            METRIC
          </Text>
          <Text
            style={[
              styles.colHeader,
              { flex: 1, textAlign: 'center', color: c.blue }
            ]}
          >
            {city1.city}
          </Text>
          <Text
            style={[
              styles.colHeader,
              {
                flex: 1,
                textAlign: 'center',
                color: isDark ? '#A78BFA' : '#7C3AED'
              }
            ]}
          >
            {city2.city}
          </Text>
        </View>

        {comparisonRows.map((row, idx) => (
          <View
            key={row.label}
            style={[
              styles.tableRow,
              { borderTopColor: c.borderLight },
              idx % 2 === 1 && { backgroundColor: c.cardAlt }
            ]}
          >
            <Text style={[styles.rowLabel, { flex: 1.2, color: c.muted }]}>
              {row.label}
            </Text>
            <Text
              style={[
                styles.rowValue,
                { flex: 1, textAlign: 'center', color: c.ink }
              ]}
            >
              {row.val1}
            </Text>
            <Text
              style={[
                styles.rowValue,
                { flex: 1, textAlign: 'center', color: c.ink }
              ]}
            >
              {row.val2}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 28, gap: 14 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 13, fontWeight: '800' },
  headerSub: { fontSize: 9.5, marginTop: 1 },
  swapBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  swapBtnText: { fontSize: 11, fontWeight: '800' },
  pickersGrid: { flexDirection: 'row', gap: 10 },
  pickerLabel: { fontSize: 9, fontWeight: '800', marginBottom: 4 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1
  },
  pickerValue: { fontSize: 12, fontWeight: '700', flex: 1 },
  pickerChevron: { fontSize: 11, marginLeft: 4 },
  dropdownTray: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1
  },
  dropdownTrayTitle: { fontSize: 9.5, fontWeight: '700', marginBottom: 8 },
  cityOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityOptionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  cityOptionText: { fontSize: 10.5, fontWeight: '600' },
  heroCardsRow: { flexDirection: 'row', gap: 10 },
  heroCityCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center'
  },
  heroCityName: { fontSize: 13, fontWeight: '800' },
  heroCitySub: { fontSize: 9, marginTop: 1 },
  heroCityTemp: { fontSize: 30, fontWeight: '900', marginVertical: 8 },
  heroCityCond: { fontSize: 10, fontWeight: '600' },
  tableCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1
  },
  tableTitle: { fontSize: 12, fontWeight: '800', marginBottom: 12 },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    paddingHorizontal: 6
  },
  colHeader: { fontSize: 9, fontWeight: '800' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderTopWidth: 1
  },
  rowLabel: { fontSize: 10.5, fontWeight: '600' },
  rowValue: { fontSize: 10.5, fontWeight: '700' }
})
