import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ImageBackground,
  useWindowDimensions
} from 'react-native';
import { getColors } from '../theme/colors';
import { allCityDatabase } from '../data/mockData';

export function SavedLocationsScreen({
  isDark = false,
  unit = 'C',
  onNavigate,
  onNotification
}) {
  const c = getColors(isDark);
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const [locations, setLocations] = useState(allCityDatabase.slice(0, 5));
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('Last Updated');

  const formatTemperature = (tempC) => {
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°`;
    }
    return `${tempC}°`;
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Actions Bar */}
      <View style={[styles.topHeaderBar, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.mainHeading, { color: c.ink }]}>
            My Locations <Text style={{ color: c.muted }}>({locations.length})</Text>
          </Text>
        </View>

        <View style={styles.topRightActions}>
          <View style={[styles.sortSelect, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
            <Text style={[styles.sortLabel, { color: c.muted }]}>Sort by: </Text>
            <Text style={[styles.sortVal, { color: c.ink }]}>{sortBy}</Text>
            <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
          </View>

          {/* Grid / List view toggle */}
          <View style={[styles.viewToggleGroup, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
            <Pressable
              onPress={() => setViewMode('grid')}
              style={[styles.toggleBtn, viewMode === 'grid' && { backgroundColor: c.card }]}
            >
              <Text style={styles.toggleIcon}>⊞</Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('list')}
              style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: c.card }]}
            >
              <Text style={styles.toggleIcon}>☰</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              if (onNotification) onNotification('Add location dialog opened');
            }}
            style={[styles.addLocBtn, { backgroundColor: c.blue }]}
          >
            <Text style={styles.addLocText}>+ Add Location</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Layout Grid */}
      <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
        {/* Left Column: Locations List */}
        <View style={[styles.col, isWide && styles.colLeft]}>
          <View style={styles.locationsList}>
            {locations.map(loc => (
              <Pressable
                key={loc.id}
                onPress={() => onNavigate('weather-map')}
                style={({ pressed }) => [
                  styles.locCard,
                  { backgroundColor: c.card, borderColor: c.border },
                  pressed && styles.pressed
                ]}
              >
                {/* Top Info & Temp Row */}
                <View style={styles.locCardTop}>
                  <View style={styles.locInfoLeft}>
                    <View style={styles.locPinRow}>
                      <View style={[styles.locPinDot, { backgroundColor: c.blue }]} />
                      <Text style={[styles.locCityName, { color: c.ink }]}>
                        {loc.city}, {loc.region}
                      </Text>
                    </View>
                    <Text style={[styles.locCountry, { color: c.muted }]}>India</Text>
                    <Text style={[styles.locUpdated, { color: c.mutedLight }]}>
                      🕒 {loc.updatedTime}
                    </Text>
                  </View>

                  <View style={styles.locTempCol}>
                    <View style={styles.tempIconRow}>
                      <Text style={styles.conditionIcon}>
                        {loc.condition.includes('Rain') ? '🌧️' : loc.condition.includes('Cloud') ? '⛅' : '☀️'}
                      </Text>
                      <View>
                        <Text style={[styles.bigTemp, { color: c.ink }]}>
                          {formatTemperature(loc.tempC)}
                        </Text>
                        <Text style={[styles.conditionLabel, { color: c.muted }]}>
                          {loc.condition}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Metrics sub-block */}
                  <View style={styles.locMetricsBlock}>
                    <Text style={[styles.metricRowText, { color: c.muted }]}>
                      Feels like <Text style={{ color: c.ink, fontWeight: '700' }}>{formatTemperature(loc.feelsLikeC)}</Text>
                    </Text>
                    <Text style={[styles.metricRowText, { color: c.muted }]}>
                      Humidity <Text style={{ color: c.ink, fontWeight: '700' }}>{loc.humidity}%</Text>
                    </Text>
                    <Text style={[styles.metricRowText, { color: c.muted }]}>
                      Wind <Text style={{ color: c.ink, fontWeight: '700' }}>{loc.windSpeedKmh} km/h {loc.windDirection}</Text>
                    </Text>
                  </View>

                  {/* 3-day preview column */}
                  {loc.forecast3Day && (
                    <View style={styles.forecast3DayCol}>
                      <View style={styles.forecast3DayRow}>
                        {loc.forecast3Day.map(f => (
                          <View key={f.day} style={styles.f3DayItem}>
                            <Text style={[styles.f3DayName, { color: c.muted }]}>{f.day}</Text>
                            <Text style={styles.f3DayIcon}>{f.icon}</Text>
                            <Text style={[styles.f3DayTemp, { color: c.ink }]}>{f.temp}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <Text style={[styles.moreIcon, { color: c.muted }]}>⋮</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Add New Location Bottom Action Box matching Screenshot 4 */}
          <Pressable
            onPress={() => {
              if (onNotification) onNotification('Add new location modal');
            }}
            style={[styles.addNewLocationCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <Text style={[styles.addNewLocationTitle, { color: c.blue }]}>
              + Add New Location
            </Text>
            <Text style={[styles.addNewLocationSub, { color: c.muted }]}>
              Search and save any city to get real-time weather updates
            </Text>
          </Pressable>
        </View>

        {/* Right Column: Mini Map, Weather Summary & Tips */}
        <View style={[styles.col, isWide && styles.colRight]}>
          {/* Mini Location Map Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Location Map</Text>
              <Pressable onPress={() => onNavigate('weather-map')}>
                <Text style={[styles.cardAction, { color: c.blue }]}>View full map ›</Text>
              </Pressable>
            </View>

            <View style={styles.miniMapWrap}>
              <ImageBackground
                source={{
                  uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80'
                }}
                style={styles.miniMapImage}
                imageStyle={{ borderRadius: 14 }}
              >
                <View style={styles.miniMapOverlay} />
                {/* Marker pins */}
                <View style={[styles.miniPin, { top: '25%', left: '44%' }]}>
                  <Text style={styles.miniPinText}>📍 Delhi</Text>
                </View>
                <View style={[styles.miniPin, { top: '34%', left: '36%' }]}>
                  <Text style={styles.miniPinText}>📍 Jaipur</Text>
                </View>
                <View style={[styles.miniPin, { top: '56%', left: '38%' }]}>
                  <Text style={styles.miniPinText}>📍 Pune</Text>
                </View>
                <View style={[styles.miniPin, { top: '72%', left: '46%' }]}>
                  <Text style={styles.miniPinText}>📍 Bengaluru</Text>
                </View>
              </ImageBackground>
            </View>
          </View>

          {/* Weather Summary Card matching Screenshot 4 */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Weather Summary</Text>
            <Text style={[styles.summarySub, { color: c.muted }]}>Across your locations</Text>

            <View style={styles.summaryItemsList}>
              <View style={[styles.summaryRowItem, { borderBottomColor: c.borderLight }]}>
                <View>
                  <Text style={[styles.summaryLabel, { color: c.muted }]}>Warmest Location</Text>
                  <Text style={[styles.summaryValueName, { color: c.ink }]}>Jaipur</Text>
                </View>
                <Text style={[styles.summaryBigVal, { color: '#F59E0B' }]}>35°C</Text>
              </View>

              <View style={[styles.summaryRowItem, { borderBottomColor: c.borderLight }]}>
                <View>
                  <Text style={[styles.summaryLabel, { color: c.muted }]}>Coolest Location</Text>
                  <Text style={[styles.summaryValueName, { color: c.ink }]}>Bengaluru</Text>
                </View>
                <Text style={[styles.summaryBigVal, { color: '#3B82F6' }]}>24°C</Text>
              </View>

              <View style={styles.summaryRowItem}>
                <View>
                  <Text style={[styles.summaryLabel, { color: c.muted }]}>Rainy Location</Text>
                  <Text style={[styles.summaryValueName, { color: c.ink }]}>Mumbai</Text>
                </View>
                <Text style={[styles.summaryBigVal, { color: '#06B6D4' }]}>28°C</Text>
              </View>
            </View>

            <Text style={[styles.viewDetailedLink, { color: c.blue }]}>
              View detailed summary ›
            </Text>
          </View>

          {/* Personalized Tips Card matching Screenshot 4 */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.tipsHeaderRow}>
              <Text style={styles.tipsIcon}>💡</Text>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Tips</Text>
            </View>
            <Text style={[styles.summarySub, { color: c.muted }]}>
              Get personalized tips for your saved locations
            </Text>

            <View style={[styles.tipHighlightBox, { backgroundColor: c.cardAlt, borderColor: c.borderLight }]}>
              <Text style={styles.tipUmbrella}>☂️</Text>
              <Text style={[styles.tipHighlightText, { color: c.inkSecondary }]}>
                Carry an umbrella in Mumbai, light rain expected today.
              </Text>
            </View>

            <Text style={[styles.viewDetailedLink, { color: c.blue }]}>
              View all tips ›
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
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
  topHeaderBar: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mainHeading: {
    fontSize: 16,
    fontWeight: '800'
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sortSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  sortLabel: {
    fontSize: 11
  },
  sortVal: {
    fontSize: 11,
    fontWeight: '700'
  },
  chevron: {
    fontSize: 10,
    marginLeft: 2
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 2
  },
  toggleBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8
  },
  toggleIcon: {
    fontSize: 13
  },
  addLocBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10
  },
  addLocText: {
    color: '#FFFFFF',
    fontSize: 11,
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
  locationsList: {
    gap: 10
  },
  locCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  locCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10
  },
  locInfoLeft: {
    minWidth: 120
  },
  locPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  locPinDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  locCityName: {
    fontSize: 14,
    fontWeight: '800'
  },
  locCountry: {
    fontSize: 10,
    marginTop: 2
  },
  locUpdated: {
    fontSize: 9,
    marginTop: 4
  },
  locTempCol: {
    minWidth: 90
  },
  tempIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  conditionIcon: {
    fontSize: 22
  },
  bigTemp: {
    fontSize: 20,
    fontWeight: '900'
  },
  conditionLabel: {
    fontSize: 10
  },
  locMetricsBlock: {
    gap: 2
  },
  metricRowText: {
    fontSize: 9
  },
  forecast3DayCol: {
    borderLeftWidth: 1,
    borderLeftColor: '#EEF2F6',
    paddingLeft: 10
  },
  forecast3DayRow: {
    flexDirection: 'row',
    gap: 8
  },
  f3DayItem: {
    alignItems: 'center',
    gap: 2
  },
  f3DayName: {
    fontSize: 9,
    fontWeight: '700'
  },
  f3DayIcon: {
    fontSize: 13
  },
  f3DayTemp: {
    fontSize: 10,
    fontWeight: '800'
  },
  moreIcon: {
    fontSize: 14
  },
  addNewLocationCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  addNewLocationTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  addNewLocationSub: {
    fontSize: 10,
    textAlign: 'center'
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  cardAction: {
    fontSize: 11,
    fontWeight: '700'
  },
  miniMapWrap: {
    height: 140,
    borderRadius: 14,
    overflow: 'hidden'
  },
  miniMapImage: {
    flex: 1,
    position: 'relative'
  },
  miniMapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)'
  },
  miniPin: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  miniPinText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700'
  },
  summarySub: {
    fontSize: 10
  },
  summaryItemsList: {
    gap: 8,
    marginVertical: 4
  },
  summaryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1
  },
  summaryLabel: {
    fontSize: 9
  },
  summaryValueName: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2
  },
  summaryBigVal: {
    fontSize: 18,
    fontWeight: '900'
  },
  viewDetailedLink: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  tipsIcon: {
    fontSize: 16
  },
  tipHighlightBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4
  },
  tipUmbrella: {
    fontSize: 18
  },
  tipHighlightText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1
  },
  pressed: {
    opacity: 0.75
  }
});
