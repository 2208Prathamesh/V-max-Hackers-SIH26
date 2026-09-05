import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native'
import { getColors } from '../theme/colors'

const PRO_FEATURES = [
  {
    icon: '🛰️',
    title: 'High-Resolution Satellite & Radar',
    desc: 'Live MOSDAC/ISRO Doppler loops and high-resolution cloud cover layers.'
  },
  {
    icon: '⚡',
    title: 'Instant Severe Weather Push',
    desc: 'Direct IMD red/orange alert dispatch via SMS and push notifications.'
  },
  {
    icon: '📅',
    title: '14-Day Extended Forecasting',
    desc: 'Deep multi-model consensus (ECMWF, GFS, Open-Meteo) up to 2 weeks out.'
  },
  {
    icon: '⭐',
    title: 'Unlimited Saved Locations',
    desc: 'Track farm plots, hometowns, and travel destinations without limits.'
  },
  {
    icon: '💬',
    title: 'Uncapped WeatherGPT AI Queries',
    desc: 'Priority queue on our low-latency meteorological reasoning engine.'
  },
  {
    icon: '🚫',
    title: '100% Ad-Free Clean UI',
    desc: 'Zero sponsored bulletins or banners across web and mobile.'
  }
]

export function PremiumScreen ({
  isDark = false,
  onNavigate,
  onNotification
}) {
  const c = getColors(isDark)
  const [billingCycle, setBillingCycle] = useState('yearly') // 'monthly' | 'yearly'
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleUpgrade = () => {
    setIsSubscribed(true)
    if (onNotification) {
      onNotification('🎉 Welcome to WeatherGPT Pro! Premium unlocked.')
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Glowing Pro Hero */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isDark ? '#261C14' : '#FFF9EB',
            borderColor: isDark ? '#4E3820' : '#FCE8BD'
          }
        ]}
      >
        <View style={styles.crownCircle}>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>

        <Text
          style={[
            styles.heroTitle,
            { color: isDark ? '#FDE68A' : '#92400E' }
          ]}
        >
          WeatherGPT Pro
        </Text>
        <Text
          style={[
            styles.heroSubtitle,
            { color: isDark ? '#E2C799' : '#B45309' }
          ]}
        >
          Empower your day with mission-critical meteorological intelligence.
        </Text>

        {/* Billing Switcher */}
        <View
          style={[
            styles.switcherTrack,
            { backgroundColor: isDark ? '#3D2A1C' : '#FDF4DC' }
          ]}
        >
          <Pressable
            onPress={() => setBillingCycle('monthly')}
            style={[
              styles.switchBtn,
              billingCycle === 'monthly' && styles.switchBtnActive
            ]}
          >
            <Text
              style={[
                styles.switchText,
                billingCycle === 'monthly'
                  ? styles.switchTextActive
                  : { color: isDark ? '#D1B48C' : '#8C6830' }
              ]}
            >
              Monthly (₹199/mo)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setBillingCycle('yearly')}
            style={[
              styles.switchBtn,
              billingCycle === 'yearly' && styles.switchBtnActive
            ]}
          >
            <Text
              style={[
                styles.switchText,
                billingCycle === 'yearly'
                  ? styles.switchTextActive
                  : { color: isDark ? '#D1B48C' : '#8C6830' }
              ]}
            >
              Yearly (₹1,499/yr)
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 37%</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Feature List Section */}
      <View
        style={[
          styles.featuresCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <Text style={[styles.sectionTitle, { color: c.ink }]}>
          Everything included in Pro
        </Text>

        <View style={styles.featuresList}>
          {PRO_FEATURES.map((item, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: c.ink }]}>
                  {item.title}
                </Text>
                <Text style={[styles.featureDesc, { color: c.muted }]}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Pricing CTA Box */}
      <View
        style={[
          styles.ctaCard,
          { backgroundColor: c.card, borderColor: c.border }
        ]}
      >
        <View style={styles.priceRow}>
          <Text style={[styles.priceNumber, { color: c.ink }]}>
            {billingCycle === 'yearly' ? '₹1,499' : '₹199'}
          </Text>
          <Text style={[styles.pricePeriod, { color: c.muted }]}>
            /{billingCycle === 'yearly' ? 'year (₹125/mo)' : 'month'}
          </Text>
        </View>
        <Text style={[styles.guaranteeText, { color: c.muted }]}>
          ✓ 7-day free trial • Cancel anytime • Money-back guarantee
        </Text>

        <Pressable
          onPress={handleUpgrade}
          style={[
            styles.ctaButton,
            isSubscribed && { backgroundColor: '#10B981' }
          ]}
        >
          <Text style={styles.ctaButtonText}>
            {isSubscribed
              ? '✓ Pro Plan Active'
              : '⚡ Start 7-Day Free Trial'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 14, paddingBottom: 32, gap: 14 },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center'
  },
  crownCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  crownEmoji: { fontSize: 24 },
  heroTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  heroSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 12
  },
  switcherTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 4
  },
  switchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  switchBtnActive: {
    backgroundColor: '#F59E0B'
  },
  switchText: { fontSize: 10.5, fontWeight: '700' },
  switchTextActive: { color: '#FFFFFF', fontWeight: '800' },
  saveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 6
  },
  saveBadgeText: { color: '#FFFFFF', fontSize: 7.5, fontWeight: '900' },
  featuresCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', marginBottom: 12 },
  featuresList: { gap: 12 },
  featureRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  featureIcon: { fontSize: 20 },
  featureTitle: { fontSize: 11.5, fontWeight: '800' },
  featureDesc: { fontSize: 10, lineHeight: 14, marginTop: 1 },
  ctaCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center'
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceNumber: { fontSize: 28, fontWeight: '900' },
  pricePeriod: { fontSize: 11, fontWeight: '600' },
  guaranteeText: { fontSize: 9.5, marginTop: 4, marginBottom: 14 },
  ctaButton: {
    width: '100%',
    backgroundColor: '#F59E0B',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' }
})
