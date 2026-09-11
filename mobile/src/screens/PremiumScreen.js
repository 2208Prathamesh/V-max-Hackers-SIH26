import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native'
import {
  Crown,
  Radio,
  Zap,
  Calendar,
  BookmarkCheck,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react-native'
import { getColors } from '../theme/colors'

const PRO_FEATURES = [
  {
    icon: Radio,
    color: '#3B82F6',
    title: 'High-Resolution Satellite & Radar',
    desc: 'Live MOSDAC/ISRO Doppler loops and high-resolution cloud cover layers.'
  },
  {
    icon: Zap,
    color: '#F59E0B',
    title: 'Instant Severe Weather Push',
    desc: 'Direct IMD red/orange alert dispatch via SMS and push notifications.'
  },
  {
    icon: Calendar,
    color: '#10B981',
    title: '14-Day Extended Forecasting',
    desc: 'Deep multi-model consensus (ECMWF, GFS, Open-Meteo) up to 2 weeks out.'
  },
  {
    icon: BookmarkCheck,
    color: '#8B5CF6',
    title: 'Unlimited Saved Locations',
    desc: 'Track farm plots, hometowns, and travel destinations without limits.'
  },
  {
    icon: Sparkles,
    color: '#EC4899',
    title: 'Uncapped WeatherGPT AI Queries',
    desc: 'Priority queue on our low-latency meteorological reasoning engine.'
  },
  {
    icon: ShieldCheck,
    color: '#06B6D4',
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
      onNotification('Welcome to WeatherGPT Pro! Premium unlocked.')
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
            backgroundColor: isDark ? '#1C1710' : '#FFFDF5',
            borderColor: isDark ? '#4E3820' : '#FDE68A'
          }
        ]}
      >
        <View style={styles.crownCircle}>
          <Crown size={24} color="#FFFFFF" strokeWidth={2.4} />
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
          Empower your operations with mission-critical meteorological intelligence and sub-hourly Doppler feeds.
        </Text>

        {/* Billing Switcher */}
        <View
          style={[
            styles.switcherTrack,
            { backgroundColor: isDark ? '#2D2318' : '#FEF3C7' }
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
          Included in Pro Membership
        </Text>

        <View style={styles.featuresList}>
          {PRO_FEATURES.map((item, idx) => {
            const IconComp = item.icon
            return (
              <View key={idx} style={styles.featureRow}>
                <View style={[styles.featureIconBox, { backgroundColor: isDark ? '#1F2430' : '#EFF6FF' }]}>
                  <IconComp size={18} color={item.color} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: c.ink }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.featureDesc, { color: c.muted }]}>
                    {item.desc}
                  </Text>
                </View>
              </View>
            )
          })}
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
        
        <View style={styles.guaranteeRow}>
          <Check size={14} color="#10B981" strokeWidth={2.5} />
          <Text style={[styles.guaranteeText, { color: c.muted }]}>
            7-day free trial • Cancel anytime • 100% money-back guarantee
          </Text>
        </View>

        <Pressable
          onPress={handleUpgrade}
          style={[
            styles.ctaButton,
            isSubscribed && { backgroundColor: '#10B981' }
          ]}
        >
          {isSubscribed ? (
            <Check size={18} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
          ) : (
            <Zap size={18} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
          )}
          <Text style={styles.ctaButtonText}>
            {isSubscribed
              ? 'Pro Plan Active'
              : 'Start 7-Day Free Trial'}
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
    alignItems: 'center'
  },
  crownCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  heroTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  heroSubtitle: {
    fontSize: 11.5,
    lineHeight: 17,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11
  },
  switchBtnActive: {
    backgroundColor: '#D97706',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2
  },
  switchText: { fontSize: 11, fontWeight: '700' },
  switchTextActive: { color: '#FFFFFF', fontWeight: '800' },
  saveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6
  },
  saveBadgeText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '900' },
  featuresCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', marginBottom: 12 },
  featuresList: { gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureTitle: { fontSize: 12, fontWeight: '700' },
  featureDesc: { fontSize: 10, lineHeight: 15, marginTop: 1 },
  ctaCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center'
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceNumber: { fontSize: 26, fontWeight: '900' },
  pricePeriod: { fontSize: 12 },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 14
  },
  guaranteeText: { fontSize: 10, textAlign: 'center' },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%'
  },
  ctaButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }
})
