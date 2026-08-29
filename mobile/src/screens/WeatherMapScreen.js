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
import { Switch } from '../components/Switch'
import { getColors } from '../theme/colors'
import { allCityDatabase } from '../data/mockData'
import { api } from '../services/api'

const TABS = [
  { id: 'live', label: 'Live Map' },
  { id: 'rainfall', label: 'Rainfall' },
  { id: 'temp', label: 'Temperature' },
  { id: 'wind', label: 'Wind' },
  { id: 'clouds', label: 'Clouds' },
  { id: 'pressure', label: 'Pressure' },
  { id: 'air', label: 'Air Quality' }
]

const TIMELINE_STEPS = [
  { label: '8:00 AM', sub: '-4h' },
  { label: '10:00 AM', sub: '-2h' },
  { label: 'Now', sub: 'Live', isCurrent: true },
  { label: '1:00 PM', sub: '+2h' },
  { label: '4:00 PM', sub: '+5h' },
  { label: '7:00 PM', sub: '+8h' },
  { label: '10:00 PM', sub: '+11h' }
]

export function WeatherMapScreen ({
  isDark = false,
  unit = 'C',
  onNotification,
  backendReady = false
}) {
  const c = getColors(isDark)
  const { width } = useWindowDimensions()
  const isWide = width > 768

  const [activeTab, setActiveTab] = useState('live')
  const [selectedCity, setSelectedCity] = useState(allCityDatabase[0]) // Pune by default
  const [isPlaying, setIsPlaying] = useState(false)
  const [timelineIndex, setTimelineIndex] = useState(2) // 'Now'
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedCountry, setSelectedCountry] = useState('India')
  const [isFavorite, setIsFavorite] = useState(true)
  const [liveCitySummary, setLiveCitySummary] = useState(null)

  useEffect(() => {
    if (!backendReady) return

    let isMounted = true
    api
      .weather({ latitude: 18.5204, longitude: 73.8567, city: 'Pune' })
      .then(result => {
        if (!isMounted) return
        if (result?.forecast?.current) {
          setLiveCitySummary(result.forecast.current)
        }
      })
      .catch(() => {
        if (!isMounted) return
        setLiveCitySummary(null)
      })

    return () => {
      isMounted = false
    }
  }, [backendReady])

  // Map layer switches
  const [layers, setLayers] = useState({
    rainfall: true,
    temperature: false,
    wind: false,
    clouds: false,
    pressure: false,
    airQuality: false,
    lightning: false,
    cycloneTracks: false
  })

  const toggleLayer = key => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Timeline auto-play timer
  useEffect(() => {
    let timer
    if (isPlaying) {
      timer = setInterval(() => {
        setTimelineIndex(prev => (prev + 1) % TIMELINE_STEPS.length)
      }, 1400)
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  const handleCitySelect = city => {
    setSelectedCity(city)
    setIsFavorite(city.isFavorite || false)
    if (onNotification) {
      onNotification(`Weather radar focused on ${city.city}`)
    }
  }

  const formatTemperature = tempC => {
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°`
    }
    return `${tempC}°`
  }

  const currentWeatherValue = liveCitySummary?.temperature ?? selectedCity.tempC

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Tabs across the top */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: c.blue, borderBottomWidth: 2 }
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? c.blue : c.muted },
                  isActive && styles.tabLabelActive
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Main Responsive Grid */}
      <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
        {/* Left Column: Map Canvas + Timeline Card */}
        <View style={[styles.col, isWide && styles.colLeft]}>
          {/* Main Map Canvas */}
          <View style={[styles.mapContainer, { borderColor: c.border }]}>
            <ImageBackground
              source={{
                uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&auto=format&fit=crop&q=80'
              }}
              style={[
                styles.mapBackdrop,
                { transform: [{ scale: zoomLevel }] }
              ]}
              imageStyle={styles.mapImage}
            >
              {/* Atmospheric dark tint */}
              <View style={styles.mapDarkOverlay} />

              {/* Doppler Radar Simulation Layers */}
              {layers.rainfall && (
                <View style={styles.radarLayer}>
                  {/* Cyclone Storm in Bay of Bengal */}
                  <View
                    style={[
                      styles.cycloneGlow,
                      {
                        transform: [
                          { rotate: `${timelineIndex * 35}deg` },
                          { scale: 1 + timelineIndex * 0.04 }
                        ]
                      }
                    ]}
                  />

                  {/* Monsoon Rain band along Western Ghats */}
                  <View
                    style={[
                      styles.rainBandGlow,
                      {
                        transform: [
                          { translateY: timelineIndex * 3 },
                          { rotate: '-12deg' }
                        ]
                      }
                    ]}
                  />

                  {/* Northeast Storm Cluster */}
                  <View
                    style={[
                      styles.northeastGlow,
                      {
                        transform: [{ scale: 0.95 + timelineIndex * 0.05 }]
                      }
                    ]}
                  />
                </View>
              )}

              {/* Interactive City Weather Markers over India */}
              {allCityDatabase.map(pin => {
                const isSelected = selectedCity.id === pin.id
                return (
                  <Pressable
                    key={pin.id}
                    onPress={() => handleCitySelect(pin)}
                    style={[
                      styles.cityPin,
                      {
                        top: pin.coordinates.top,
                        left: pin.coordinates.left,
                        backgroundColor: isSelected
                          ? '#2563EB'
                          : 'rgba(15, 23, 42, 0.85)',
                        borderColor: isSelected
                          ? '#93C5FD'
                          : 'rgba(255, 255, 255, 0.25)',
                        transform: [{ scale: isSelected ? 1.15 : 1 }]
                      }
                    ]}
                  >
                    <View
                      style={[
                        styles.pinIndicator,
                        { backgroundColor: isSelected ? '#FFFFFF' : '#10B981' }
                      ]}
                    />
                    <Text style={styles.pinCityName}>{pin.city}</Text>
                    <Text style={styles.pinTemp}>
                      {formatTemperature(pin.tempC)}
                    </Text>
                  </Pressable>
                )
              })}

              {/* Floating Map Controls - Top Left */}
              <View style={styles.topLeftControls}>
                <Pressable
                  onPress={() =>
                    setZoomLevel(prev => Math.min(prev + 0.15, 1.6))
                  }
                  style={styles.mapCtrlBtn}
                  accessibilityLabel='Zoom in'
                >
                  <Text style={styles.mapCtrlText}>+</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    setZoomLevel(prev => Math.max(prev - 0.15, 0.85))
                  }
                  style={styles.mapCtrlBtn}
                  accessibilityLabel='Zoom out'
                >
                  <Text style={styles.mapCtrlText}>−</Text>
                </Pressable>
                <View style={styles.ctrlDivider} />
                <Pressable
                  onPress={() => {
                    const pune = allCityDatabase.find(c => c.id === 'pune')
                    if (pune) handleCitySelect(pune)
                  }}
                  style={styles.mapCtrlBtn}
                  accessibilityLabel='Center on My Location'
                >
                  <Text style={styles.mapCtrlIcon}>⌖</Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleLayer('rainfall')}
                  style={styles.mapCtrlBtn}
                  accessibilityLabel='Toggle radar layers'
                >
                  <Text style={styles.mapCtrlIcon}>⊞</Text>
                </Pressable>
              </View>

              {/* Floating Map Controls - Top Right (Country Selector & Fullscreen) */}
              <View style={styles.topRightControls}>
                <View style={styles.countryTag}>
                  <Text style={styles.countryTagText}>{selectedCountry}</Text>
                  <Text style={styles.countryTagArrow}>▾</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setZoomLevel(zoomLevel === 1 ? 1.3 : 1)
                  }}
                  style={styles.mapCtrlBtn}
                >
                  <Text style={styles.mapCtrlIcon}>⛶</Text>
                </Pressable>
              </View>

              {/* Bottom Left "My Location" button */}
              <Pressable
                onPress={() => {
                  const pune = allCityDatabase.find(c => c.id === 'pune')
                  if (pune) handleCitySelect(pune)
                }}
                style={styles.myLocationPill}
              >
                <Text style={styles.myLocationIcon}>📍</Text>
                <Text style={styles.myLocationLabel}>My Location</Text>
              </Pressable>

              {/* Bottom Right: Rainfall (mm) Gradient Legend */}
              <View style={styles.rainfallLegendCard}>
                <Text style={styles.legendTitle}>Rainfall (mm)</Text>
                <View style={styles.legendScaleRow}>
                  <View style={styles.legendGradientBar}>
                    <View
                      style={[styles.gradStep, { backgroundColor: '#8B5CF6' }]}
                    />
                    <View
                      style={[styles.gradStep, { backgroundColor: '#EF4444' }]}
                    />
                    <View
                      style={[styles.gradStep, { backgroundColor: '#F97316' }]}
                    />
                    <View
                      style={[styles.gradStep, { backgroundColor: '#FBBF24' }]}
                    />
                    <View
                      style={[styles.gradStep, { backgroundColor: '#22C55E' }]}
                    />
                    <View
                      style={[styles.gradStep, { backgroundColor: '#06B6D4' }]}
                    />
                    <View
                      style={[styles.gradStep, { backgroundColor: '#3B82F6' }]}
                    />
                    <View
                      style={[
                        styles.gradStep,
                        { backgroundColor: 'rgba(59, 130, 246, 0.4)' }
                      ]}
                    />
                  </View>
                  <View style={styles.legendValuesCol}>
                    <Text style={styles.legendValueText}>200+</Text>
                    <Text style={styles.legendValueText}>100</Text>
                    <Text style={styles.legendValueText}>50</Text>
                    <Text style={styles.legendValueText}>20</Text>
                    <Text style={styles.legendValueText}>10</Text>
                    <Text style={styles.legendValueText}>5</Text>
                    <Text style={styles.legendValueText}>2</Text>
                    <Text style={styles.legendValueText}>1</Text>
                    <Text style={styles.legendValueText}>0.5</Text>
                    <Text style={styles.legendValueText}>0</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Map Timeline Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <View style={styles.timelineHeaderRow}>
              <Text style={[styles.timelineHeading, { color: c.ink }]}>
                Map Timeline (Rainfall)
              </Text>
              <View style={styles.autoUpdateRow}>
                <Text style={[styles.autoUpdateText, { color: c.muted }]}>
                  Auto Update
                </Text>
                <Switch checked={autoUpdate} onChange={setAutoUpdate} />
                <Text style={[styles.infoIcon, { color: c.muted }]}>ⓘ</Text>
              </View>
            </View>

            {/* Timeline controls */}
            <View style={styles.timelineScrubberRow}>
              <Pressable
                onPress={() => setIsPlaying(!isPlaying)}
                style={styles.playButton}
                accessibilityLabel={
                  isPlaying ? 'Pause timeline' : 'Play timeline'
                }
              >
                <Text style={styles.playButtonIcon}>
                  {isPlaying ? '❚❚' : '▶'}
                </Text>
              </Pressable>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timelineStepsContainer}
              >
                {TIMELINE_STEPS.map((step, idx) => {
                  const isSelected = timelineIndex === idx
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        setTimelineIndex(idx)
                        setIsPlaying(false)
                      }}
                      style={styles.timelineStepButton}
                    >
                      <View
                        style={[
                          styles.timelineDot,
                          isSelected
                            ? styles.timelineDotActive
                            : { backgroundColor: c.border }
                        ]}
                      />
                      <View
                        style={[
                          styles.stepBadge,
                          step.isCurrent && styles.nowBadge,
                          isSelected &&
                            !step.isCurrent && { backgroundColor: c.blueLight }
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepLabel,
                            {
                              color: step.isCurrent
                                ? '#FFFFFF'
                                : isSelected
                                ? c.blue
                                : c.muted
                            },
                            (isSelected || step.isCurrent) &&
                              styles.stepLabelActive
                          ]}
                        >
                          {step.label}
                        </Text>
                      </View>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>

            {/* Footer info */}
            <View
              style={[styles.timelineFooter, { borderTopColor: c.borderLight }]}
            >
              <View style={styles.sourceRow}>
                <Text style={[styles.sourceIcon, { color: c.muted }]}>🛡️</Text>
                <Text style={[styles.sourceText, { color: c.muted }]}>
                  Source: India Meteorological Department (IMD)
                </Text>
              </View>
              <View style={styles.sourceRow}>
                <Text style={[styles.sourceText, { color: c.muted }]}>
                  Last updated: 10:20 AM
                </Text>
                <Pressable
                  onPress={() => {
                    if (onNotification) onNotification('Radar data refreshed')
                  }}
                >
                  <Text style={[styles.refreshIcon, { color: c.blue }]}>
                    🔄
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Right Column: Selected Location, Map Layers, Quick Locations */}
        <View style={[styles.col, isWide && styles.colRight]}>
          {/* Selected Location Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <View style={styles.selectedLocHeader}>
              <View style={styles.selectedLocTitleRow}>
                <Text style={styles.selectedLocPin}>📍</Text>
                <Text style={[styles.selectedLocLabel, { color: c.ink }]}>
                  Selected Location
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setIsFavorite(!isFavorite)
                  if (onNotification) {
                    onNotification(
                      isFavorite
                        ? 'Removed from favorites'
                        : 'Added to favorites'
                    )
                  }
                }}
              >
                <Text
                  style={[
                    styles.favStar,
                    { color: isFavorite ? '#F59E0B' : c.muted }
                  ]}
                >
                  {isFavorite ? '★' : '☆'}
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.cityNameText, { color: c.ink }]}>
              {selectedCity.city}, {selectedCity.region}
            </Text>

            {/* Big Temp & Condition Row */}
            <View
              style={[
                styles.tempConditionRow,
                {
                  borderTopColor: c.borderLight,
                  borderBottomColor: c.borderLight
                }
              ]}
            >
              <View>
                <Text style={[styles.bigTempText, { color: c.ink }]}>
                  {formatTemperature(selectedCity.tempC)}
                  <Text style={styles.celsiusText}>
                    {unit === 'F' ? 'F' : 'C'}
                  </Text>
                </Text>
                <Text style={[styles.conditionText, { color: c.muted }]}>
                  {selectedCity.condition}
                </Text>
              </View>
              <View style={styles.weatherIcon3D}>
                <View style={styles.iconSunGlow} />
                <View style={styles.iconCloudPuff} />
              </View>
            </View>

            {/* 2x2 Metric Grid */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricTile, { backgroundColor: c.cardAlt }]}>
                <Text style={[styles.metricTileLabel, { color: c.muted }]}>
                  Feels like
                </Text>
                <Text style={[styles.metricTileValue, { color: c.ink }]}>
                  {formatTemperature(selectedCity.feelsLikeC)}
                </Text>
              </View>
              <View style={[styles.metricTile, { backgroundColor: c.cardAlt }]}>
                <Text style={[styles.metricTileLabel, { color: c.muted }]}>
                  Humidity
                </Text>
                <Text style={[styles.metricTileValue, { color: c.ink }]}>
                  {selectedCity.humidity}%
                </Text>
              </View>
              <View style={[styles.metricTile, { backgroundColor: c.cardAlt }]}>
                <Text style={[styles.metricTileLabel, { color: c.muted }]}>
                  Wind
                </Text>
                <Text style={[styles.metricTileValue, { color: c.ink }]}>
                  {selectedCity.windSpeedKmh} km/h {selectedCity.windDirection}
                </Text>
              </View>
              <View style={[styles.metricTile, { backgroundColor: c.cardAlt }]}>
                <Text style={[styles.metricTileLabel, { color: c.muted }]}>
                  Pressure
                </Text>
                <Text style={[styles.metricTileValue, { color: c.ink }]}>
                  {selectedCity.pressureHpa} hPa
                </Text>
              </View>
            </View>

            <View style={styles.updatedRow}>
              <Text style={[styles.updatedText, { color: c.muted }]}>
                {selectedCity.updatedTime || 'Updated 10:20 AM'}
              </Text>
              <Text style={[styles.refreshSmall, { color: c.muted }]}>🔄</Text>
            </View>
          </View>

          {/* Map Layers Toggle Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.ink }]}>Map Layers</Text>
            <View style={styles.layersList}>
              {[
                { key: 'rainfall', label: 'Rainfall', icon: '🌧️' },
                { key: 'temperature', label: 'Temperature', icon: '🌡️' },
                { key: 'wind', label: 'Wind', icon: '💨' },
                { key: 'clouds', label: 'Clouds', icon: '☁️' },
                { key: 'pressure', label: 'Pressure', icon: '⏲️' },
                { key: 'airQuality', label: 'Air Quality', icon: '🍃' },
                { key: 'lightning', label: 'Lightning', icon: '⚡' },
                { key: 'cycloneTracks', label: 'Cyclone Tracks', icon: '🌀' }
              ].map(layer => (
                <View key={layer.key} style={styles.layerRow}>
                  <View style={styles.layerRowLeft}>
                    <Text style={styles.layerIcon}>{layer.icon}</Text>
                    <Text
                      style={[styles.layerLabel, { color: c.inkSecondary }]}
                    >
                      {layer.label}
                    </Text>
                  </View>
                  <Switch
                    checked={layers[layer.key]}
                    onChange={() => toggleLayer(layer.key)}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Quick Locations Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border }
            ]}
          >
            <View style={styles.quickLocationsHeader}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>
                Quick Locations
              </Text>
              <Pressable
                onPress={() => {
                  if (onNotification)
                    onNotification('All quick locations active')
                }}
              >
                <Text style={[styles.viewAllText, { color: c.blue }]}>
                  View all
                </Text>
              </Pressable>
            </View>

            <View style={styles.quickLocationsList}>
              {[
                { id: 'pune', name: 'Pune, Maharashtra', star: true },
                { id: 'mumbai', name: 'Mumbai, Maharashtra', star: false },
                { id: 'delhi', name: 'New Delhi, Delhi', star: false },
                { id: 'chennai', name: 'Chennai, Tamil Nadu', star: false }
              ].map(item => {
                const isCurrent = selectedCity.id === item.id
                const cityData = allCityDatabase.find(c => c.id === item.id)
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => cityData && handleCitySelect(cityData)}
                    style={({ pressed }) => [
                      styles.quickLocRow,
                      isCurrent && { backgroundColor: c.blueLight },
                      pressed && styles.pressed
                    ]}
                  >
                    <View style={styles.quickLocLeft}>
                      <Text
                        style={[
                          styles.quickLocPin,
                          isCurrent && { color: c.blue }
                        ]}
                      >
                        📍
                      </Text>
                      <Text
                        style={[
                          styles.quickLocName,
                          { color: isCurrent ? c.blue : c.inkSecondary },
                          isCurrent && styles.quickLocNameActive
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.quickLocStar,
                        { color: item.star ? '#F59E0B' : c.mutedLight }
                      ]}
                    >
                      {item.star ? '★' : '☆'}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 36,
    gap: 12
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 2
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 4
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  tabLabelActive: {
    fontWeight: '800'
  },
  mainGrid: {
    gap: 12
  },
  mainGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  col: {
    gap: 12
  },
  colLeft: {
    flex: 7
  },
  colRight: {
    flex: 5
  },
  mapContainer: {
    height: 320,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5
  },
  mapBackdrop: {
    flex: 1,
    position: 'relative'
  },
  mapImage: {
    resizeMode: 'cover'
  },
  mapDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)'
  },
  radarLayer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none'
  },
  cycloneGlow: {
    position: 'absolute',
    top: '46%',
    right: '18%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.55)',
    shadowColor: '#F97316',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 6
  },
  rainBandGlow: {
    position: 'absolute',
    top: '46%',
    left: '26%',
    width: 60,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: '#06B6D4',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 5
  },
  northeastGlow: {
    position: 'absolute',
    top: '24%',
    right: '22%',
    width: 90,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(234, 179, 8, 0.55)',
    shadowColor: '#22C55E',
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 4
  },
  cityPin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 10
  },
  pinIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3
  },
  pinCityName: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700'
  },
  pinTemp: {
    color: '#FDE047',
    fontSize: 9,
    fontWeight: '800'
  },
  topLeftControls: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 2,
    zIndex: 20
  },
  mapCtrlBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapCtrlText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  mapCtrlIcon: {
    color: '#FFFFFF',
    fontSize: 12
  },
  ctrlDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 3
  },
  topRightControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 20
  },
  countryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  countryTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  countryTagArrow: {
    color: '#94A3B8',
    fontSize: 8
  },
  myLocationPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 20
  },
  myLocationIcon: {
    fontSize: 11
  },
  myLocationLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  rainfallLegendCard: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    zIndex: 20
  },
  legendTitle: {
    color: '#CBD5E1',
    fontSize: 7,
    fontWeight: '800',
    marginBottom: 3
  },
  legendScaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  legendGradientBar: {
    width: 6,
    height: 75,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'space-between'
  },
  gradStep: {
    flex: 1
  },
  legendValuesCol: {
    height: 75,
    justifyContent: 'space-between'
  },
  legendValueText: {
    color: '#94A3B8',
    fontSize: 6.5,
    fontWeight: '700'
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  timelineHeading: {
    fontSize: 12,
    fontWeight: '800'
  },
  autoUpdateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  autoUpdateText: {
    fontSize: 10,
    fontWeight: '600'
  },
  infoIcon: {
    fontSize: 12
  },
  timelineScrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playButtonIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  timelineStepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  timelineStepButton: {
    alignItems: 'center',
    gap: 3
  },
  timelineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5
  },
  timelineDotActive: {
    backgroundColor: '#2563EB',
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  stepBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  nowBadge: {
    backgroundColor: '#2563EB'
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '600'
  },
  stepLabelActive: {
    fontWeight: '800'
  },
  timelineFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  sourceIcon: {
    fontSize: 9
  },
  sourceText: {
    fontSize: 8.5
  },
  refreshIcon: {
    fontSize: 10
  },
  selectedLocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectedLocTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  selectedLocPin: {
    fontSize: 13
  },
  selectedLocLabel: {
    fontSize: 11,
    fontWeight: '800'
  },
  favStar: {
    fontSize: 16
  },
  cityNameText: {
    fontSize: 15,
    fontWeight: '800'
  },
  tempConditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  bigTempText: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1
  },
  celsiusText: {
    fontSize: 18,
    fontWeight: '600'
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  weatherIcon3D: {
    width: 44,
    height: 36,
    position: 'relative'
  },
  iconSunGlow: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B'
  },
  iconCloudPuff: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 32,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#38BDF8'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  metricTile: {
    width: '48%',
    padding: 8,
    borderRadius: 10
  },
  metricTileLabel: {
    fontSize: 8,
    fontWeight: '600'
  },
  metricTileValue: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  updatedText: {
    fontSize: 9
  },
  refreshSmall: {
    fontSize: 10
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  layersList: {
    gap: 8
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  layerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  layerIcon: {
    fontSize: 14
  },
  layerLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  quickLocationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  viewAllText: {
    fontSize: 10,
    fontWeight: '700'
  },
  quickLocationsList: {
    gap: 2
  },
  quickLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10
  },
  quickLocLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  quickLocPin: {
    fontSize: 11
  },
  quickLocName: {
    fontSize: 11,
    fontWeight: '600'
  },
  quickLocNameActive: {
    fontWeight: '800'
  },
  quickLocStar: {
    fontSize: 13
  },
  pressed: {
    opacity: 0.75
  }
})
