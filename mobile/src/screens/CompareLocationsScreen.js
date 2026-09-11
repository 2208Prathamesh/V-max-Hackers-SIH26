import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native'
import {
  ArrowLeftRight,
  ChevronDown,
  MapPin,
  Thermometer,
  Wind,
  Compass,
  Gauge,
  Activity,
  Sun,
  CloudRain
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api } from '../services/api'
import { WeatherIcon } from '../components/WeatherIcon'

const COMPARISON_STATIONS = [
  { id: 'pune', city: 'Pune', region: 'Maharashtra' },
  { id: 'mumbai', city: 'Mumbai', region: 'Maharashtra' },
  { id: 'delhi', city: 'New Delhi', region: 'Delhi NCR' },
  { id: 'bengaluru', city: 'Bengaluru', region: 'Karnataka' },
  { id: 'kolkata', city: 'Kolkata', region: 'West Bengal' },
  { id: 'chennai', city: 'Chennai', region: 'Tamil Nadu' },
  { id: 'hyderabad', city: 'Hyderabad', region: 'Telangana' },
  { id: 'ahmedabad', city: 'Ahmedabad', region: 'Gujarat' },
  { id: 'jaipur', city: 'Jaipur', region: 'Rajasthan' },
  { id: 'nagpur', city: 'Nagpur', region: 'Maharashtra' }
]

export function CompareLocationsScreen ({
  isDark = false,
  unit = 'C',
  onNavigate,
  onNotification
}) {
  const c = getColors(isDark)
  const [city1Id, setCity1Id] = useState('pune')
  const [city2Id, setCity2Id] = useState('mumbai')
  const [activePicker, setActivePicker] = useState(null)
  const [liveWeather1, setLiveWeather1] = useState(null)
  const [liveWeather2, setLiveWeather2] = useState(null)

  const city1 = COMPARISON_STATIONS.find(c => c.id === city1Id) || COMPARISON_STATIONS[0]
  const city2 = COMPARISON_STATIONS.find(c => c.id === city2Id) || COMPARISON_STATIONS[1]

  useEffect(() => {
    api.weather({ city: city1.city }).then(res => {
      if (res) setLiveWeather1(res)
    }).catch(() => {})

    api.weather({ city: city2.city }).then(res => {
      if (res) setLiveWeather2(res)
    }).catch(() => {})
  }, [city1Id, city2Id])

  const formatTemp = val => {
    if (val === null || val === undefined) return '--'
    if (unit === 'F') {
      return `${Math.round((val * 9) / 5 + 32)}°F`
    }
    return `${Math.round(val)}°C`
  }

  const handleSwap = () => {
    const temp = city1Id
    setCity1Id(city2Id)
    setCity2Id(temp)
  }

  const cur1 = liveWeather1?.forecast?.current || liveWeather1?.current || {}
  const cur2 = liveWeather2?.forecast?.current || liveWeather2?.current || {}

  const temp1 = cur1.temperature ?? 27
  const temp2 = cur2.temperature ?? 28
  const feels1 = cur1.apparentTemperature ?? cur1.feelsLike ?? temp1
  const feels2 = cur2.apparentTemperature ?? cur2.feelsLike ?? temp2
  const hum1 = cur1.humidity ?? 70
  const hum2 = cur2.humidity ?? 75
  const wind1 = cur1.windSpeed ?? cur1.windSpeedKmh ?? 14
  const wind2 = cur2.windSpeed ?? cur2.windSpeedKmh ?? 18
  const pres1 = cur1.pressure ? Math.round(cur1.pressure) : 1008
  const pres2 = cur2.pressure ? Math.round(cur2.pressure) : 1006
  const cond1 = cur1.condition || cur1.weatherDescription || 'Partly Cloudy'
  const cond2 = cur2.condition || cur2.weatherDescription || 'Clear'

  const COMPARISON_METRICS = [
    {
      label: 'Temperature',
      icon: Thermometer,
      val1: formatTemp(temp1),
      val2: formatTemp(temp2)
    },
    {
      label: 'Feels Like',
      icon: Thermometer,
      val1: formatTemp(feels1),
      val2: formatTemp(feels2)
    },
    {
      label: 'Humidity',
      icon: CloudRain,
      val1: `${hum1}%`,
      val2: `${hum2}%`
    },
    {
      label: 'Wind Speed',
      icon: Wind,
      val1: `${wind1} km/h`,
      val2: `${wind2} km/h`
    },
    {
      label: 'Atmospheric Pressure',
      icon: Gauge,
      val1: `${pres1} hPa`,
      val2: `${pres2} hPa`
    },
    {
      label: 'Weather Condition',
      icon: Sun,
      val1: cond1,
      val2: cond2
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
            Comparative Telemetry
          </Text>
          <Text style={[styles.headerSub, { color: c.muted }]}>
            Side-by-side multi-city meteorological comparison
          </Text>
        </View>

        <Pressable
          onPress={handleSwap}
          style={[styles.swapBtn, { backgroundColor: c.blueLight }]}
          accessibilityLabel='Swap locations'
        >
          <ArrowLeftRight size={14} color={c.blue} />
          <Text style={[styles.swapBtnText, { color: c.blue }]}>Swap</Text>
        </Pressable>
      </View>

      {/* City Pickers Row */}
      <View style={styles.pickersGrid}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pickerLabel, { color: c.muted }]}>
            MONITORING POINT 1
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
            <ChevronDown size={14} color={c.muted} />
          </Pressable>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.pickerLabel, { color: c.muted }]}>
            MONITORING POINT 2
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
            <ChevronDown size={14} color={c.muted} />
          </Pressable>
        </View>
      </View>

      {/* Dropdown Options Tray if open */}
      {activePicker && (
        <View
          style={[
            styles.dropdownTray,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <Text style={[styles.dropdownTrayTitle, { color: c.muted }]}>
            Select {activePicker === 'city1' ? 'First' : 'Second'} Station:
          </Text>
          <View style={styles.cityOptionsRow}>
            {COMPARISON_STATIONS.map(item => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (activePicker === 'city1') setCity1Id(item.id)
                  else setCity2Id(item.id)
                  setActivePicker(null)
                }}
                style={[
                  styles.cityOptionChip,
                  { backgroundColor: c.cardAlt, borderColor: c.border }
                ]}
              >
                <Text style={[styles.cityOptionText, { color: c.ink }]}>
                  {item.city}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Hero Overview Cards Side by Side */}
      <View style={styles.heroRow}>
        <View
          style={[
            styles.heroSideCard,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MapPin size={13} color={c.blue} />
            <Text style={[styles.heroCity, { color: c.ink }]}>{city1.city}</Text>
          </View>
          <WeatherIcon condition={cond1} size={36} style={{ marginVertical: 6 }} />
          <Text style={[styles.heroTemp, { color: c.ink }]}>
            {formatTemp(temp1)}
          </Text>
          <Text style={[styles.heroCondition, { color: c.muted }]}>
            {cond1}
          </Text>
        </View>

        <View
          style={[
            styles.heroSideCard,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MapPin size={13} color={c.blue} />
            <Text style={[styles.heroCity, { color: c.ink }]}>{city2.city}</Text>
          </View>
          <WeatherIcon condition={cond2} size={36} style={{ marginVertical: 6 }} />
          <Text style={[styles.heroTemp, { color: c.ink }]}>
            {formatTemp(temp2)}
          </Text>
          <Text style={[styles.heroCondition, { color: c.muted }]}>
            {cond2}
          </Text>
        </View>
      </View>

      {/* Detailed Side-by-Side Comparison Matrix */}
      <View
        style={[
          styles.matrixCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.matrixTitle, { color: c.ink }]}>
          Environmental Telemetry Matrix
        </Text>

        {COMPARISON_METRICS.map((row, idx) => {
          const IconComp = row.icon
          return (
            <View
              key={row.label}
              style={[
                styles.matrixRow,
                { borderBottomColor: c.borderLight },
                idx === COMPARISON_METRICS.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <Text style={[styles.matrixVal1, { color: c.ink }]}>
                {row.val1}
              </Text>
              <View style={styles.matrixLabelBox}>
                <IconComp size={13} color={c.muted} />
                <Text style={[styles.matrixLabel, { color: c.muted }]}>
                  {row.label}
                </Text>
              </View>
              <Text style={[styles.matrixVal2, { color: c.ink }]}>
                {row.val2}
              </Text>
            </View>
          )
        })}
      </View>

      {/* Comparative Visual Bars / Differential Graphs */}
      <View
        style={[
          styles.matrixCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.matrixTitle, { color: c.ink }]}>
          Visual Gradient Differential
        </Text>

        {/* Legend */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c.blue }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.ink }}>{city1.city}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10B981' }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.ink }}>{city2.city}</Text>
          </View>
        </View>

        {/* Metric 1: Temperature */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 11, color: c.muted, fontWeight: '600' }}>Temperature (°C)</Text>
            <Text style={{ fontSize: 11, color: c.ink, fontWeight: '700' }}>
              {temp1 > temp2 ? `${city1.city} is +${temp1 - temp2}°C warmer` : temp2 > temp1 ? `${city2.city} is +${temp2 - temp1}°C warmer` : 'Equal temperatures'}
            </Text>
          </View>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 9, width: 48, color: c.muted }} numberOfLines={1}>{city1.city}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: c.borderLight, borderRadius: 4 }}>
                <View style={{ width: `${Math.min(100, Math.round((temp1 / 45) * 100))}%`, height: 8, backgroundColor: c.blue, borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.ink, width: 34, textAlign: 'right' }}>{temp1}°C</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 9, width: 48, color: c.muted }} numberOfLines={1}>{city2.city}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: c.borderLight, borderRadius: 4 }}>
                <View style={{ width: `${Math.min(100, Math.round((temp2 / 45) * 100))}%`, height: 8, backgroundColor: '#10B981', borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.ink, width: 34, textAlign: 'right' }}>{temp2}°C</Text>
            </View>
          </View>
        </View>

        {/* Metric 2: Humidity */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 11, color: c.muted, fontWeight: '600' }}>Relative Humidity (%)</Text>
            <Text style={{ fontSize: 11, color: c.ink, fontWeight: '700' }}>
              {hum1 > hum2 ? `${city1.city} +${hum1 - hum2}% higher` : hum2 > hum1 ? `${city2.city} +${hum2 - hum1}% higher` : 'Equal humidity'}
            </Text>
          </View>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 9, width: 48, color: c.muted }} numberOfLines={1}>{city1.city}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: c.borderLight, borderRadius: 4 }}>
                <View style={{ width: `${Math.min(100, hum1)}%`, height: 8, backgroundColor: c.blue, borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.ink, width: 34, textAlign: 'right' }}>{hum1}%</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 9, width: 48, color: c.muted }} numberOfLines={1}>{city2.city}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: c.borderLight, borderRadius: 4 }}>
                <View style={{ width: `${Math.min(100, hum2)}%`, height: 8, backgroundColor: '#10B981', borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.ink, width: 34, textAlign: 'right' }}>{hum2}%</Text>
            </View>
          </View>
        </View>

        {/* Metric 3: Wind Speed */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 11, color: c.muted, fontWeight: '600' }}>Wind Velocity (km/h)</Text>
            <Text style={{ fontSize: 11, color: c.ink, fontWeight: '700' }}>
              {wind1 > wind2 ? `${city1.city} +${wind1 - wind2} km/h` : wind2 > wind1 ? `${city2.city} +${wind2 - wind1} km/h` : 'Equal wind'}
            </Text>
          </View>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 9, width: 48, color: c.muted }} numberOfLines={1}>{city1.city}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: c.borderLight, borderRadius: 4 }}>
                <View style={{ width: `${Math.min(100, Math.round((wind1 / 50) * 100))}%`, height: 8, backgroundColor: c.blue, borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.ink, width: 34, textAlign: 'right' }}>{wind1}k</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 9, width: 48, color: c.muted }} numberOfLines={1}>{city2.city}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: c.borderLight, borderRadius: 4 }}>
                <View style={{ width: `${Math.min(100, Math.round((wind2 / 50) * 100))}%`, height: 8, backgroundColor: '#10B981', borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.ink, width: 34, textAlign: 'right' }}>{wind2}k</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 36, gap: 12 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 2 },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  swapBtnText: { fontSize: 11, fontWeight: '700' },
  pickersGrid: { flexDirection: 'row', gap: 10 },
  pickerLabel: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1
  },
  pickerValue: { fontSize: 13, fontWeight: '700', flex: 1 },
  dropdownTray: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8
  },
  dropdownTrayTitle: { fontSize: 11, fontWeight: '700' },
  cityOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityOptionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  cityOptionText: { fontSize: 11, fontWeight: '600' },
  heroRow: { flexDirection: 'row', gap: 10 },
  heroSideCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center'
  },
  heroCity: { fontSize: 13, fontWeight: '700' },
  heroTemp: { fontSize: 24, fontWeight: '800' },
  heroCondition: { fontSize: 11 },
  matrixCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  matrixTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  matrixVal1: { flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'left' },
  matrixLabelBox: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  matrixLabel: { fontSize: 10, fontWeight: '700' },
  matrixVal2: { flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'right' }
})

export default CompareLocationsScreen
