import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable
} from 'react-native'
import { getColors } from '../theme/colors'
import { allCityDatabase } from '../data/mockData'
import { api } from '../services/api'

export function AddLocationScreen ({
  isDark = false,
  unit = 'C',
  onNavigate,
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const [searchTerm, setSearchTerm] = useState('')
  const [savedIds, setSavedIds] = useState(['loc-1', 'loc-2'])
  const [isSaving, setIsSaving] = useState(false)

  const formatTemp = tempC => {
    if (tempC == null) return '--'
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`
    }
    return `${tempC}°C`
  }

  const filteredCities = allCityDatabase.filter(
    item =>
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveLocation = async cityItem => {
    if (savedIds.includes(cityItem.id)) return

    setIsSaving(true)
    try {
      if (backendReady) {
        await api.addLocation({
          name: cityItem.city,
          city: cityItem.city,
          state: cityItem.region,
          country: 'India',
          latitude: cityItem.coordinates?.lat || 18.52,
          longitude: cityItem.coordinates?.lng || 73.85
        })
      }
      setSavedIds(prev => [...prev, cityItem.id])
      if (onNotification) {
        onNotification(`Saved ${cityItem.city} to your bookmarked places!`)
      }
    } catch (err) {
      // Fallback local save
      setSavedIds(prev => [...prev, cityItem.id])
      if (onNotification) {
        onNotification(`Saved ${cityItem.city} locally!`)
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
        <Text style={styles.searchIcon}>🔍</Text>
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
          <Pressable onPress={() => setSearchTerm('')}>
            <Text style={[styles.clearBtn, { color: c.muted }]}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Quick GPS Bookmark Card */}
      <Pressable
        onPress={() => handleSaveLocation(allCityDatabase[0])}
        style={[
          styles.gpsCard,
          {
            backgroundColor: isDark ? '#1C293E' : '#EFF6FF',
            borderColor: isDark ? '#2E476C' : '#BFDBFE'
          }
        ]}
      >
        <Text style={styles.gpsIcon}>📍</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.gpsTitle, { color: c.ink }]}>
            Use Current Device Location
          </Text>
          <Text style={[styles.gpsSub, { color: c.muted }]}>
            Pune, Maharashtra (Auto-detected via GPS)
          </Text>
        </View>
        <Text style={[styles.gpsAddText, { color: c.blue }]}>+ Bookmark</Text>
      </Pressable>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsTitle, { color: c.muted }]}>
          AVAILABLE METEOROLOGICAL STATIONS ({filteredCities.length})
        </Text>
      </View>

      {/* Results List */}
      <View style={styles.citiesList}>
        {filteredCities.map(cityItem => {
          const isSaved = savedIds.includes(cityItem.id)
          return (
            <View
              key={cityItem.id}
              style={[
                styles.cityCard,
                { backgroundColor: c.card, borderColor: c.border }
              ]}
            >
              <View style={styles.cityCardLeft}>
                <View
                  style={[
                    styles.cityIconWrap,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }
                  ]}
                >
                  <Text style={styles.weatherEmoji}>
                    {cityItem.condition.toLowerCase().includes('rain')
                      ? '🌧️'
                      : cityItem.condition.toLowerCase().includes('cloud')
                      ? '⛅'
                      : '☀️'}
                  </Text>
                </View>
                <View style={styles.cityInfo}>
                  <Text style={[styles.cityName, { color: c.ink }]}>
                    {cityItem.city}
                  </Text>
                  <Text style={[styles.cityRegion, { color: c.muted }]}>
                    {cityItem.region}, India
                  </Text>
                  <Text style={[styles.cityMetrics, { color: c.inkSecondary }]}>
                    {cityItem.condition} • {formatTemp(cityItem.tempC)} (Feels{' '}
                    {formatTemp(cityItem.feelsLikeC)})
                  </Text>
                </View>
              </View>

              <Pressable
                disabled={isSaved || isSaving}
                onPress={() => handleSaveLocation(cityItem)}
                style={[
                  styles.saveBtn,
                  isSaved
                    ? { backgroundColor: isDark ? '#14382A' : '#ECFDF5' }
                    : { backgroundColor: c.blue }
                ]}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: isSaved ? '#10B981' : '#FFFFFF' }
                  ]}
                >
                  {isSaved ? '✓ Saved' : '+ Save'}
                </Text>
              </Pressable>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 28, gap: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 12, padding: 0 },
  clearBtn: { fontSize: 13, paddingHorizontal: 4 },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10
  },
  gpsIcon: { fontSize: 18 },
  gpsTitle: { fontSize: 11.5, fontWeight: '800' },
  gpsSub: { fontSize: 9, marginTop: 1 },
  gpsAddText: { fontSize: 11, fontWeight: '800' },
  resultsHeader: { marginTop: 4, paddingHorizontal: 4 },
  resultsTitle: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  citiesList: { gap: 8 },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1
  },
  cityCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cityIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  weatherEmoji: { fontSize: 20 },
  cityInfo: { flex: 1 },
  cityName: { fontSize: 13, fontWeight: '800' },
  cityRegion: { fontSize: 9.5 },
  cityMetrics: { fontSize: 10, marginTop: 2, fontWeight: '500' },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10
  },
  saveBtnText: { fontSize: 10.5, fontWeight: '800' }
})
