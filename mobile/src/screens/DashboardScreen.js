import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { getColors } from '../theme/colors';
import { alertsData, recentConversationsData } from '../data/mockData';

export function DashboardScreen({
  isDark = false,
  unit = 'C',
  onNavigate
}) {
  const c = getColors(isDark);
  const { width } = useWindowDimensions();
  const isWide = width > 768;
  const [searchQuery, setSearchQuery] = useState('');

  const formatTemperature = (tempC) => {
    if (unit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°`;
    }
    return `${tempC}°`;
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onNavigate('chat');
    }
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Search Bar & Query Chips */}
      <View style={[styles.searchSection, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            placeholder="Ask WeatherGPT anything..."
            placeholderTextColor={c.muted}
            style={[styles.searchInput, { color: c.ink }]}
            returnKeyType="search"
          />
          <Pressable style={styles.searchIconBtn}>
            <Text style={[styles.searchIconText, { color: c.blue }]}>🎙️</Text>
          </Pressable>
          <Pressable
            onPress={handleSearchSubmit}
            style={[styles.searchSendBtn, { backgroundColor: c.blue }]}
          >
            <Text style={styles.searchSendIcon}>✈️</Text>
          </Pressable>
        </View>

        {/* Quick query chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {[
            'Will it rain tomorrow?',
            'Weather in Mumbai',
            'Cyclone update',
            'Air quality today'
          ].map(chip => (
            <Pressable
              key={chip}
              onPress={() => onNavigate('chat')}
              style={[styles.chip, { backgroundColor: c.cardAlt, borderColor: c.border }]}
            >
              <Text style={[styles.chipText, { color: c.inkSecondary }]}>{chip}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Main Grid Section */}
      <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
        {/* Left Column on Desktop / First on Mobile */}
        <View style={[styles.col, isWide && styles.colLeft]}>
          {/* Weather Hero Card matching Screenshot 1 */}
          <View style={[styles.heroCard, { backgroundColor: isDark ? '#173059' : '#D6EBFF', borderColor: c.border }]}>
            <View style={styles.heroHeader}>
              <View style={styles.heroLocationRow}>
                <Text style={styles.heroPin}>📍</Text>
                <Text style={[styles.heroLocationText, { color: c.ink }]}>
                  Pune, Maharashtra
                </Text>
              </View>
              <Text style={[styles.heroTimeText, { color: c.muted }]}>
                Today, 21 May 2025 | 8:30 AM
              </Text>
            </View>

            <View style={styles.heroCenterRow}>
              <View>
                <Text style={[styles.heroBigTemp, { color: c.ink }]}>
                  28<Text style={styles.heroDegree}>°C</Text>
                </Text>
                <Text style={[styles.heroFeelsLike, { color: c.muted }]}>
                  Feels like {formatTemperature(30)}
                </Text>
                <Text style={[styles.heroCondition, { color: c.ink }]}>
                  Partly Cloudy
                </Text>
              </View>

              {/* 3D Sun & Cloud Graphic */}
              <View style={styles.heroWeatherGraphic}>
                <View style={styles.sunCircle} />
                <View style={styles.cloudShape1} />
                <View style={styles.cloudShape2} />
              </View>
            </View>

            {/* 4 Bottom Metric Pills */}
            <View style={styles.heroMetricsGrid}>
              <View style={[styles.heroMetricPill, { backgroundColor: c.card }]}>
                <Text style={styles.heroMetricIcon}>💧</Text>
                <Text style={[styles.heroMetricLabel, { color: c.muted }]}>Humidity</Text>
                <Text style={[styles.heroMetricVal, { color: c.ink }]}>72%</Text>
              </View>
              <View style={[styles.heroMetricPill, { backgroundColor: c.card }]}>
                <Text style={styles.heroMetricIcon}>💨</Text>
                <Text style={[styles.heroMetricLabel, { color: c.muted }]}>Wind</Text>
                <Text style={[styles.heroMetricVal, { color: c.ink }]}>14 km/h</Text>
              </View>
              <View style={[styles.heroMetricPill, { backgroundColor: c.card }]}>
                <Text style={styles.heroMetricIcon}>⏲️</Text>
                <Text style={[styles.heroMetricLabel, { color: c.muted }]}>Pressure</Text>
                <Text style={[styles.heroMetricVal, { color: c.ink }]}>1008 hPa</Text>
              </View>
              <View style={[styles.heroMetricPill, { backgroundColor: c.card }]}>
                <Text style={styles.heroMetricIcon}>👁️</Text>
                <Text style={[styles.heroMetricLabel, { color: c.muted }]}>Visibility</Text>
                <Text style={[styles.heroMetricVal, { color: c.ink }]}>8 km</Text>
              </View>
            </View>
          </View>

          {/* Today's Forecast (Hourly) */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Today's Forecast</Text>
              <Pressable onPress={() => onNavigate('forecast')}>
                <Text style={[styles.cardAction, { color: c.blue }]}>View Full Forecast</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyScroll}
            >
              {[
                { time: 'Now', temp: 28, chance: '65%', icon: '⛅' },
                { time: '9 AM', temp: 29, chance: '60%', icon: '🌧️' },
                { time: '10 AM', temp: 30, chance: '70%', icon: '🌧️' },
                { time: '11 AM', temp: 31, chance: '80%', icon: '🌧️' },
                { time: '12 PM', temp: 31, chance: '70%', icon: '☁️' },
                { time: '1 PM', temp: 30, chance: '60%', icon: '☁️' },
                { time: '2 PM', temp: 29, chance: '40%', icon: '☁️' }
              ].map((hour, idx) => (
                <View
                  key={hour.time}
                  style={[
                    styles.hourCard,
                    { backgroundColor: c.cardAlt, borderColor: c.border },
                    idx === 0 && { borderColor: c.blue, backgroundColor: isDark ? '#1E3A6D' : '#EFF6FF' }
                  ]}
                >
                  <Text style={[styles.hourTime, { color: c.muted }]}>{hour.time}</Text>
                  <Text style={styles.hourIcon}>{hour.icon}</Text>
                  <Text style={[styles.hourTemp, { color: c.ink }]}>{hour.temp}°</Text>
                  <Text style={styles.hourChance}>💧 {hour.chance}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Recent Conversations */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Recent Conversations</Text>
              <Pressable onPress={() => onNavigate('history')}>
                <Text style={[styles.cardAction, { color: c.blue }]}>View All</Text>
              </Pressable>
            </View>

            <View style={styles.conversationsList}>
              {recentConversationsData.map((conv, idx) => (
                <Pressable
                  key={conv.id}
                  onPress={() => onNavigate('chat')}
                  style={[
                    styles.convRow,
                    { borderBottomColor: c.borderLight },
                    idx === recentConversationsData.length - 1 && { borderBottomWidth: 0 }
                  ]}
                >
                  <Text style={styles.convIcon}>💬</Text>
                  <Text style={[styles.convTitle, { color: c.ink }]} numberOfLines={1}>
                    {conv.title}
                  </Text>
                  <Text style={[styles.convTime, { color: c.muted }]}>{conv.time}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Right Column on Desktop / Second on Mobile */}
        <View style={[styles.col, isWide && styles.colRight]}>
          {/* Active Alerts Card matching Screenshot 1 */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Active Alerts</Text>
              <Pressable onPress={() => onNavigate('alerts')}>
                <Text style={[styles.cardAction, { color: c.blue }]}>View All</Text>
              </Pressable>
            </View>

            <View style={styles.alertsList}>
              {/* Featured Severe Alert */}
              <View style={[styles.featuredAlert, { backgroundColor: isDark ? '#3D1C1B' : '#FFF1F0', borderColor: '#FCA5A5' }]}>
                <View style={styles.alertHeaderRow}>
                  <Text style={styles.alertWarningIcon}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featuredAlertTitle}>Heavy Rainfall Warning</Text>
                    <Text style={[styles.alertLocationText, { color: c.ink }]}>Pune, Maharashtra</Text>
                    <Text style={[styles.alertDateText, { color: c.muted }]}>21 May 2025 • 8:20 AM</Text>
                  </View>
                </View>
                <Text style={[styles.alertDetailText, { color: c.inkSecondary }]}>
                  Heavy rainfall expected in the next 24 hours. Avoid low lying areas.
                </Text>
                <Pressable
                  onPress={() => onNavigate('alerts')}
                  style={styles.viewDetailsButton}
                >
                  <Text style={styles.viewDetailsButtonText}>View Details →</Text>
                </Pressable>
              </View>

              {/* Other Alerts in List */}
              {alertsData.slice(1, 3).map(alt => (
                <Pressable
                  key={alt.id}
                  onPress={() => onNavigate('alerts')}
                  style={[styles.smallAlertRow, { borderTopColor: c.borderLight }]}
                >
                  <Text style={styles.alertWarningIconSmall}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.smallAlertTitle, { color: c.ink }]}>{alt.title}</Text>
                    <Text style={[styles.smallAlertSub, { color: c.muted }]}>{alt.location}</Text>
                    <Text style={[styles.smallAlertTime, { color: c.mutedLight }]}>{alt.time}</Text>
                  </View>
                  <Text style={[styles.chevronArrow, { color: c.muted }]}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink, marginBottom: 12 }]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <Pressable
                onPress={() => onNavigate('forecast')}
                style={[styles.quickCard, { backgroundColor: isDark ? '#1C2E4A' : '#EFF6FF' }]}
              >
                <Text style={styles.quickCardIcon}>📅</Text>
                <Text style={[styles.quickCardLabel, { color: c.ink }]}>Weather Forecast</Text>
              </Pressable>

              <Pressable
                onPress={() => onNavigate('weather-map')}
                style={[styles.quickCard, { backgroundColor: isDark ? '#14382A' : '#ECFDF5' }]}
              >
                <Text style={styles.quickCardIcon}>🗺️</Text>
                <Text style={[styles.quickCardLabel, { color: c.ink }]}>Weather Map</Text>
              </Pressable>

              <Pressable
                onPress={() => onNavigate('alerts')}
                style={[styles.quickCard, { backgroundColor: isDark ? '#3D1C1B' : '#FEF2F2' }]}
              >
                <Text style={styles.quickCardIcon}>⚠️</Text>
                <Text style={[styles.quickCardLabel, { color: c.ink }]}>Alerts</Text>
              </Pressable>

              <Pressable
                onPress={() => onNavigate('weather-map')}
                style={[styles.quickCard, { backgroundColor: isDark ? '#2E1A47' : '#F5F3FF' }]}
              >
                <Text style={styles.quickCardIcon}>💨</Text>
                <Text style={[styles.quickCardLabel, { color: c.ink }]}>Air Quality</Text>
              </Pressable>
            </View>
          </View>

          {/* Saved Locations */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Saved Locations</Text>
              <Pressable onPress={() => onNavigate('saved-locations')}>
                <Text style={[styles.cardAction, { color: c.blue }]}>View All</Text>
              </Pressable>
            </View>

            <View style={styles.savedLocationsList}>
              {[
                { name: 'Pune, Maharashtra', sub: 'Current Location', temp: '28°C', icon: '⛅' },
                { name: 'Mumbai, Maharashtra', sub: '180 km away', temp: '29°C', icon: '🌧️' },
                { name: 'Nagpur, Maharashtra', sub: '520 km away', temp: '32°C', icon: '☀️' },
                { name: 'Delhi, India', sub: '1200 km away', temp: '34°C', icon: '☀️' }
              ].map((loc, idx) => (
                <Pressable
                  key={loc.name}
                  onPress={() => onNavigate('saved-locations')}
                  style={[
                    styles.savedLocRow,
                    { borderBottomColor: c.borderLight },
                    idx === 3 && { borderBottomWidth: 0 }
                  ]}
                >
                  <Text style={[styles.savedPinIcon, { color: c.blue }]}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.savedLocName, { color: c.ink }]}>{loc.name}</Text>
                    <Text style={[styles.savedLocSub, { color: c.muted }]}>{loc.sub}</Text>
                  </View>
                  <Text style={[styles.savedLocTemp, { color: c.ink }]}>{loc.temp}</Text>
                  <Text style={styles.savedLocIcon}>{loc.icon}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* "Did you know?" Green Ecological Tip Card */}
      <View style={[styles.tipBanner, { backgroundColor: isDark ? '#143828' : '#ECFDF5', borderColor: isDark ? '#1C543D' : '#A7F3D0' }]}>
        <Text style={styles.tipLeafIcon}>🍃</Text>
        <View style={styles.tipCopy}>
          <Text style={[styles.tipTitle, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
            Did you know?
          </Text>
          <Text style={[styles.tipText, { color: isDark ? '#D1FAE5' : '#047857' }]}>
            Trees can reduce the surrounding air temperature by up to 5°C. Plant more trees and stay cool! 🌳
          </Text>
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
  searchSection: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 6,
    height: 46
  },
  searchInput: {
    flex: 1,
    fontSize: 13
  },
  searchIconBtn: {
    padding: 6
  },
  searchIconText: {
    fontSize: 16
  },
  searchSendBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4
  },
  searchSendIcon: {
    fontSize: 14
  },
  chipsScroll: {
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600'
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
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 14
  },
  heroHeader: {
    gap: 2
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroPin: {
    fontSize: 14
  },
  heroLocationText: {
    fontSize: 15,
    fontWeight: '800'
  },
  heroTimeText: {
    fontSize: 10,
    fontWeight: '600'
  },
  heroCenterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroBigTemp: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.5
  },
  heroDegree: {
    fontSize: 22,
    fontWeight: '600'
  },
  heroFeelsLike: {
    fontSize: 11,
    marginTop: 2
  },
  heroCondition: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2
  },
  heroWeatherGraphic: {
    width: 80,
    height: 70,
    position: 'relative'
  },
  sunCircle: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F59E0B'
  },
  cloudShape1: {
    position: 'absolute',
    bottom: 6,
    left: 2,
    width: 60,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF'
  },
  cloudShape2: {
    position: 'absolute',
    bottom: 12,
    left: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF'
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6
  },
  heroMetricPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  heroMetricIcon: {
    fontSize: 14
  },
  heroMetricLabel: {
    fontSize: 8,
    fontWeight: '700'
  },
  heroMetricVal: {
    fontSize: 11,
    fontWeight: '800'
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
  hourlyScroll: {
    gap: 8,
    paddingVertical: 2
  },
  hourCard: {
    width: 66,
    height: 105,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10
  },
  hourTime: {
    fontSize: 10,
    fontWeight: '700'
  },
  hourIcon: {
    fontSize: 18
  },
  hourTemp: {
    fontSize: 13,
    fontWeight: '800'
  },
  hourChance: {
    fontSize: 9,
    color: '#3B82F6',
    fontWeight: '700'
  },
  conversationsList: {
    gap: 2
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    gap: 8
  },
  convIcon: {
    fontSize: 14
  },
  convTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1
  },
  convTime: {
    fontSize: 10
  },
  alertsList: {
    gap: 8
  },
  featuredAlert: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  alertWarningIcon: {
    fontSize: 20
  },
  featuredAlertTitle: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800'
  },
  alertLocationText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  alertDateText: {
    fontSize: 9
  },
  alertDetailText: {
    fontSize: 11,
    lineHeight: 15
  },
  viewDetailsButton: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start'
  },
  viewDetailsButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  smallAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8
  },
  alertWarningIconSmall: {
    fontSize: 16
  },
  smallAlertTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  smallAlertSub: {
    fontSize: 10
  },
  smallAlertTime: {
    fontSize: 9
  },
  chevronArrow: {
    fontSize: 16
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  quickCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  quickCardIcon: {
    fontSize: 22
  },
  quickCardLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  savedLocationsList: {
    gap: 2
  },
  savedLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8
  },
  savedPinIcon: {
    fontSize: 14
  },
  savedLocName: {
    fontSize: 12,
    fontWeight: '700'
  },
  savedLocSub: {
    fontSize: 9
  },
  savedLocTemp: {
    fontSize: 13,
    fontWeight: '800'
  },
  savedLocIcon: {
    fontSize: 14
  },
  tipBanner: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  tipLeafIcon: {
    fontSize: 24
  },
  tipCopy: {
    flex: 1
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  tipText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2
  }
});
