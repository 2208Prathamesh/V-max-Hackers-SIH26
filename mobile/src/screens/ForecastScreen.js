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
import { forecastDaysData, hourlyForecastData, allCityDatabase } from '../data/mockData';

const DETAIL_TABS = ['Temperature', 'Precipitation', 'Wind', 'Humidity', 'Pressure'];

export function ForecastScreen({
  isDark = false,
  unit = 'C'
}) {
  const c = getColors(isDark);
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const [activeDetailTab, setActiveDetailTab] = useState('Temperature');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [searchLocation, setSearchLocation] = useState('');
  const [currentCity, setCurrentCity] = useState(allCityDatabase[0]);

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
      {/* Top Location Bar */}
      <View style={[styles.topLocationBar, { backgroundColor: c.card, borderColor: c.border }]}>
        <View>
          <View style={styles.locationTitleRow}>
            <Text style={[styles.locationPin, { color: c.blue }]}>📍</Text>
            <Text style={[styles.locationTitle, { color: c.ink }]}>
              {currentCity.city}, {currentCity.region}
            </Text>
            <Text style={[styles.chevronText, { color: c.muted }]}>▾</Text>
          </View>
          <Text style={[styles.latLongText, { color: c.muted }]}>
            Lat 18.52° N, Long 73.86° E
          </Text>
        </View>

        <Pressable style={[styles.changeLocBtn, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
          <Text style={[styles.changeLocText, { color: c.blue }]}>Change Location</Text>
        </Pressable>
      </View>

      {/* Main Grid: Left column + Right column */}
      <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
        {/* Left Column on wide screen */}
        <View style={[styles.col, isWide && styles.colLeft]}>
          {/* Today Overview Hero Card matching Screenshot 2 */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.todayDateText, { color: c.muted }]}>Today • 21 May 2025</Text>
            <View style={styles.todayHeroRow}>
              {/* Left Temp + Icon */}
              <View style={styles.todayLeft}>
                <View style={styles.heroWeatherGraphic}>
                  <View style={styles.sunCircle} />
                  <View style={styles.cloudShape1} />
                </View>
                <View>
                  <Text style={[styles.todayTempNumber, { color: c.ink }]}>
                    28<Text style={styles.degreeSymbol}>°C</Text>
                  </Text>
                  <Text style={[styles.todayCondition, { color: c.ink }]}>Partly Cloudy</Text>
                  <Text style={[styles.todayFeels, { color: c.muted }]}>
                    Feels like {formatTemperature(30)}
                  </Text>
                </View>
              </View>

              {/* Right Stats Grid */}
              <View style={styles.todayStatsGrid}>
                <View style={styles.todayStatItem}>
                  <Text style={styles.statIcon}>🌡️</Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>Min</Text>
                  <Text style={[styles.statVal, { color: c.ink }]}>22°C</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={styles.statIcon}>🌡️</Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>Max</Text>
                  <Text style={[styles.statVal, { color: c.ink }]}>31°C</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={styles.statIcon}>💧</Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>Humidity</Text>
                  <Text style={[styles.statVal, { color: c.ink }]}>72%</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={styles.statIcon}>💨</Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>Wind</Text>
                  <Text style={[styles.statVal, { color: c.ink }]}>16 km/h SW</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={styles.statIcon}>⏲️</Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>Pressure</Text>
                  <Text style={[styles.statVal, { color: c.ink }]}>1008 hPa</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={styles.statIcon}>👁️</Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>Visibility</Text>
                  <Text style={[styles.statVal, { color: c.ink }]}>8 km</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 7-Day Forecast Cards */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>7-Day Forecast</Text>
              <Text style={[styles.cardAction, { color: c.blue }]}>View full 7-day forecast ›</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daysScroll}
            >
              {forecastDaysData.map((day, idx) => {
                const isSelected = selectedDayIdx === idx;
                return (
                  <Pressable
                    key={day.date}
                    onPress={() => setSelectedDayIdx(idx)}
                    style={[
                      styles.dayCard,
                      { backgroundColor: c.cardAlt, borderColor: c.border },
                      isSelected && { borderColor: c.blue, backgroundColor: isDark ? '#1E3A6D' : '#EFF6FF' }
                    ]}
                  >
                    <Text style={[styles.dayCardName, { color: isSelected ? c.blue : c.ink }]}>
                      {day.day}
                    </Text>
                    <Text style={[styles.dayCardDate, { color: c.muted }]}>{day.date}</Text>
                    <Text style={styles.dayCardIcon}>{day.icon}</Text>
                    <Text style={[styles.dayCardHigh, { color: c.ink }]}>
                      {formatTemperature(day.high)}
                    </Text>
                    <Text style={[styles.dayCardLow, { color: c.muted }]}>
                      {formatTemperature(day.low)}
                    </Text>
                    <View style={[styles.rainPill, { backgroundColor: isDark ? '#1C335A' : '#E0F2FE' }]}>
                      <Text style={[styles.rainPillText, { color: c.blue }]}>💧 {day.rainChance}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Hourly Forecast */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Hourly Forecast</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyScroll}
            >
              {hourlyForecastData.map((hour, idx) => (
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
                  <Text style={[styles.hourTemp, { color: c.ink }]}>
                    {formatTemperature(hour.temp)}
                  </Text>
                  <Text style={styles.hourChance}>💧 {hour.chance}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Detailed Forecast Section with Line Curve & Summary matching Screenshot 2 */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Detailed Forecast</Text>

            {/* Metric tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.detailTabsScroll}
            >
              {DETAIL_TABS.map(tab => {
                const isActive = activeDetailTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveDetailTab(tab)}
                    style={[
                      styles.detailTabItem,
                      isActive && { borderBottomColor: c.blue, borderBottomWidth: 2 }
                    ]}
                  >
                    <Text
                      style={[
                        styles.detailTabText,
                        { color: isActive ? c.blue : c.muted },
                        isActive && styles.detailTabTextActive
                      ]}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={[styles.chartSummaryRow, isWide && styles.chartSummaryRowWide]}>
              {/* Temperature Graph Simulation */}
              <View style={[styles.chartContainer, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
                <View style={styles.chartPointsRow}>
                  {[
                    { time: '6 AM', temp: '23°', height: 40 },
                    { time: '9 AM', temp: '26°', height: 60 },
                    { time: '12 PM', temp: '28°', height: 75 },
                    { time: '3 PM', temp: '31°', height: 95, highest: true },
                    { time: '6 PM', temp: '29°', height: 80 },
                    { time: '9 PM', temp: '25°', height: 50 }
                  ].map(pt => (
                    <View key={pt.time} style={styles.chartBarCol}>
                      <Text style={[styles.chartTempLabel, { color: pt.highest ? c.blue : c.ink }]}>
                        {pt.temp}
                      </Text>
                      <View
                        style={[
                          styles.chartBar,
                          { height: pt.height },
                          pt.highest ? { backgroundColor: c.blue } : { backgroundColor: '#60A5FA' }
                        ]}
                      />
                      <Text style={[styles.chartTimeLabel, { color: c.muted }]}>{pt.time}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Summary Panel */}
              <View style={[styles.detailSummaryPanel, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
                <Text style={[styles.summaryTitle, { color: c.ink }]}>Summary</Text>
                <Text style={[styles.summaryDescription, { color: c.muted }]}>
                  Warm with partly cloudy skies. Light winds throughout the day.
                </Text>
                <View style={styles.summaryStatsList}>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatIcon}>🌡️</Text>
                    <View>
                      <Text style={[styles.summaryStatName, { color: c.ink }]}>Max Temperature</Text>
                      <Text style={[styles.summaryStatValue, { color: c.muted }]}>31°C at 3:00 PM</Text>
                    </View>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatIcon}>🌡️</Text>
                    <View>
                      <Text style={[styles.summaryStatName, { color: c.ink }]}>Min Temperature</Text>
                      <Text style={[styles.summaryStatValue, { color: c.muted }]}>22°C at 6:00 AM</Text>
                    </View>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatIcon}>💧</Text>
                    <View>
                      <Text style={[styles.summaryStatName, { color: c.ink }]}>Rainfall</Text>
                      <Text style={[styles.summaryStatValue, { color: c.muted }]}>2.4 mm</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Plan Your Day Better Promo Banner */}
          <View style={[styles.planBanner, { backgroundColor: isDark ? '#1C2E4A' : '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={styles.planIcon}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planTitle, { color: c.ink }]}>Plan Your Day Better</Text>
              <Text style={[styles.planSubtitle, { color: c.muted }]}>
                Get detailed 7-day forecasts, hourly updates and severe weather alerts with WeatherGPT Premium.
              </Text>
            </View>
            <Pressable style={[styles.upgradeBtn, { backgroundColor: c.card, borderColor: '#F59E0B' }]}>
              <Text style={styles.upgradeBtnText}>👑 Upgrade to Premium</Text>
            </Pressable>
          </View>
        </View>

        {/* Right Column on wide screen */}
        <View style={[styles.col, isWide && styles.colRight]}>
          {/* Select Location Search Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Select Location</Text>
            <TextInput
              value={searchLocation}
              onChangeText={setSearchLocation}
              placeholder="Search location..."
              placeholderTextColor={c.muted}
              style={[styles.locSearchInput, { backgroundColor: c.cardAlt, borderColor: c.border, color: c.ink }]}
            />
            <View style={styles.quickLocList}>
              {[
                { name: 'Pune, Maharashtra', star: true },
                { name: 'Mumbai, Maharashtra', star: false },
                { name: 'Nagpur, Maharashtra', star: false },
                { name: 'New Delhi, Delhi', star: false }
              ].map(loc => (
                <Pressable
                  key={loc.name}
                  style={[styles.quickLocItem, { borderBottomColor: c.borderLight }]}
                >
                  <Text style={[styles.quickPin, { color: c.blue }]}>📍</Text>
                  <Text style={[styles.quickName, { color: c.ink }]}>{loc.name}</Text>
                  <Text style={[styles.quickStar, { color: loc.star ? '#F59E0B' : c.mutedLight }]}>
                    {loc.star ? '★' : '☆'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.viewAllLocations, { color: c.blue }]}>View all locations</Text>
          </View>

          {/* Precipitation Summary Card with Bar Chart matching Screenshot 2 */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Precipitation Summary</Text>
            <Text style={[styles.precipSub, { color: c.muted }]}>Next 7 Days</Text>
            <Text style={[styles.precipTotal, { color: c.ink }]}>28.6 <Text style={styles.precipUnit}>mm</Text></Text>
            <Text style={[styles.precipSub, { color: c.muted, marginBottom: 12 }]}>Total Rainfall</Text>

            {/* 7-Day Bar Chart */}
            <View style={styles.precipBarChart}>
              {[
                { day: 'Wed', mm: '2.4', h: 25 },
                { day: 'Thu', mm: '8.6', h: 55 },
                { day: 'Fri', mm: '10.2', h: 68 },
                { day: 'Sat', mm: '12.4', h: 85, peak: true },
                { day: 'Sun', mm: '1.8', h: 20 },
                { day: 'Mon', mm: '0.8', h: 12 },
                { day: 'Tue', mm: '0.6', h: 10 }
              ].map(bar => (
                <View key={bar.day} style={styles.precipBarCol}>
                  <Text style={[styles.precipValText, { color: c.muted }]}>{bar.mm}</Text>
                  <View
                    style={[
                      styles.precipBarItem,
                      { height: bar.h, backgroundColor: bar.peak ? c.blue : '#60A5FA' }
                    ]}
                  />
                  <Text style={[styles.precipDayText, { color: c.muted }]}>{bar.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* UV Index Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>UV Index</Text>
            <Text style={[styles.precipSub, { color: c.muted }]}>Today</Text>
            <View style={styles.uvRow}>
              <Text style={[styles.uvNumber, { color: c.ink }]}>7</Text>
              <Text style={[styles.uvLevel, { color: '#F97316' }]}>High</Text>
            </View>
            {/* Color spectrum bar */}
            <View style={styles.uvSpectrumBar}>
              <View style={[styles.uvSegment, { backgroundColor: '#22C55E' }]} />
              <View style={[styles.uvSegment, { backgroundColor: '#EAB308' }]} />
              <View style={[styles.uvSegment, { backgroundColor: '#F97316' }]} />
              <View style={[styles.uvSegment, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.uvSegment, { backgroundColor: '#8B5CF6' }]} />
            </View>
            <Text style={[styles.uvAdvice, { color: c.muted }]}>
              🕶️ Wear sunglasses and use sun protection.
            </Text>
          </View>

          {/* Air Quality Index Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Air Quality Index</Text>
            <Text style={[styles.precipSub, { color: c.muted }]}>Today</Text>
            <View style={styles.aqiRow}>
              <View style={styles.aqiBadge}>
                <Text style={styles.aqiNumber}>42</Text>
              </View>
              <Text style={[styles.aqiStatus, { color: '#10B981' }]}>Good</Text>
            </View>
            <Text style={[styles.aqiAdvice, { color: c.muted }]}>
              🍃 Air quality is satisfactory and poses little or no risk.
            </Text>
          </View>

          {/* Sunrise & Sunset Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Sunrise & Sunset</Text>
            <View style={styles.sunTimesRow}>
              <View style={styles.sunTimeCol}>
                <Text style={styles.sunIcon}>🌅</Text>
                <Text style={[styles.sunLabel, { color: c.muted }]}>Sunrise</Text>
                <Text style={[styles.sunTime, { color: c.ink }]}>5:47 AM</Text>
              </View>
              <View style={styles.sunTimeCol}>
                <Text style={styles.sunIcon}>🌇</Text>
                <Text style={[styles.sunLabel, { color: c.muted }]}>Sunset</Text>
                <Text style={[styles.sunTime, { color: c.ink }]}>6:57 PM</Text>
              </View>
            </View>
          </View>

          {/* Compare Locations Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.ink }]}>Compare Locations</Text>
            <Text style={[styles.precipSub, { color: c.muted }]}>
              Compare weather between different locations.
            </Text>
            <Pressable style={[styles.compareBtn, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
              <Text style={[styles.compareBtnText, { color: c.blue }]}>+ Add Location to Compare</Text>
            </Pressable>
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
  topLocationBar: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  locationPin: {
    fontSize: 16
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  chevronText: {
    fontSize: 12
  },
  latLongText: {
    fontSize: 10,
    marginTop: 2
  },
  changeLocBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1
  },
  changeLocText: {
    fontSize: 11,
    fontWeight: '700'
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
  todayDateText: {
    fontSize: 11,
    fontWeight: '600'
  },
  todayHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  todayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  heroWeatherGraphic: {
    width: 60,
    height: 50,
    position: 'relative'
  },
  sunCircle: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B'
  },
  cloudShape1: {
    position: 'absolute',
    bottom: 4,
    left: 2,
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#38BDF8'
  },
  todayTempNumber: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1
  },
  degreeSymbol: {
    fontSize: 18,
    fontWeight: '600'
  },
  todayCondition: {
    fontSize: 12,
    fontWeight: '700'
  },
  todayFeels: {
    fontSize: 10
  },
  todayStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 170,
    gap: 8
  },
  todayStatItem: {
    width: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statIcon: {
    fontSize: 12
  },
  statLabel: {
    fontSize: 9
  },
  statVal: {
    fontSize: 10,
    fontWeight: '700'
  },
  daysScroll: {
    gap: 8,
    paddingVertical: 2
  },
  dayCard: {
    width: 72,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 3
  },
  dayCardName: {
    fontSize: 11,
    fontWeight: '700'
  },
  dayCardDate: {
    fontSize: 9
  },
  dayCardIcon: {
    fontSize: 18,
    marginVertical: 2
  },
  dayCardHigh: {
    fontSize: 13,
    fontWeight: '800'
  },
  dayCardLow: {
    fontSize: 10
  },
  rainPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2
  },
  rainPillText: {
    fontSize: 8,
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
  detailTabsScroll: {
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    paddingBottom: 4
  },
  detailTabItem: {
    paddingVertical: 6,
    paddingHorizontal: 4
  },
  detailTabText: {
    fontSize: 11,
    fontWeight: '600'
  },
  detailTabTextActive: {
    fontWeight: '800'
  },
  chartSummaryRow: {
    gap: 10,
    marginTop: 6
  },
  chartSummaryRowWide: {
    flexDirection: 'row'
  },
  chartContainer: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'flex-end',
    minHeight: 160
  },
  chartPointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130
  },
  chartBarCol: {
    alignItems: 'center',
    gap: 4
  },
  chartTempLabel: {
    fontSize: 10,
    fontWeight: '800'
  },
  chartBar: {
    width: 14,
    borderRadius: 7
  },
  chartTimeLabel: {
    fontSize: 9
  },
  detailSummaryPanel: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  summaryDescription: {
    fontSize: 10,
    lineHeight: 14
  },
  summaryStatsList: {
    gap: 8,
    marginTop: 4
  },
  summaryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  summaryStatIcon: {
    fontSize: 14
  },
  summaryStatName: {
    fontSize: 10,
    fontWeight: '700'
  },
  summaryStatValue: {
    fontSize: 9
  },
  planBanner: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  planIcon: {
    fontSize: 22
  },
  planTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  planSubtitle: {
    fontSize: 10,
    marginTop: 2
  },
  upgradeBtn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12
  },
  upgradeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706'
  },
  locSearchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 38,
    fontSize: 12
  },
  quickLocList: {
    gap: 2
  },
  quickLocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 6
  },
  quickPin: {
    fontSize: 12
  },
  quickName: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1
  },
  quickStar: {
    fontSize: 14
  },
  viewAllLocations: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 4
  },
  precipSub: {
    fontSize: 10
  },
  precipTotal: {
    fontSize: 26,
    fontWeight: '900'
  },
  precipUnit: {
    fontSize: 14,
    fontWeight: '600'
  },
  precipBarChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
    paddingTop: 6
  },
  precipBarCol: {
    alignItems: 'center',
    gap: 4
  },
  precipValText: {
    fontSize: 8,
    fontWeight: '700'
  },
  precipBarItem: {
    width: 12,
    borderRadius: 6
  },
  precipDayText: {
    fontSize: 9
  },
  uvRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6
  },
  uvNumber: {
    fontSize: 28,
    fontWeight: '900'
  },
  uvLevel: {
    fontSize: 13,
    fontWeight: '800'
  },
  uvSpectrumBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
    marginVertical: 4
  },
  uvSegment: {
    flex: 1
  },
  uvAdvice: {
    fontSize: 10,
    marginTop: 2
  },
  aqiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  aqiBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  aqiNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981'
  },
  aqiStatus: {
    fontSize: 14,
    fontWeight: '800'
  },
  aqiAdvice: {
    fontSize: 10,
    marginTop: 4
  },
  sunTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6
  },
  sunTimeCol: {
    alignItems: 'center',
    gap: 2
  },
  sunIcon: {
    fontSize: 20
  },
  sunLabel: {
    fontSize: 10
  },
  sunTime: {
    fontSize: 12,
    fontWeight: '800'
  },
  compareBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  compareBtnText: {
    fontSize: 11,
    fontWeight: '700'
  }
});
