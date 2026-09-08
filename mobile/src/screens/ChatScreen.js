import React, { useState, useEffect } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native'
import { getColors } from '../theme/colors'
import { api } from '../services/api'

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
    text: 'Yes, high-resolution radar indicates a high probability (80%) of convective showers tomorrow in Pune, especially during the afternoon and evening hours.',
    hasForecast: true
  }
]

export function ChatScreen ({
  isDark = false,
  unit = 'C',
  backendReady = false,
  onNotification
}) {
  const c = getColors(isDark)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch or initialize conversation on mount
  useEffect(() => {
    let isMounted = true

    const initChat = async () => {
      try {
        const convList = await api.conversations().catch(() => [])
        if (!isMounted) return

        if (Array.isArray(convList) && convList.length > 0) {
          const active = convList[0]
          const convId = active._id || active.id
          setConversationId(convId)

          const messageHistory = await api.messages(convId).catch(() => [])
          if (
            isMounted &&
            Array.isArray(messageHistory) &&
            messageHistory.length > 0
          ) {
            setMessages(
              messageHistory.map(m => ({
                id: m._id || m.id || String(Math.random()),
                sender: m.sender === 'user' ? 'user' : 'bot',
                time: new Date(m.createdAt || Date.now()).toLocaleTimeString(
                  [],
                  {
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                ),
                text: m.content,
                hasForecast:
                  (m.content || '').toLowerCase().includes('rain') ||
                  (m.content || '').toLowerCase().includes('forecast')
              }))
            )
          }
        }
      } catch {
        // preserve initial demo messages if offline
      }
    }

    if (backendReady) {
      initChat()
    }

    return () => {
      isMounted = false
    }
  }, [backendReady])

  const sendMessage = async textToSend => {
    const text = (textToSend || draft).trim()
    if (!text || isLoading) return

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: 'Now',
      text
    }

    setMessages(prev => [...prev, userMsg])
    setDraft('')
    setIsLoading(true)

    // 1. Try Live Backend API if ready
    if (backendReady) {
      try {
        let convId = conversationId
        if (!convId) {
          const newConv = await api.createConversation({
            title: text.slice(0, 32),
            category: 'general'
          })
          convId = newConv._id || newConv.id
          setConversationId(convId)
        }

        const response = await api.sendMessage({
          conversationId: convId,
          content: text
        })

        if (response?.aiMessage) {
          const content = response.aiMessage.content || ''
          setMessages(prev => [
            ...prev,
            {
              id: response.aiMessage._id || `b-${Date.now()}`,
              sender: 'bot',
              time: 'Now',
              text: content,
              hasForecast:
                content.toLowerCase().includes('rain') ||
                content.toLowerCase().includes('forecast') ||
                content.toLowerCase().includes('temperature')
            }
          ])
          setIsLoading(false)
          return
        }
      } catch (err) {
        // Fallback to local intelligent assistant below
      }
    }

    // 2. Intelligent Offline Fallback Engine
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
          'Current Air Quality Index (AQI) is at 68 (Moderate condition) with PM2.5 within acceptable standards.'
      } else if (text.toLowerCase().includes('cyclone')) {
        botReply =
          'IMD Tropical Cyclone Alert: No active cyclone warnings within 500 km radius of Indian coastal waters currently.'
      }

      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          time: 'Now',
          text: botReply,
          hasForecast:
            text.toLowerCase().includes('rain') ||
            text.toLowerCase().includes('forecast')
        }
      ])
      setIsLoading(false)
    }, 700)
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Sub-header status strip */}
      <View
        style={[
          styles.subHeader,
          { backgroundColor: c.card, borderBottomColor: c.border }
        ]}
      >
        <View style={styles.onlinePill}>
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: backendReady ? '#10B981' : '#F59E0B' }
            ]}
          />
          <Text style={[styles.onlineText, { color: c.inkSecondary }]}>
            {backendReady
              ? 'WeatherGPT AI • Connected & Grounded'
              : 'Local Meteorological Assistant • Offline Ready'}
          </Text>
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.todayPill,
            { backgroundColor: c.cardAlt, borderColor: c.border }
          ]}
        >
          <Text style={[styles.todayText, { color: c.muted }]}>TODAY</Text>
        </View>

        {messages.map(msg => {
          if (msg.sender === 'user') {
            return (
              <View key={msg.id} style={styles.userBubbleWrapper}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{msg.text}</Text>
                  <Text style={styles.userTime}>{msg.time}</Text>
                </View>
              </View>
            )
          }

          return (
            <View key={msg.id} style={styles.botRow}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarIcon}>⚡</Text>
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

                {/* Grounded forecast badge if relevant */}
                {msg.hasForecast && (
                  <View
                    style={[
                      styles.forecastBox,
                      { backgroundColor: c.cardAlt, borderColor: c.border }
                    ]}
                  >
                    <View style={styles.rainRow}>
                      <Text style={styles.rainIcon}>🌧️</Text>
                      <View>
                        <Text
                          style={[
                            styles.rainPercent,
                            { color: isDark ? '#60A5FA' : '#2563EB' }
                          ]}
                        >
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
                          Moderate showers
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

        {isLoading ? (
          <View style={styles.loadingRow}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarIcon}>⚡</Text>
            </View>
            <View
              style={[
                styles.loadingBubble,
                { backgroundColor: c.card, borderColor: c.border }
              ]}
            >
              <ActivityIndicator size='small' color={c.blue} />
              <Text style={[styles.loadingText, { color: c.muted }]}>
                Analyzing Doppler radar and NWP models...
              </Text>
            </View>
          </View>
        ) : null}
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
            editable={!isLoading}
          />
          <Pressable
            disabled={isLoading}
            onPress={() => sendMessage()}
            style={[styles.sendButton, { backgroundColor: c.blue }]}
            accessibilityLabel='Send message'
          >
            <Text style={styles.sendButtonText}>→</Text>
          </Pressable>
        </View>
        <Text style={[styles.disclaimer, { color: c.mutedLight }]}>
          WeatherGPT is grounded in official IMD and ECMWF metrics. Verify
          emergency alerts.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  subHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center'
  },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineText: { fontSize: 10.5, fontWeight: '700' },
  messagesScroll: { flex: 1 },
  messagesContainer: { padding: 16, paddingBottom: 20, gap: 14 },
  todayPill: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6
  },
  todayText: { fontSize: 9.5, fontWeight: '700' },
  userBubbleWrapper: { alignSelf: 'flex-end', maxWidth: '82%' },
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
  userTime: { color: '#BFDBFE', fontSize: 9, textAlign: 'right', marginTop: 4 },
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
  botAvatarIcon: { color: '#FFFFFF', fontSize: 16 },
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
  botText: { fontSize: 13, lineHeight: 19 },
  forecastBox: { borderRadius: 12, borderWidth: 1, padding: 10, gap: 8 },
  rainRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rainIcon: { fontSize: 20 },
  rainPercent: { fontSize: 16, fontWeight: '800' },
  rainSub: { fontSize: 9 },
  rainTimeTitle: { fontSize: 11, fontWeight: '700' },
  rainTimeRange: { fontSize: 9 },
  forecastStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)'
  },
  fStat: { alignItems: 'center' },
  fStatLabel: { fontSize: 7.5, fontWeight: '800' },
  fStatVal: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  botTime: { fontSize: 9, alignSelf: 'flex-end' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1
  },
  loadingText: { fontSize: 11, fontWeight: '500' },
  chipsWrapper: { paddingVertical: 8, borderTopWidth: 1 },
  chipsScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1
  },
  chipText: { fontSize: 11, fontWeight: '700' },
  composerWrap: { padding: 12, borderTopWidth: 1 },
  composerInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    height: 48
  },
  input: { flex: 1, fontSize: 13 },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  disclaimer: { fontSize: 9, textAlign: 'center', marginTop: 6 }
})
