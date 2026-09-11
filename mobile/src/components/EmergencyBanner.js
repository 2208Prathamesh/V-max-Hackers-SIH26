import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from 'react-native'
import {
  AlertTriangle,
  Radio,
  ChevronRight,
  X,
  Volume2,
  ShieldAlert
} from 'lucide-react-native'
import { getColors } from '../theme/colors'

export function EmergencyBanner ({
  alert,
  onPress,
  onDismiss,
  isDark = false
}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  if (!alert) return null

  const c = getColors(isDark)
  const severity = (alert.severity || 'severe').toLowerCase()
  const isSevere = severity.includes('severe') || severity.includes('red') || severity.includes('extreme')

  const bannerColor = isSevere ? c.statusDanger : c.statusWarning
  const bannerBg = isSevere
    ? isDark
      ? 'rgba(239, 68, 68, 0.14)'
      : '#FEE2E2'
    : isDark
    ? 'rgba(245, 158, 11, 0.14)'
    : '#FEF3C7'

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: bannerBg,
          borderColor: bannerColor
        }
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: `${bannerColor}25` }
            ]}
          >
            {isSevere ? (
              <ShieldAlert size={18} color={bannerColor} strokeWidth={2.2} />
            ) : (
              <AlertTriangle size={18} color={bannerColor} strokeWidth={2.2} />
            )}
          </View>
          <View style={styles.badgeWrap}>
            <View style={[styles.pulseDot, { backgroundColor: bannerColor }]} />
            <Text style={[styles.badgeText, { color: bannerColor }]}>
              {alert.agency || 'IMD OFFICIAL'} • CAP v1.2
            </Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          <Pressable
            onPress={() => setIsSpeaking(!isSpeaking)}
            style={[styles.audioBtn, { borderColor: `${bannerColor}40` }]}
            accessibilityLabel='Audio bulletin'
          >
            <Volume2 size={15} color={bannerColor} />
            {isSpeaking && (
              <View style={styles.audioWaves}>
                <View style={[styles.waveBar, { backgroundColor: bannerColor }]} />
                <View style={[styles.waveBar, { backgroundColor: bannerColor, height: 12 }]} />
                <View style={[styles.waveBar, { backgroundColor: bannerColor, height: 8 }]} />
              </View>
            )}
          </Pressable>

          {onDismiss && (
            <Pressable
              onPress={onDismiss}
              style={styles.closeBtn}
              accessibilityLabel='Dismiss alert'
            >
              <X size={16} color={c.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <Pressable
        onPress={() => onPress && onPress(alert)}
        style={styles.contentWrap}
      >
        <Text style={[styles.title, { color: c.ink }]} numberOfLines={1}>
          {alert.title || 'Severe Weather Warning In Effect'}
        </Text>
        <Text style={[styles.desc, { color: c.inkSecondary }]} numberOfLines={2}>
          {alert.description || alert.message || 'Take immediate precautionary measures. Follow local disaster authority directives.'}
        </Text>

        <View style={styles.actionRow}>
          <Text style={[styles.viewDetailsText, { color: bannerColor }]}>
            View Precautionary SOP Guidelines
          </Text>
          <ChevronRight size={15} color={bannerColor} />
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  audioWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 12
  },
  waveBar: {
    width: 2,
    height: 6,
    borderRadius: 1
  },
  closeBtn: {
    padding: 4
  },
  contentWrap: {
    marginTop: 2
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700'
  }
})

export default EmergencyBanner
