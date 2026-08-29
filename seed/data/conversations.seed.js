/**
 * Conversations & Message dialogues seed dataset
 */
export const conversationsSeedData = [
  {
    title: 'Pune Weekend Weather & Rain Forecast',
    category: 'forecast',
    messages: [
      {
        sender: 'user',
        content: 'Will it rain this weekend in Pune?',
        messageType: 'text'
      },
      {
        sender: 'ai',
        content:
          'Currently in Pune, Maharashtra, the temperature is around 27°C. Light to moderate rain showers are likely this weekend with a 65% precipitation probability.',
        messageType: 'weather',
        metadata: {
          location: 'Pune, Maharashtra, India',
          latitude: 18.5204,
          longitude: 73.8567
        }
      }
    ]
  },
  {
    title: 'Delhi Heatwave & Air Quality Advisory',
    category: 'weather',
    messages: [
      {
        sender: 'user',
        content: 'How is the air quality and temperature in Delhi today?',
        messageType: 'text'
      },
      {
        sender: 'ai',
        content:
          'In New Delhi, maximum temperatures are reaching 42°C with high UV index. Air quality index (AQI) is currently in the Moderate-to-Poor category.',
        messageType: 'weather',
        metadata: {
          location: 'New Delhi, Delhi, India',
          latitude: 28.6139,
          longitude: 77.209
        }
      }
    ]
  }
]
