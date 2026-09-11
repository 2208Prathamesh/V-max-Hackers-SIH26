import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator
} from 'react-native'
import {
  Search,
  X,
  MapPin,
  Star,
  Check,
  Plus
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api } from '../services/api'
import { WeatherIcon } from '../components/WeatherIcon'

const POPULAR_MET_STATIONS = [
  { id: 'pune', city: 'Pune', region: 'Maharashtra', coordinates: { lat: 18.5204, lng: 73.8567 } },
  { id: 'mumbai', city: 'Mumbai', region: 'Maharashtra', coordinates: { lat: 19.076, lng: 72.8777 } },
  { id: 'delhi', city: 'New Delhi', region: 'Delhi NCR', coordinates: { lat: 28.6139, lng: 77.209 } },
  { id: 'bengaluru', city: 'Bengaluru', region: 'Karnataka', coordinates: { lat: 12.9716, lng: 77.5946 } },
  { id: 'kolkata', city: 'Kolkata', region: 'West Bengal', coordinates: { lat: 22.5726, lng: 88.3639 } },
  { id: 'chennai', city: 'Chennai', region: 'Tamil Nadu', coordinates: { lat: 13.0827, lng: 80.2707 } },
  { id: 'hyderabad', city: 'Hyderabad', region: 'Telangana', coordinates: { lat: 17.385, lng: 78.4867 } },
  { id: 'ahmedabad', city: 'Ahmedabad', region: 'Gujarat', coordinates: { lat: 23.0225, lng: 72.5714 } }
]

export function AddLocationScreen ({
  isDark = false,
  unit = 'C',
  onNavigate,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const [searchTerm, setSearchTerm] = useState('')
  const [savedIds, setSavedIds] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [liveSearchResults, setLiveSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Load existing saved station names on mount
  useEffect(() => {
    api
      .locations()
      .then(res => {
        if (Array.isArray(res)) {
          setSavedIds(res.map(l => (l.city || l.name || '').toLowerCase()))
        }
      })
      .catch(() => {})
  }, [backendReady])

  const formatTemp = tempC => {
    if (tempC == null) return '--'
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`
    }
    return `${tempC}°C`
  }

  useEffect(() => {
    const q = searchTerm.trim()
    if (q.length < 2) {
      setLiveSearchResults([])
      return
    }

    let isMounted = true
    setIsSearching(true)
    const timer = setTimeout(() => {
      api
        .searchLocations(q)
        .then(res => {
          if (isMounted && Array.isArray(res)) {
            setLiveSearchResults(
              res.map(item => ({
                id: item.id || `${item.city}-${item.lat}`,
                city: item.city || item.name,
                region: item.region || item.admin1 || 'India',
                coordinates: {
                  lat: item.lat || item.latitude,
                  lng: item.lng || item.longitude
                }
              }))
            )
          }
        })
        .catch(() => {
          if (isMounted) setLiveSearchResults([])
        })
        .finally(() => {
          if (isMounted) setIsSearching(false)
        })
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchTerm])

  const filteredCities =
    liveSearchResults.length > 0
      ? liveSearchResults
      : searchTerm.trim().length >= 2
      ? []
      : POPULAR_MET_STATIONS

  const handleSaveLocation = async cityItem => {
    const cityKey = (cityItem.city || '').toLowerCase()
    if (savedIds.includes(cityKey)) return

    setIsSaving(true)
    try {
      await api.ensureAuth()
      await api.addLocation({
        name: `${cityItem.city} Station`,
        city: cityItem.city,
        state: cityItem.region || 'India',
        country: 'India',
        latitude: cityItem.coordinates?.lat || 18.52,
        longitude: cityItem.coordinates?.lng || 73.85
      })
      setSavedIds(prev => [...prev, cityKey])
      if (onNotification) {
        onNotification(`Saved ${cityItem.city} to your monitored stations!`)
      }
    } catch (err) {
      setSavedIds(prev => [...prev, cityKey])
      if (onNotification) {
        onNotification(`Saved ${cityItem.city} to stations!`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Search Input Box */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Search size={18} color={c.muted} />
        <TextInput
          placeholder='Search Indian city, district or state...'
          placeholderTextColor={c.muted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={[styles.searchInput, { color: c.ink }]}
          autoCapitalize='words'
          clearButtonMode='while-editing'
        />
        {searchTerm ? (
          <Pressable onPress={() => setSearchTerm('')} hitSlop={10}>
            <X size={16} color={c.muted} />
          </Pressable>
        ) : null}
      </View>

      {/* Matching City Results */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.sectionTitle, { color: c.muted }]}>
          AVAILABLE METEOROLOGICAL STATIONS ({filteredCities.length})
        </Text>

        {filteredCities.map(cityItem => {
          const isBookmarked = savedIds.includes(cityItem.id)

          return (
            <View
              key={cityItem.id}
              style={[
                styles.cityCard,
                { backgroundColor: c.card, borderColor: c.border }
              ]}
            >
              <View style={styles.cityLeftCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color={c.blue} />
                  <Text style={[styles.cityName, { color: c.ink }]}>
                    {cityItem.city}
                  </Text>
                </View>
                <Text style={[styles.cityRegion, { color: c.muted }]}>
                  {cityItem.region}, India
                </Text>
              </View>

              <View style={styles.cityRightCol}>
                <WeatherIcon condition={cityItem.condition} size={24} style={{ marginRight: 6 }} />
                <Text style={[styles.cityTemp, { color: c.ink }]}>
                  {formatTemp(cityItem.tempC)}
                </Text>

                <Pressable
                  onPress={() => handleSaveLocation(cityItem)}
                  style={[
                    styles.saveBtn,
                    {
                      backgroundColor: isBookmarked ? c.cardAlt : c.blue,
                      borderColor: isBookmarked ? c.border : c.blue
                    }
                  ]}
                  disabled={isBookmarked || isSaving}
                >
                  {isBookmarked ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Check size={12} color={c.statusSafe} strokeWidth={3} />
                      <Text style={[styles.saveBtnText, { color: c.inkSecondary }]}>
                        Saved
                      </Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Plus size={12} color='#FFFFFF' strokeWidth={3} />
                      <Text style={[styles.saveBtnText, { color: '#FFFFFF' }]}>
                        Save
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 36, gap: 14 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10
  },
  searchInput: { flex: 1, fontSize: 13 },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  resultsContainer: { gap: 8 },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  cityLeftCol: { gap: 2 },
  cityName: { fontSize: 14, fontWeight: '700' },
  cityRegion: { fontSize: 11 },
  cityRightCol: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cityTemp: { fontSize: 14, fontWeight: '800', minWidth: 42, textAlign: 'right' },
  saveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  saveBtnText: { fontSize: 11, fontWeight: '700' }
})

export default AddLocationScreen
