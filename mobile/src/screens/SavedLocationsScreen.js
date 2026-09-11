import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ImageBackground,
  useWindowDimensions
} from 'react-native'
import {
  MapPin,
  Clock,
  Star,
  Plus,
  Grid,
  List,
  ChevronDown,
  Trash2,
  Wind,
  Thermometer,
  ChevronRight
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api } from '../services/api'
import { WeatherIcon } from '../components/WeatherIcon'

export function SavedLocationsScreen ({
  isDark = false,
  unit = 'C',
  onNavigate,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const { width } = useWindowDimensions()
  const isWide = width > 768

  const [locations, setLocations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [sortBy, setSortBy] = useState('Last Updated')

  const loadLocations = async () => {
    setIsLoading(true)
    try {
      await api.ensureAuth()
      const result = await api.locations()
      if (Array.isArray(result)) {
        setLocations(
          result.map(item => ({
            id: item._id || item.id,
            city: item.city || item.name || 'Location',
            region: item.state || item.region || 'Region',
            country: item.country || 'India',
            tempC: item.tempC ?? 28,
            feelsLikeC: item.feelsLikeC ?? 30,
            condition: item.condition || 'Clear',
            humidity: item.humidity ?? 60,
            windSpeedKmh: item.windSpeedKmh ?? 12,
            windDirection: item.windDirection || 'NW',
            updatedTime: item.updatedTime || 'Live Station'
          }))
        )
      }
    } catch {
      setLocations([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLocations()
  }, [backendReady])

  const formatTemperature = tempC => {
    if (tempC == null) return '--'
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°`
    }
    return `${tempC}°`
  }

  const handleDeleteLocation = async (id, cityName) => {
    setLocations(prev => prev.filter(l => l.id !== id))
    try {
      await api.deleteLocation(id)
    } catch {}
    if (onNotification) onNotification(`Removed ${cityName} from monitored locations`)
  }

  const warmest =
    locations.length > 0
      ? [...locations].sort((a, b) => (b.tempC ?? 0) - (a.tempC ?? 0))[0]
      : null

  const highestHumidity =
    locations.length > 0
      ? [...locations].sort((a, b) => (b.humidity ?? 0) - (a.humidity ?? 0))[0]
      : null

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Actions Bar */}
      <View
        style={[
          styles.topHeaderBar,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={styles.headerTitleRow}>
          <Text style={[styles.mainHeading, { color: c.ink }]}>
            Monitored Stations ({locations.length})
          </Text>
        </View>

        <View style={styles.topRightActions}>
          <Pressable
            onPress={() => {
              if (onNavigate) onNavigate('add-location')
            }}
            style={[styles.addLocBtn, { backgroundColor: c.blue }]}
          >
            <Plus size={13} color='#FFFFFF' />
            <Text style={styles.addLocText}>Add Station</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Grid: Left Locations List + Right Mini Overview */}
      <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
        {/* Left Column: Locations Cards */}
        <View style={[styles.col, isWide && styles.colLeft]}>
          <View style={styles.locationsList}>
            {locations.length === 0 ? (
              <View
                style={[
                  styles.emptyStationCard,
                  { backgroundColor: c.card, borderColor: c.border }
                ]}
              >
                <MapPin size={32} color={c.blue} />
                <Text style={[styles.emptyTitle, { color: c.ink }]}>
                  {isLoading ? 'Syncing stations...' : 'No Saved Stations Yet'}
                </Text>
                <Text style={[styles.emptyDesc, { color: c.muted }]}>
                  {isLoading
                    ? 'Connecting to meteorological grid...'
                    : 'Bookmark cities across India to track real-time telemetry, radar alerts, and 7-day NWP forecasts.'}
                </Text>
                {!isLoading && (
                  <Pressable
                    onPress={() => onNavigate && onNavigate('add-location')}
                    style={[styles.addFirstBtn, { backgroundColor: c.blue }]}
                  >
                    <Plus size={15} color='#FFFFFF' />
                    <Text style={styles.addFirstText}>Add Station</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              locations.map(loc => (
                <Pressable
                  key={loc.id}
                  onPress={() => onNavigate('weather-map')}
                  style={({ pressed }) => [
                    styles.locCard,
                    { backgroundColor: c.card, borderColor: c.border },
                    pressed && { opacity: 0.8 }
                  ]}
                >
                  <View style={styles.locCardTop}>
                    <View style={styles.locInfoLeft}>
                      <View style={styles.locPinRow}>
                        <MapPin size={15} color={c.blue} />
                        <Text style={[styles.locCityName, { color: c.ink }]}>
                          {loc.city}, {loc.region}
                        </Text>
                      </View>
                      <View style={styles.timeRow}>
                        <Clock size={11} color={c.muted} />
                        <Text style={[styles.locUpdated, { color: c.muted }]}>
                          {loc.updatedTime}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.locTempCol}>
                      <WeatherIcon condition={loc.condition} size={30} />
                      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                        <Text style={[styles.bigTemp, { color: c.ink }]}>
                          {formatTemperature(loc.tempC)}
                        </Text>
                        <Text style={[styles.conditionLabel, { color: c.muted }]}>
                          {loc.condition}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Metrics row */}
                  <View style={[styles.locMetricsRow, { borderTopColor: c.borderLight }]}>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: c.muted }]}>Feels like</Text>
                      <Text style={[styles.metricVal, { color: c.ink }]}>
                        {formatTemperature(loc.feelsLikeC)}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: c.muted }]}>Humidity</Text>
                      <Text style={[styles.metricVal, { color: c.ink }]}>
                        {loc.humidity}%
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: c.muted }]}>Wind</Text>
                      <Text style={[styles.metricVal, { color: c.ink }]}>
                        {loc.windSpeedKmh} km/h
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteLocation(loc.id, loc.city)}
                      style={styles.deleteBtn}
                      accessibilityLabel='Delete Station'
                    >
                      <Trash2 size={16} color={c.accentRed} />
                    </Pressable>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Add New Location Bottom Action Box */}
          <Pressable
            onPress={() => {
              if (onNavigate) onNavigate('add-location')
            }}
            style={[
              styles.addNewLocationCard,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <Plus size={18} color={c.blue} />
            <Text style={[styles.addNewLocationTitle, { color: c.blue }]}>
              Bookmark New Station
            </Text>
          </Pressable>
        </View>

        {/* Right Column: Weather Summary */}
        <View style={[styles.col, isWide && styles.colRight]}>
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>
                Overview Across Stations
              </Text>
            </View>

            <View style={styles.summaryItemsList}>
              <View
                style={[
                  styles.summaryRowItem,
                  { borderBottomColor: c.borderLight }
                ]}
              >
                <View>
                  <Text style={[styles.summaryLabel, { color: c.muted }]}>
                    Warmest Monitored Point
                  </Text>
                  <Text style={[styles.summaryValueName, { color: c.ink }]}>
                    {warmest ? `${warmest.city}, ${warmest.region}` : 'No stations added'}
                  </Text>
                </View>
                <Text style={[styles.summaryBigVal, { color: '#F59E0B' }]}>
                  {warmest ? formatTemperature(warmest.tempC) : '--'}
                </Text>
              </View>

              <View
                style={[
                  styles.summaryRowItem,
                  { borderBottomColor: c.borderLight }
                ]}
              >
                <View>
                  <Text style={[styles.summaryLabel, { color: c.muted }]}>
                    Highest Atmospheric Moisture
                  </Text>
                  <Text style={[styles.summaryValueName, { color: c.ink }]}>
                    {highestHumidity
                      ? `${highestHumidity.city}, ${highestHumidity.region}`
                      : 'No stations added'}
                  </Text>
                </View>
                <Text style={[styles.summaryBigVal, { color: '#3B82F6' }]}>
                  {highestHumidity ? `${highestHumidity.humidity}%` : '--'}
                </Text>
              </View>
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
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  headerTitleRow: {},
  mainHeading: { fontSize: 14, fontWeight: '700' },
  topRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  addLocText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  mainGrid: { gap: 12 },
  mainGridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { gap: 12 },
  colLeft: { flex: 6 },
  colRight: { flex: 4 },
  locationsList: { gap: 10 },
  locCard: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 10 },
  locCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  locInfoLeft: { gap: 3 },
  locPinRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locCityName: { fontSize: 14, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locUpdated: { fontSize: 10 },
  locTempCol: { flexDirection: 'row', alignItems: 'center' },
  bigTemp: { fontSize: 20, fontWeight: '800' },
  conditionLabel: { fontSize: 11 },
  locMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1
  },
  metricItem: { gap: 1 },
  metricLabel: { fontSize: 9 },
  metricVal: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  addNewLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    borderStyle: 'dashed'
  },
  addNewLocationTitle: { fontSize: 13, fontWeight: '700' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  cardHeaderRow: { marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700' },
  summaryItemsList: { gap: 4 },
  summaryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  summaryLabel: { fontSize: 10 },
  summaryValueName: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  summaryBigVal: { fontSize: 14, fontWeight: '800' },
  emptyStationCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6
  },
  emptyDesc: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280
  },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 6
  },
  addFirstText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
})

export default SavedLocationsScreen
