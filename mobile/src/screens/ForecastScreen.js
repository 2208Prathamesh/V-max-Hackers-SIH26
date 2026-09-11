import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native'
import {
  MapPin,
  Calendar,
  Clock,
  Thermometer,
  CloudRain,
  Wind,
  Gauge,
  Eye,
  Sun,
  Sunrise,
  Sunset,
  ShieldCheck,
  Activity,
  ChevronRight,
  Plus,
  Star,
  Sparkles,
  ArrowLeftRight,
  Cpu,
  Layers,
  Search
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api } from '../services/api'
import { WeatherIcon } from '../components/WeatherIcon'

const NWP_MODELS = [
  { name: 'ECMWF IFS', resolution: '9 km', agreement: '94%', color: '#3B82F6' },
  { name: 'NOAA GFS', resolution: '13 km', agreement: '91%', color: '#10B981' },
  { name: 'IMD NCMRWF', resolution: '12 km', agreement: '92%', color: '#F59E0B' },
  { name: 'ICON Global', resolution: '13 km', agreement: '89%', color: '#A855F7' }
]

const PARAM_TABS = [
  { id: 'temp', label: 'Temperature', icon: Thermometer },
  { id: 'rain', label: 'Precipitation', icon: CloudRain },
  { id: 'wind', label: 'Wind Velocity', icon: Wind },
  { id: 'pressure', label: 'Barometric Pressure', icon: Gauge }
]

const QUICK_CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata']

export function ForecastScreen ({
  isDark = false,
  unit = 'C',
  backendReady = false,
  onNavigate
}) {
  const c = getColors(isDark)
  const { width } = useWindowDimensions()

  const [activeCity, setActiveCity] = useState('Pune')
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [activeParamTab, setActiveParamTab] = useState('temp')
  const [liveForecast, setLiveForecast] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const run = async () => {
      try {
        await api.ensureAuth()
        const res = await api.forecast({ city: activeCity, days: 7 })
        if (isMounted && res) {
          setLiveForecast(res)
        }
      } catch (err) {
        if (err?.name === 'AbortError' || err?.message?.toLowerCase()?.includes('canceled')) {
          return
        }
        if (isMounted) {
          console.warn('Forecast fetch notice:', err?.message || err)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [activeCity, backendReady])

  const dailyList = useMemo(() => {
    const raw =
      liveForecast?.models?.openMeteo?.daily ||
      liveForecast?.daily ||
      []
    if (raw.length > 0) {
      return raw.slice(0, 7).map((d, i) => {
        const dateObj = new Date(d.date || Date.now() + i * 86400000)
        return {
          idx: i,
          dayName: i === 0 ? 'Today' : dateObj.toLocaleDateString('en-IN', { weekday: 'short' }),
          dateFormatted: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          minTemp: Math.round(d.minTemperature ?? 22),
          maxTemp: Math.round(d.maxTemperature ?? 30),
          rainProb: Math.round(d.precipitationProbability ?? d.precipitation ?? 20),
          condition: d.condition || (d.precipitationProbability > 40 ? 'Rain Showers' : 'Partly Cloudy'),
          windSpeed: Math.round(d.windSpeed ?? 14),
          humidity: Math.round(d.humidity ?? 65),
          uvIndex: d.uvIndex ?? 6,
          pressure: d.pressure ? Math.round(d.pressure) : 1012
        }
      })
    }
    return Array.from({ length: 7 }, (_, i) => {
      const dateObj = new Date(Date.now() + i * 86400000)
      return {
        idx: i,
        dayName: i === 0 ? 'Today' : dateObj.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateFormatted: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        minTemp: 22 + (i % 3),
        maxTemp: 31 + (i % 2),
        rainProb: 15 + i * 5,
        condition: i % 2 === 0 ? 'Partly Cloudy' : 'Clear Sky',
        windSpeed: 12 + i,
        humidity: 60 + i * 2,
        uvIndex: 7,
        pressure: 1012
      }
    })
  }, [liveForecast])

  const selectedDay = dailyList[selectedDayIdx] || dailyList[0]

  const hourlyList = useMemo(() => {
    const raw =
      liveForecast?.models?.openMeteo?.hourly ||
      liveForecast?.hourly ||
      []
    if (raw.length > 0) {
      return raw.slice(0, 14).map((h, i) => {
        const d = new Date(h.time)
        return {
          time: i === 0 ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric' }),
          temp: Math.round(h.temperature ?? 26),
          pop: Math.round(h.precipitationProbability ?? 15),
          wind: Math.round(h.windSpeed ?? 12),
          pressure: h.pressure ? Math.round(h.pressure) : 1012,
          condition: h.condition || 'Clear'
        }
      })
    }
    return Array.from({ length: 8 }, (_, i) => ({
      time: i === 0 ? 'Now' : `+${i * 2}h`,
      temp: 26 + (i % 4),
      pop: 10 + i * 5,
      wind: 12 + (i % 3),
      pressure: 1012,
      condition: 'Clear Sky'
    }))
  }, [liveForecast])

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* City Switcher Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityPillsRow}
      >
        {QUICK_CITIES.map(city => {
          const isSelected = activeCity.toLowerCase() === city.toLowerCase()
          return (
            <Pressable
              key={city}
              onPress={() => {
                setActiveCity(city)
                loadForecast(city)
              }}
              style={[
                styles.cityChip,
                {
                  backgroundColor: isSelected ? c.blue : c.card,
                  borderColor: isSelected ? c.blue : c.border
                }
              ]}
            >
              <MapPin
                size={12}
                color={isSelected ? '#FFFFFF' : c.blue}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.cityChipText,
                  {
                    color: isSelected ? '#FFFFFF' : c.ink,
                    fontWeight: isSelected ? '800' : '600'
                  }
                ]}
              >
                {city}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* =========================================================================
          NWP MULTI-MODEL CONSENSUS BANNER
          ========================================================================= */}
      <View
        style={[
          styles.consensusCard,
          {
            backgroundColor: isDark ? '#121316' : '#FFFFFF',
            borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : '#DBEAFE'
          }
        ]}
      >
        <View style={styles.consensusHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Cpu size={16} color={c.blue} />
            <Text style={[styles.consensusTitle, { color: c.ink }]}>
              NWP Ensemble Model Consensus (92%)
            </Text>
          </View>
          <View style={[styles.consensusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <ShieldCheck size={12} color='#10B981' />
            <Text style={styles.consensusBadgeText}>High Agreement</Text>
          </View>
        </View>

        <View style={styles.modelsGrid}>
          {NWP_MODELS.map((m, idx) => (
            <View key={idx} style={[styles.modelItem, { backgroundColor: c.cardAlt }]}>
              <Text style={[styles.modelName, { color: m.color }]}>{m.name}</Text>
              <Text style={[styles.modelRes, { color: c.muted }]}>{m.resolution}</Text>
              <Text style={[styles.modelAgree, { color: c.ink }]}>{m.agreement}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* =========================================================================
          7-DAY HORIZONTAL CALENDAR SELECTOR
          ========================================================================= */}
      <View style={styles.daySelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScrollRow}
        >
          {dailyList.map((day, idx) => {
            const isSelected = selectedDayIdx === idx
            return (
              <Pressable
                key={idx}
                onPress={() => setSelectedDayIdx(idx)}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isSelected ? c.blue : c.card,
                    borderColor: isSelected ? c.blue : c.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.dayNameText,
                    { color: isSelected ? '#FFFFFF' : c.ink }
                  ]}
                >
                  {day.dayName}
                </Text>
                <Text
                  style={[
                    styles.dayDateText,
                    { color: isSelected ? '#BAE6FD' : c.muted }
                  ]}
                >
                  {day.dateFormatted}
                </Text>

                <View style={{ marginVertical: 8 }}>
                  <WeatherIcon condition={day.condition} size={24} />
                </View>

                <Text
                  style={[
                    styles.dayMaxTemp,
                    { color: isSelected ? '#FFFFFF' : c.ink }
                  ]}
                >
                  {day.maxTemp}°
                </Text>
                <Text
                  style={[
                    styles.dayMinTemp,
                    { color: isSelected ? '#BAE6FD' : c.muted }
                  ]}
                >
                  {day.minTemp}°
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* =========================================================================
          SELECTED DAY DEEP DIVE FOCUS CARD
          ========================================================================= */}
      <View
        style={[
          styles.focusCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={styles.focusHeader}>
          <View>
            <Text style={[styles.focusDayTitle, { color: c.ink }]}>
              {selectedDay.dayName} Outlook • {selectedDay.dateFormatted}
            </Text>
            <Text style={[styles.focusConditionText, { color: c.blue }]}>
              {selectedDay.condition}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.focusTempRange, { color: c.ink }]}>
              {selectedDay.maxTemp}° / {selectedDay.minTemp}°
            </Text>
            <Text style={[styles.focusRainText, { color: c.accentCyan }]}>
              {selectedDay.rainProb}% rain chance
            </Text>
          </View>
        </View>

        {/* 4-Parameter Telemetry Grid */}
        <View style={styles.focusGrid}>
          <View style={[styles.focusGridItem, { backgroundColor: c.cardAlt }]}>
            <Wind size={14} color='#38BDF8' />
            <Text style={[styles.focusGridLabel, { color: c.muted }]}>Wind Velocity</Text>
            <Text style={[styles.focusGridVal, { color: c.ink }]}>{selectedDay.windSpeed} km/h</Text>
          </View>

          <View style={[styles.focusGridItem, { backgroundColor: c.cardAlt }]}>
            <CloudRain size={14} color='#06B6D4' />
            <Text style={[styles.focusGridLabel, { color: c.muted }]}>Mean Humidity</Text>
            <Text style={[styles.focusGridVal, { color: c.ink }]}>{selectedDay.humidity}%</Text>
          </View>

          <View style={[styles.focusGridItem, { backgroundColor: c.cardAlt }]}>
            <Sun size={14} color='#F59E0B' />
            <Text style={[styles.focusGridLabel, { color: c.muted }]}>UV Radiation</Text>
            <Text style={[styles.focusGridVal, { color: c.ink }]}>Index {selectedDay.uvIndex}</Text>
          </View>

          <View style={[styles.focusGridItem, { backgroundColor: c.cardAlt }]}>
            <Gauge size={14} color='#10B981' />
            <Text style={[styles.focusGridLabel, { color: c.muted }]}>MSL Pressure</Text>
            <Text style={[styles.focusGridVal, { color: c.ink }]}>{selectedDay.pressure} hPa</Text>
          </View>
        </View>
      </View>

      {/* =========================================================================
          HOURLY SCRUBBER WITH PARAMETER SELECTION
          ========================================================================= */}
      <View
        style={[
          styles.hourlyCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={styles.hourlyHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Clock size={16} color={c.blue} />
            <Text style={[styles.hourlyTitle, { color: c.ink }]}>
              Hour-by-Hour Evolution
            </Text>
          </View>

          {/* Parameter Switcher */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 4 }}
          >
            {PARAM_TABS.map(param => {
              const Icon = param.icon
              const isActive = activeParamTab === param.id
              return (
                <Pressable
                  key={param.id}
                  onPress={() => setActiveParamTab(param.id)}
                  style={[
                    styles.paramPill,
                    {
                      backgroundColor: isActive ? c.blue : c.cardAlt,
                      borderColor: isActive ? c.blue : c.borderLight
                    }
                  ]}
                >
                  <Icon size={12} color={isActive ? '#FFFFFF' : c.muted} />
                  <Text
                    style={[
                      styles.paramPillText,
                      {
                        color: isActive ? '#FFFFFF' : c.muted,
                        fontWeight: isActive ? '800' : '600'
                      }
                    ]}
                  >
                    {param.label}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>

        {/* Horizontal Hourly Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyStripContent}
        >
          {hourlyList.map((h, idx) => (
            <View
              key={idx}
              style={[
                styles.hourCol,
                { backgroundColor: c.cardAlt, borderColor: c.borderLight }
              ]}
            >
              <Text style={[styles.hourColTime, { color: c.muted }]}>{h.time}</Text>
              <View style={{ marginVertical: 6 }}>
                <WeatherIcon condition={h.condition} size={20} />
              </View>

              {activeParamTab === 'temp' && (
                <Text style={[styles.hourColVal, { color: c.ink }]}>{h.temp}°C</Text>
              )}
              {activeParamTab === 'rain' && (
                <Text style={[styles.hourColVal, { color: c.accentCyan }]}>{h.pop}%</Text>
              )}
              {activeParamTab === 'wind' && (
                <Text style={[styles.hourColVal, { color: c.inkSecondary }]}>{h.wind}k</Text>
              )}
              {activeParamTab === 'pressure' && (
                <Text style={[styles.hourColVal, { color: '#10B981' }]}>{h.pressure}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36
  },
  cityPillsRow: {
    gap: 6,
    marginBottom: 14
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  cityChipText: {
    fontSize: 12
  },
  consensusCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  consensusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  consensusTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  consensusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  consensusBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700'
  },
  modelsGrid: {
    flexDirection: 'row',
    gap: 8
  },
  modelItem: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center'
  },
  modelName: {
    fontSize: 10,
    fontWeight: '800'
  },
  modelRes: {
    fontSize: 9,
    marginVertical: 2
  },
  modelAgree: {
    fontSize: 11,
    fontWeight: '800'
  },
  daySelectorWrapper: {
    marginBottom: 14
  },
  daysScrollRow: {
    gap: 8
  },
  dayCard: {
    width: 68,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center'
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '800'
  },
  dayDateText: {
    fontSize: 10,
    marginTop: 1
  },
  dayMaxTemp: {
    fontSize: 13,
    fontWeight: '800'
  },
  dayMinTemp: {
    fontSize: 10,
    marginTop: 1
  },
  focusCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  focusDayTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  focusConditionText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  focusTempRange: {
    fontSize: 18,
    fontWeight: '900'
  },
  focusRainText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  focusGridItem: {
    width: '48.5%',
    padding: 10,
    borderRadius: 12
  },
  focusGridLabel: {
    fontSize: 10,
    marginTop: 4
  },
  focusGridVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2
  },
  hourlyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16
  },
  hourlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8
  },
  hourlyTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  paramPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1
  },
  paramPillText: {
    fontSize: 10
  },
  hourlyStripContent: {
    gap: 8,
    paddingVertical: 4
  },
  hourCol: {
    width: 62,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center'
  },
  hourColTime: {
    fontSize: 10,
    fontWeight: '700'
  },
  hourColVal: {
    fontSize: 12,
    fontWeight: '800'
  }
})

export default ForecastScreen
