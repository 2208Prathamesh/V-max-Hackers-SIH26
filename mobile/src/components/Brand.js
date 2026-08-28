import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function Brand ({ isDark = false, compact = false, textColor }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <View style={[styles.sunDot, compact && styles.sunDotCompact]} />
        <View
          style={[styles.cloudShape, compact && styles.cloudShapeCompact]}
        />
      </View>
      <Text
        style={[
          styles.brandName,
          compact && styles.brandNameCompact,
          textColor
            ? { color: textColor }
            : isDark
            ? styles.brandNameDark
            : styles.brandNameBlue
        ]}
      >
        WeatherGPT
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  mark: {
    width: 38,
    height: 32,
    justifyContent: 'center',
    position: 'relative'
  },
  markCompact: {
    width: 30,
    height: 26
  },
  sunDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B',
    top: 0,
    right: 2,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  sunDotCompact: {
    width: 14,
    height: 14,
    borderRadius: 7,
    right: 1
  },
  cloudShape: {
    width: 28,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#38BDF8',
    bottom: 2,
    left: 2,
    shadowColor: '#0284C7',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cloudShapeCompact: {
    width: 22,
    height: 13,
    borderRadius: 7,
    bottom: 1,
    left: 1
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  brandNameCompact: {
    fontSize: 17
  },
  brandNameBlue: {
    color: '#2563EB'
  },
  brandNameDark: {
    color: '#60A5FA'
  }
})
