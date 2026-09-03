import React from 'react'
import { Pressable, View, StyleSheet, Animated } from 'react-native'

export function Switch ({ checked, onChange, disabled = false }) {
  return (
    <Pressable
      onPress={() => !disabled && onChange && onChange(!checked)}
      style={[
        styles.track,
        checked ? styles.trackActive : styles.trackInactive,
        disabled && styles.trackDisabled
      ]}
      accessibilityRole='switch'
      accessibilityState={{ checked, disabled }}
    >
      <View
        style={[
          styles.thumb,
          checked ? styles.thumbActive : styles.thumbInactive
        ]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: {
    width: 42,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  },
  trackActive: {
    backgroundColor: '#2563EB'
  },
  trackInactive: {
    backgroundColor: '#CBD5E1'
  },
  trackDisabled: {
    opacity: 0.5
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2
  },
  thumbActive: {
    alignSelf: 'flex-end'
  },
  thumbInactive: {
    alignSelf: 'flex-start'
  }
})
