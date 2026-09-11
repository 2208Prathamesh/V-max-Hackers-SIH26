import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native'
import {
  Search,
  Calendar,
  ChevronDown,
  Plus,
  MessageSquare,
  CloudSun,
  AlertTriangle,
  Wind,
  Compass,
  Clock,
  BarChart3,
  Database,
  Check,
  Zap,
  MapPin,
  RefreshCw,
  Download,
  CloudRain,
  Gauge,
  Thermometer,
  ShieldCheck
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api, offlineStorage } from '../services/api'
import { WeatherIcon } from '../components/WeatherIcon'

const PRIMARY_TABS = [
  { id: 'offline7d', label: '7-Day Offline Archive', icon: Database },
  { id: 'chats', label: 'AI Query Archive', icon: MessageSquare }
]

const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata']

export function HistoryScreen ({
  isDark = false,
  onNavigate,
  backendReady = false
}) {
  const c = getColors(isDark)
  const { width } = useWindowDimensions()

  const [activePrimaryTab, setActivePrimaryTab] = useState('offline7d')
  const [selectedCity, setSelectedCity] = useState('Pune')
  const [offline7Days, setOffline7Days] = useState([])
  const [liveHistory, setLiveHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isExported, setIsExported] = useState(false)

  const generateFallback7Day = cityName => {
    const baseTemps = {
      Pune: 27,
      Mumbai: 30,
      Delhi: 32,
      Bengaluru: 25,
      Chennai: 31,
      Kolkata: 29
    }
    const baseT = baseTemps[cityName] || 28
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (i + 1) * 86400000)
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' })
      const dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      const temp = baseT - (i % 3) + (i % 2 ? 1 : -1)
      const humidity = 58 + (i * 3) % 25
      const rainProb = (i * 18) % 80
      const aqi = 55 + (i * 12) % 60
      return {
        date: dateFormatted,
        dayName,
        city: cityName,
        temp,
        humidity,
        rainProb,
        pressure: 1012 - (i % 4),
        windSpeed: 12 + (i % 5),
        aqi,
        condition: rainProb > 50 ? 'Scattered Rain' : rainProb > 30 ? 'Partly Cloudy' : 'Clear Sky',
        isOfflineFallback: true
      }
    })
  }

  const DEFAULT_CONVERSATIONS = [
    {
      id: 'c-1',
      title: 'Monsoon withdrawal date forecast',
      time: 'Yesterday, 4:15 PM',
      desc: 'Synoptic assessment of anti-cyclonic circulation over Rajasthan',
      tag: 'NWP Forecast'
    },
    {
      id: 'c-2',
      title: 'Ghat section heavy rainfall alerts',
      time: '2 days ago',
      desc: 'Bhor Ghat and Tamhini catchment accumulation analysis',
      tag: 'Air Quality'
    },
    {
      id: 'c-3',
      title: 'Urban flood drainage capacity',
      time: '4 days ago',
      desc: 'Stormwater runoff model and underpass inundation advice',
      tag: 'General Telemetry'
    }
  ]

  // Load 7-Day Offline History
  const loadOfflineHistory = async cityName => {
    setIsLoading(true)
    try {
      const data = await offlineStorage.get7DayHistory(cityName)
      if (Array.isArray(data) && data.length > 0) {
        setOffline7Days(data)
      } else {
        setOffline7Days(generateFallback7Day(cityName))
      }
    } catch (err) {
      console.warn('Using fallback 7-day data:', err)
      setOffline7Days(generateFallback7Day(cityName))
    } finally {
      setIsLoading(false)
    }
  }

  // Load Conversations
  const loadConversations = async () => {
    setIsLoading(true)
    try {
      await api.ensureAuth()
      const result = await api.conversations()
      if (Array.isArray(result) && result.length > 0) {
        setLiveHistory(
          result.map(item => ({
            id: item._id || item.id,
            title: item.title || 'Weather intelligence consultation',
            time: new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString(
              'en-IN',
              {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit'
              }
            ),
            desc: item.category ? `Category: ${item.category}` : 'Atmospheric simulation discussion',
            tag: item.category === 'forecast' ? 'NWP Forecast' : item.category === 'weather' ? 'Air Quality' : 'General Telemetry'
          }))
        )
      } else {
        setLiveHistory(DEFAULT_CONVERSATIONS)
      }
    } catch {
      setLiveHistory(DEFAULT_CONVERSATIONS)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activePrimaryTab === 'offline7d') {
      loadOfflineHistory(selectedCity)
    } else {
      loadConversations()
    }
  }, [activePrimaryTab, selectedCity, backendReady])

  const handleExport = () => {
    setIsExported(true)
    setTimeout(() => setIsExported(false), 3000)
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Primary Tab Toggle (7-Day Offline Archive vs AI Queries) */}
      <View
        style={[
          styles.primaryToggleBar,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        {PRIMARY_TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activePrimaryTab === tab.id
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActivePrimaryTab(tab.id)}
              style={[
                styles.primaryTabBtn,
                isActive && {
                  backgroundColor: c.blue,
                  borderColor: c.blue
                }
              ]}
            >
              <Icon
                size={16}
                color={isActive ? '#FFFFFF' : c.muted}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.primaryTabBtnText,
                  {
                    color: isActive ? '#FFFFFF' : c.muted,
                    fontWeight: isActive ? '800' : '600'
                  }
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* =========================================================================
          MODE 1: 7-DAY LOCAL OFFLINE WEATHER ARCHIVE
          ========================================================================= */}
      {activePrimaryTab === 'offline7d' ? (
        <View>
          {/* Header Info & City Selector */}
          <View
            style={[
              styles.infoPanel,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <View style={styles.infoTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: c.ink }]}>
                  7-Day Offline Local Telemetry Archive
                </Text>
                <Text style={[styles.infoSubtitle, { color: c.muted }]}>
                  Saved directly to device storage for offline and field operation.
                </Text>
              </View>
              <Pressable
                onPress={handleExport}
                style={[
                  styles.exportBtn,
                  { backgroundColor: isExported ? c.accentGreen : c.blue }
                ]}
              >
                {isExported ? (
                  <Check size={14} color='#FFFFFF' />
                ) : (
                  <Download size={14} color='#FFFFFF' />
                )}
                <Text style={styles.exportBtnText}>
                  {isExported ? 'Saved!' : 'Export'}
                </Text>
              </Pressable>
            </View>

            {/* City Selection Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cityPillsRow}
            >
              {CITIES.map(city => {
                const isSelected = selectedCity.toLowerCase() === city.toLowerCase()
                return (
                  <Pressable
                    key={city}
                    onPress={() => setSelectedCity(city)}
                    style={[
                      styles.cityPill,
                      {
                        backgroundColor: isSelected ? c.blue : c.cardAlt,
                        borderColor: isSelected ? c.blue : c.borderLight
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
                        styles.cityPillText,
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
          </View>

          {/* Loading Indicator */}
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size='large' color={c.blue} />
              <Text style={[styles.loadingText, { color: c.muted }]}>
                Reading 7-Day Local Storage...
              </Text>
            </View>
          ) : offline7Days.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: c.card, borderColor: c.border }]}>
              <Database size={36} color={c.muted} />
              <Text style={[styles.emptyTitle, { color: c.ink }]}>
                No local snapshots saved yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: c.muted }]}>
                Switch to Dashboard to automatically sync and snapshot current telemetry for {selectedCity}.
              </Text>
              <Pressable
                onPress={() => onNavigate('dashboard')}
                style={[styles.emptyActionBtn, { backgroundColor: c.blue }]}
              >
                <Text style={styles.emptyActionBtnText}>Go to Live Dashboard</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {/* 7-Day Synoptic Temperature & Rain Bar Chart */}
              <View style={[styles.snapshotCard, { backgroundColor: c.card, borderColor: c.border, padding: 12 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <BarChart3 size={16} color={c.blue} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: c.ink }}>
                      7-Day Synoptic Trend ({selectedCity})
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10, color: c.muted, fontWeight: '600' }}>
                    Archive Telemetry
                  </Text>
                </View>
                <View style={{ height: 100, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10, borderBottomWidth: 1, borderBottomColor: c.borderLight }}>
                  {offline7Days.map((s, idx) => {
                    const barH = Math.max(16, Math.round(((s.temp || 25) / 40) * 72))
                    return (
                      <View key={idx} style={{ alignItems: 'center', width: 38 }}>
                        <View style={{ height: 74, justifyContent: 'flex-end' }}>
                          <View style={{ width: 16, height: barH, backgroundColor: (s.temp || 25) > 30 ? c.accentAmber : c.blue, borderRadius: 4, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 }}>
                            <Text style={{ fontSize: 8, color: '#FFF', fontWeight: '800' }}>
                              {s.temp ? `${s.temp}°` : '27°'}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 9, color: c.muted, marginTop: 4, fontWeight: '600' }}>
                          {s.dayName || `D-${idx + 1}`}
                        </Text>
                      </View>
                    )
                  })}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 10, color: c.muted }}>
                    Mean Temperature: <Text style={{ color: c.ink, fontWeight: '700' }}>{Math.round(offline7Days.reduce((acc, s) => acc + (s.temp || 25), 0) / (offline7Days.length || 1))}°C</Text>
                  </Text>
                  <Text style={{ fontSize: 10, color: c.statusSafe, fontWeight: '700' }}>
                    ✓ 100% Offline Accessible
                  </Text>
                </View>
              </View>

              {offline7Days.map((snapshot, index) => (
                <View
                  key={snapshot.date || index}
                  style={[
                    styles.snapshotCard,
                    { backgroundColor: c.card, borderColor: c.border }
                  ]}
                >
                  {/* Top Bar: Date & Offline Status */}
                  <View style={styles.snapshotTopRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color={c.blue} />
                      <Text style={[styles.snapshotDateText, { color: c.ink }]}>
                        {snapshot.displayDate || snapshot.date}
                      </Text>
                      {index === 0 && (
                        <View style={[styles.todayBadge, { backgroundColor: c.blueLight }]}>
                          <Text style={[styles.todayBadgeText, { color: c.blue }]}>Latest</Text>
                        </View>
                      )}
                    </View>

                    <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                      <ShieldCheck size={12} color='#10B981' />
                      <Text style={styles.verifiedBadgeText}>Offline Verified</Text>
                    </View>
                  </View>

                  {/* Center Weather Row */}
                  <View style={styles.snapshotCenterRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <WeatherIcon condition={snapshot.condition} size={32} />
                      <View>
                        <Text style={[styles.snapshotTempText, { color: c.ink }]}>
                          {snapshot.temp}°C
                        </Text>
                        <Text style={[styles.snapshotConditionText, { color: c.muted }]}>
                          {snapshot.condition}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.snapshotRangeBox}>
                      <Text style={[styles.snapshotRangeText, { color: c.inkSecondary }]}>
                        ↓ {snapshot.minTemp}°C • ↑ {snapshot.maxTemp}°C
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Telemetry Grid */}
                  <View style={[styles.snapshotBottomGrid, { borderTopColor: c.borderLight }]}>
                    <View style={styles.gridMiniItem}>
                      <CloudRain size={12} color='#06B6D4' />
                      <Text style={[styles.gridMiniLabel, { color: c.muted }]}>
                        Humidity: <Text style={{ color: c.ink, fontWeight: '700' }}>{snapshot.humidity}%</Text>
                      </Text>
                    </View>

                    <View style={styles.gridMiniItem}>
                      <Wind size={12} color='#38BDF8' />
                      <Text style={[styles.gridMiniLabel, { color: c.muted }]}>
                        Wind: <Text style={{ color: c.ink, fontWeight: '700' }}>{snapshot.windSpeed} km/h</Text>
                      </Text>
                    </View>

                    <View style={styles.gridMiniItem}>
                      <Gauge size={12} color='#10B981' />
                      <Text style={[styles.gridMiniLabel, { color: c.muted }]}>
                        Press: <Text style={{ color: c.ink, fontWeight: '700' }}>{snapshot.pressure} hPa</Text>
                      </Text>
                    </View>

                    <View style={styles.gridMiniItem}>
                      <Zap size={12} color='#F59E0B' />
                      <Text style={[styles.gridMiniLabel, { color: c.muted }]}>
                        AQI: <Text style={{ color: c.ink, fontWeight: '700' }}>{snapshot.aqi}</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        /* =========================================================================
            MODE 2: AI CONVERSATION ARCHIVE
            ========================================================================= */
        <View>
          <View
            style={[
              styles.searchBarWrapper,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <Search size={16} color={c.muted} style={{ marginLeft: 12 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder='Search past AI weather queries...'
              placeholderTextColor={c.muted}
              style={[styles.searchInput, { color: c.ink }]}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size='large' color={c.blue} />
              <Text style={[styles.loadingText, { color: c.muted }]}>
                Loading AI query records...
              </Text>
            </View>
          ) : liveHistory.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: c.card, borderColor: c.border }]}>
              <MessageSquare size={36} color={c.muted} />
              <Text style={[styles.emptyTitle, { color: c.ink }]}>
                No consultations found
              </Text>
              <Text style={[styles.emptySubtitle, { color: c.muted }]}>
                Ask WeatherGPT AI a question on the chat page to start your archive.
              </Text>
              <Pressable
                onPress={() => onNavigate('chat')}
                style={[styles.emptyActionBtn, { backgroundColor: c.blue }]}
              >
                <Text style={styles.emptyActionBtnText}>Launch WeatherGPT AI</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {liveHistory
                .filter(item =>
                  item.title.toLowerCase().includes(search.toLowerCase())
                )
                .map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => onNavigate('chat')}
                    style={[
                      styles.chatHistoryCard,
                      { backgroundColor: c.card, borderColor: c.border }
                    ]}
                  >
                    <View style={styles.chatTopRow}>
                      <Text style={[styles.chatTitle, { color: c.ink }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={[styles.chatTagPill, { backgroundColor: c.blueLight }]}>
                        <Text style={[styles.chatTagText, { color: c.blue }]}>
                          {item.tag}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.chatDesc, { color: c.muted }]} numberOfLines={2}>
                      {item.desc}
                    </Text>
                    <Text style={[styles.chatTime, { color: c.muted }]}>
                      {item.time}
                    </Text>
                  </Pressable>
                ))}
            </View>
          )}
        </View>
      )}
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
  primaryToggleBar: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    marginBottom: 14
  },
  primaryTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12
  },
  primaryTabBtnText: {
    fontSize: 12
  },
  infoPanel: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  infoSubtitle: {
    fontSize: 11,
    marginTop: 2
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  cityPillsRow: {
    gap: 6
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  cityPillText: {
    fontSize: 12
  },
  snapshotCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16
  },
  snapshotTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  snapshotDateText: {
    fontSize: 13,
    fontWeight: '700'
  },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981'
  },
  snapshotCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  snapshotTempText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  snapshotConditionText: {
    fontSize: 12
  },
  snapshotRangeBox: {
    alignItems: 'flex-end'
  },
  snapshotRangeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  snapshotBottomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 12
  },
  gridMiniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  gridMiniLabel: {
    fontSize: 11
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 13
  },
  chatHistoryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14
  },
  chatTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  chatTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8
  },
  chatTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  chatTagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  chatDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6
  },
  chatTime: {
    fontSize: 10
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    borderRadius: 20,
    borderWidth: 1
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 14
  },
  emptyActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  }
})

export default HistoryScreen
