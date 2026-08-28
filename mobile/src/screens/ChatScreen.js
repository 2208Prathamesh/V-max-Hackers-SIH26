import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { getColors } from '../theme/colors'

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    sender: 'user',
    time: '10:21 AM',
    text: 'Will it rain tomorrow in Pune?'
  },
  {
    id: 'm2',
    sender: 'bot',
    time: '10:22 AM',
    text: 'Yes, there is a high probability (80%) of rain tomorrow in Pune, especially during the afternoon and evening hours.',
    hasForecast: true
  }
]

export function ChatScreen ({ isDark = false, unit = 'C' }) {
  const c = getColors(isDark)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')

  const sendMessage = textToSend => {
    const text = (textToSend || draft).trim()
    if (!text) return

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: 'Now',
      text
    }

    setMessages(prev => [...prev, userMsg])
    setDraft('')

    // Simulate AI response
    setTimeout(() => {
      let botReply = `Based on high-resolution radar analysis for ${
        text.includes('Delhi')
          ? 'Delhi'
          : text.includes('Mumbai')
          ? 'Mumbai'
          : 'Pune'
      }, expect moderate convective cloud formations with temperatures around 28°C and mild wind gusts.`
      if (text.toLowerCase().includes('rain')) {
        botReply =
          'Precipitation radar indicates scattered showers with 75% coverage. Keep an umbrella handy between 1:00 PM and 6:00 PM.'
      } else if (
        text.toLowerCase().includes('aqi') ||
        text.toLowerCase().includes('air')
      ) {
        botReply =
          'Current Air Quality Index (AQI) is at 48 (Good condition) with PM2.5 within permissible standards.'
      }

      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          time: 'Now',
          text: botReply,
          hasForecast: text.toLowerCase().includes('rain')
        }
      ])
    }, 700)
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Subheader online badge */}
      <View
        style={[
          styles.subHeader,
          { backgroundColor: c.card, borderBottomColor: c.border }
        ]}
      >
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={[styles.onlineText, { color: c.inkSecondary }]}>
            WeatherGPT AI Online • Ready to help
          </Text>
        </View>
      </View>

      {/* Messages Scroll View */}
      <ScrollView
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.todayPill,
            { backgroundColor: c.card, borderColor: c.border }
          ]}
        >
          <Text style={[styles.todayText, { color: c.muted }]}>Today</Text>
        </View>

        {messages.map(msg => {
          if (msg.sender === 'user') {
            return (
              <View key={msg.id} style={styles.userBubbleWrapper}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{msg.text}</Text>
                  <Text style={styles.userTime}>{msg.time} ✓✓</Text>
                </View>
              </View>
            )
          }

          return (
            <View key={msg.id} style={styles.botRow}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarIcon}>✦</Text>
              </View>
              <View
                style={[
                  styles.botBubble,
                  { backgroundColor: c.card, borderColor: c.border }
                ]}
              >
                <Text style={[styles.botText, { color: c.ink }]}>
                  {msg.text}
                </Text>

                {msg.hasForecast && (
                  <View
                    style={[
                      styles.forecastBox,
                      { backgroundColor: c.cardAlt, borderColor: c.borderLight }
                    ]}
                  >
                    <View style={styles.rainRow}>
                      <Text style={styles.rainIcon}>🌧️</Text>
                      <View>
                        <Text style={[styles.rainPercent, { color: c.ink }]}>
                          80%
                        </Text>
                        <Text style={[styles.rainSub, { color: c.muted }]}>
                          Chance of rain
                        </Text>
                      </View>
                      <View
                        style={{ marginLeft: 'auto', alignItems: 'flex-end' }}
                      >
                        <Text style={[styles.rainTimeTitle, { color: c.ink }]}>
                          Moderate rain
                        </Text>
                        <Text
                          style={[styles.rainTimeRange, { color: c.muted }]}
                        >
                          2:00 PM - 8:00 PM
                        </Text>
                      </View>
                    </View>
                    <View style={styles.forecastStatsGrid}>
                      <View style={styles.fStat}>
                        <Text style={[styles.fStatLabel, { color: c.muted }]}>
                          MIN TEMP
                        </Text>
                        <Text style={[styles.fStatVal, { color: c.ink }]}>
                          22°C
                        </Text>
                      </View>
                      <View style={styles.fStat}>
                        <Text style={[styles.fStatLabel, { color: c.muted }]}>
                          MAX TEMP
                        </Text>
                        <Text style={[styles.fStatVal, { color: c.ink }]}>
                          29°C
                        </Text>
                      </View>
                      <View style={styles.fStat}>
                        <Text style={[styles.fStatLabel, { color: c.muted }]}>
                          WIND
                        </Text>
                        <Text style={[styles.fStatVal, { color: c.ink }]}>
                          16 km/h SW
                        </Text>
                      </View>
                      <View style={styles.fStat}>
                        <Text style={[styles.fStatLabel, { color: c.muted }]}>
                          HUMIDITY
                        </Text>
                        <Text style={[styles.fStatVal, { color: c.ink }]}>
                          74%
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <Text style={[styles.botTime, { color: c.mutedLight }]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          )
        })}
      </ScrollView>

      {/* Suggested prompts chips */}
      <View
        style={[
          styles.chipsWrapper,
          { backgroundColor: c.card, borderTopColor: c.borderLight }
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {[
            'Will it rain in Pune?',
            'Weekend in Mumbai',
            'AQI in Delhi',
            'Cyclone update'
          ].map(prompt => (
            <Pressable
              key={prompt}
              onPress={() => sendMessage(prompt)}
              style={[
                styles.chip,
                { backgroundColor: c.cardAlt, borderColor: c.border }
              ]}
            >
              <Text style={[styles.chipText, { color: c.blue }]}>{prompt}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Chat Composer */}
      <View
        style={[
          styles.composerWrap,
          { backgroundColor: c.card, borderTopColor: c.border }
        ]}
      >
        <View
          style={[
            styles.composerInputBox,
            { backgroundColor: c.cardAlt, borderColor: c.border }
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => sendMessage()}
            placeholder='Ask anything about weather...'
            placeholderTextColor={c.muted}
            style={[styles.input, { color: c.ink }]}
            returnKeyType='send'
          />
          <Pressable
            onPress={() => sendMessage()}
            style={[styles.sendButton, { backgroundColor: c.blue }]}
            accessibilityLabel='Send message'
          >
            <Text style={styles.sendButtonText}>→</Text>
          </Pressable>
        </View>
        <Text style={[styles.disclaimer, { color: c.mutedLight }]}>
          WeatherGPT can make mistakes. Please verify critical forecasts.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center'
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981'
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600'
  },
  messagesScroll: {
    flex: 1
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
    gap: 14
  },
  todayPill: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6
  },
  todayText: {
    fontSize: 10,
    fontWeight: '700'
  },
  userBubbleWrapper: {
    alignSelf: 'flex-end',
    maxWidth: '82%'
  },
  userBubble: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: 12,
    shadowColor: '#2563EB',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18
  },
  userTime: {
    color: '#BFDBFE',
    fontSize: 9,
    textAlign: 'right',
    marginTop: 4
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '88%'
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  botAvatarIcon: {
    color: '#FFFFFF',
    fontSize: 16
  },
  botBubble: {
    flex: 1,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  botText: {
    fontSize: 13,
    lineHeight: 19
  },
  forecastBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 8
  },
  rainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rainIcon: {
    fontSize: 20
  },
  rainPercent: {
    fontSize: 16,
    fontWeight: '800'
  },
  rainSub: {
    fontSize: 9
  },
  rainTimeTitle: {
    fontSize: 11,
    fontWeight: '700'
  },
  rainTimeRange: {
    fontSize: 9
  },
  forecastStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)'
  },
  fStat: {
    alignItems: 'center'
  },
  fStatLabel: {
    fontSize: 7,
    fontWeight: '800'
  },
  fStatVal: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2
  },
  botTime: {
    fontSize: 9,
    alignSelf: 'flex-end'
  },
  chipsWrapper: {
    paddingVertical: 8,
    borderTopWidth: 1
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  composerWrap: {
    padding: 12,
    borderTopWidth: 1
  },
  composerInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    height: 48
  },
  input: {
    flex: 1,
    fontSize: 13
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  disclaimer: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 6
  }
})
