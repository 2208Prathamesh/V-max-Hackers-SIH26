// Mock dataset representing real-time weather and user state matching WeatherGPT

export const initialUser = {
  name: "Sid Patil",
  email: "sidpatil@gmail.com",
  avatarInitials: "SP",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  plan: "Full Access",
  memberSince: "May 12, 2024",
  stats: {
    locationsSaved: 5,
    conversations: 48,
    alertsSet: 3,
    thisWeek: 12,
    thisMonth: 28,
    totalMessages: 156,
    storageUsedPercent: 45
  }
};

export const defaultSettings = {
  timeZone: "(UTC+05:30) Asia/Kolkata",
  units: {
    temperature: "C", // 'C' | 'F'
    windSpeed: "kmh", // 'kmh' | 'mph' | 'ms' | 'knots'
    pressure: "hPa",  // 'hPa' | 'inHg' | 'mmHg' | 'bar'
    precipitation: "mm" // 'mm' | 'in'
  },
  notifications: {
    weatherAlerts: true,
    dailyForecast: true,
    weeklySummary: false,
    breakingNews: true
  },
  language: "en"
};

export const initialSavedLocations = [
  {
    id: "loc-1",
    city: "Pune",
    region: "Maharashtra",
    country: "India",
    updatedTime: "Updated 10:21 AM",
    tempC: 27,
    feelsLikeC: 30,
    humidity: 72,
    windSpeedKmh: 16,
    windDirection: "SW",
    pressureHpa: 1008,
    condition: "Partly Cloudy",
    conditionType: "partly-cloudy",
    aqi: 68,
    uvIndex: 7,
    isFavorite: true,
    lat: 18.5204,
    lng: 73.8567,
    forecast3Day: [
      { day: "Wed", condition: "rain", temp: 31 },
      { day: "Thu", condition: "rain", temp: 30 },
      { day: "Fri", condition: "sunny", temp: 29 }
    ]
  },
  {
    id: "loc-2",
    city: "Mumbai",
    region: "Maharashtra",
    country: "India",
    updatedTime: "Updated 9:45 AM",
    tempC: 28,
    feelsLikeC: 31,
    humidity: 80,
    windSpeedKmh: 20,
    windDirection: "W",
    pressureHpa: 1005,
    condition: "Light Rain",
    conditionType: "rain",
    aqi: 92,
    uvIndex: 4,
    isFavorite: false,
    lat: 19.0760,
    lng: 72.8777,
    forecast3Day: [
      { day: "Wed", condition: "rain", temp: 30 },
      { day: "Thu", condition: "partly-cloudy", temp: 31 },
      { day: "Fri", condition: "rain", temp: 29 }
    ]
  },
  {
    id: "loc-3",
    city: "New Delhi",
    region: "Delhi",
    country: "India",
    updatedTime: "Updated 8:30 AM",
    tempC: 32,
    feelsLikeC: 34,
    humidity: 45,
    windSpeedKmh: 12,
    windDirection: "N",
    pressureHpa: 1012,
    condition: "Sunny",
    conditionType: "sunny",
    aqi: 178,
    uvIndex: 9,
    isFavorite: false,
    lat: 28.6139,
    lng: 77.2090,
    forecast3Day: [
      { day: "Wed", condition: "sunny", temp: 33 },
      { day: "Thu", condition: "sunny", temp: 34 },
      { day: "Fri", condition: "sunny", temp: 32 }
    ]
  },
  {
    id: "loc-4",
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    updatedTime: "Updated Yesterday, 8:15 PM",
    tempC: 24,
    feelsLikeC: 25,
    humidity: 65,
    windSpeedKmh: 10,
    windDirection: "NE",
    pressureHpa: 1015,
    condition: "Cloudy",
    conditionType: "cloudy",
    aqi: 45,
    uvIndex: 6,
    isFavorite: false,
    lat: 12.9716,
    lng: 77.5946,
    forecast3Day: [
      { day: "Wed", condition: "cloudy", temp: 26 },
      { day: "Thu", condition: "cloudy", temp: 25 },
      { day: "Fri", condition: "partly-cloudy", temp: 24 }
    ]
  },
  {
    id: "loc-5",
    city: "Jaipur",
    region: "Rajasthan",
    country: "India",
    updatedTime: "Updated Yesterday, 6:40 PM",
    tempC: 35,
    feelsLikeC: 37,
    humidity: 28,
    windSpeedKmh: 14,
    windDirection: "W",
    pressureHpa: 1009,
    condition: "Sunny",
    conditionType: "sunny",
    aqi: 110,
    uvIndex: 10,
    isFavorite: false,
    lat: 26.9124,
    lng: 75.7873,
    forecast3Day: [
      { day: "Wed", condition: "sunny", temp: 36 },
      { day: "Thu", condition: "sunny", temp: 37 },
      { day: "Fri", condition: "sunny", temp: 36 }
    ]
  }
];

export const allCityDatabase = [
  ...initialSavedLocations,
  {
    id: "loc-6",
    city: "Srinagar",
    region: "Jammu & Kashmir",
    country: "India",
    updatedTime: "Updated 10:15 AM",
    tempC: 22,
    feelsLikeC: 22,
    humidity: 50,
    windSpeedKmh: 8,
    windDirection: "NW",
    pressureHpa: 1018,
    condition: "Clear",
    conditionType: "sunny",
    aqi: 32,
    uvIndex: 5,
    lat: 34.0837,
    lng: 74.7973,
    forecast3Day: [
      { day: "Wed", condition: "sunny", temp: 23 },
      { day: "Thu", condition: "partly-cloudy", temp: 22 },
      { day: "Fri", condition: "rain", temp: 20 }
    ]
  },
  {
    id: "loc-7",
    city: "Lucknow",
    region: "Uttar Pradesh",
    country: "India",
    updatedTime: "Updated 9:30 AM",
    tempC: 33,
    feelsLikeC: 36,
    humidity: 52,
    windSpeedKmh: 11,
    windDirection: "E",
    pressureHpa: 1010,
    condition: "Sunny",
    conditionType: "sunny",
    aqi: 142,
    uvIndex: 8,
    lat: 26.8467,
    lng: 80.9462,
    forecast3Day: [
      { day: "Wed", condition: "sunny", temp: 34 },
      { day: "Thu", condition: "sunny", temp: 35 },
      { day: "Fri", condition: "sunny", temp: 34 }
    ]
  },
  {
    id: "loc-8",
    city: "Kolkata",
    region: "West Bengal",
    country: "India",
    updatedTime: "Updated 10:05 AM",
    tempC: 30,
    feelsLikeC: 35,
    humidity: 82,
    windSpeedKmh: 18,
    windDirection: "SE",
    pressureHpa: 1006,
    condition: "Thunderstorm",
    conditionType: "thunderstorm",
    aqi: 88,
    uvIndex: 6,
    lat: 22.5726,
    lng: 88.3639,
    forecast3Day: [
      { day: "Wed", condition: "thunderstorm", temp: 29 },
      { day: "Thu", condition: "rain", temp: 30 },
      { day: "Fri", condition: "partly-cloudy", temp: 31 }
    ]
  },
  {
    id: "loc-9",
    city: "Hyderabad",
    region: "Telangana",
    country: "India",
    updatedTime: "Updated 9:55 AM",
    tempC: 29,
    feelsLikeC: 32,
    humidity: 68,
    windSpeedKmh: 15,
    windDirection: "SW",
    pressureHpa: 1011,
    condition: "Partly Cloudy",
    conditionType: "partly-cloudy",
    aqi: 75,
    uvIndex: 7,
    lat: 17.3850,
    lng: 78.4867,
    forecast3Day: [
      { day: "Wed", condition: "partly-cloudy", temp: 30 },
      { day: "Thu", condition: "rain", temp: 28 },
      { day: "Fri", condition: "cloudy", temp: 29 }
    ]
  },
  {
    id: "loc-10",
    city: "Chennai",
    region: "Tamil Nadu",
    country: "India",
    updatedTime: "Updated 10:10 AM",
    tempC: 30,
    feelsLikeC: 36,
    humidity: 78,
    windSpeedKmh: 17,
    windDirection: "E",
    pressureHpa: 1007,
    condition: "Partly Cloudy",
    conditionType: "partly-cloudy",
    aqi: 64,
    uvIndex: 8,
    lat: 13.0827,
    lng: 80.2707,
    forecast3Day: [
      { day: "Wed", condition: "partly-cloudy", temp: 31 },
      { day: "Thu", condition: "rain", temp: 30 },
      { day: "Fri", condition: "sunny", temp: 32 }
    ]
  }
];

export const initialConversations = [
  {
    id: "conv-1",
    dateGroup: "Today – 21 May 2025",
    time: "10:21 AM",
    title: "Will it rain tomorrow in Pune?",
    preview: "You asked about the rain probability for tomorrow in Pune...",
    tag: "General Query",
    tagColor: "blue",
    icon: "rain",
    messages: [
      { sender: "user", text: "Will it rain tomorrow in Pune?", time: "10:20 AM" },
      { 
        sender: "assistant", 
        text: "Yes, there is a **65% chance of moderate rainfall** in Pune tomorrow (Wednesday, May 22). Cloud cover will remain around 80%, with temperatures between 22°C and 30°C.",
        time: "10:21 AM",
        cardData: {
          city: "Pune",
          temp: 27,
          condition: "Rain Expected",
          rainProb: "65%",
          humidity: "78%",
          wind: "18 km/h"
        }
      }
    ]
  },
  {
    id: "conv-2",
    dateGroup: "Today – 21 May 2025",
    time: "9:05 AM",
    title: "Weather alert for Maharashtra",
    preview: "You asked about current weather alerts in Maharashtra...",
    tag: "Alert",
    tagColor: "red",
    icon: "alert",
    messages: [
      { sender: "user", text: "Any weather alerts active for Maharashtra today?", time: "9:04 AM" },
      { 
        sender: "assistant", 
        text: "⚠️ **IMD Yellow Alert**: Heavy rainfall and localized waterlogging expected in Konkan and parts of Western Ghats over the next 48 hours. Gusty winds up to 45 km/h are expected along coastal areas.",
        time: "9:05 AM"
      }
    ]
  },
  {
    id: "conv-3",
    dateGroup: "Today – 21 May 2025",
    time: "8:15 AM",
    title: "Weekend weather in Lonavala",
    preview: "You asked about the weather conditions for this weekend...",
    tag: "Forecast",
    tagColor: "yellow",
    icon: "sun-cloud",
    messages: [
      { sender: "user", text: "What's the weather looking like for a trip to Lonavala this weekend?", time: "8:14 AM" },
      { 
        sender: "assistant", 
        text: "Lonavala will experience misty mornings, light to moderate intermittent showers, and pleasant temperatures averaging 21°C to 26°C. Ideal monsoon getaway weather, but pack raincoats and drive cautiously on the ghats!",
        time: "8:15 AM"
      }
    ]
  },
  {
    id: "conv-4",
    dateGroup: "Yesterday – 20 May 2025",
    time: "4:30 PM",
    title: "Air quality in Delhi",
    preview: "You asked about the current air quality index in Delhi...",
    tag: "Air Quality",
    tagColor: "green",
    icon: "wind",
    messages: [
      { sender: "user", text: "What is the air quality index in Delhi today?", time: "4:29 PM" },
      { 
        sender: "assistant", 
        text: "Delhi's AQI is currently **178 (Moderate to Unhealthy for Sensitive Groups)**. PM2.5 levels are elevated. Sensitive individuals are advised to reduce prolonged outdoor exertion.",
        time: "4:30 PM"
      }
    ]
  },
  {
    id: "conv-5",
    dateGroup: "Yesterday – 20 May 2025",
    time: "11:10 AM",
    title: "Cyclone update in Bay of Bengal",
    preview: "You asked about the latest cyclone updates in Bay of Bengal...",
    tag: "Alert",
    tagColor: "purple",
    icon: "cyclone",
    messages: [
      { sender: "user", text: "Is there a cyclone forming in the Bay of Bengal?", time: "11:09 AM" },
      { 
        sender: "assistant", 
        text: "A well-marked low-pressure area over central Bay of Bengal has concentrated into a deep depression, moving north-northeastwards. Expected to bring heavy rainfall along Odisha and West Bengal coasts by Thursday evening.",
        time: "11:10 AM"
      }
    ]
  },
  {
    id: "conv-6",
    dateGroup: "Yesterday – 20 May 2025",
    time: "9:40 AM",
    title: "Best time to visit Himachal Pradesh",
    preview: "You asked about the best time to visit Himachal Pradesh...",
    tag: "General Query",
    tagColor: "blue",
    icon: "location",
    messages: [
      { sender: "user", text: "When is the best time to visit Himachal Pradesh?", time: "9:39 AM" },
      { 
        sender: "assistant", 
        text: "For sightseeing and pleasant weather, **March to June** is prime. If you love snow and winter sports, **December to February** is optimal. Note that July–August brings monsoon landslides in higher elevations.",
        time: "9:40 AM"
      }
    ]
  },
  {
    id: "conv-7",
    dateGroup: "19 May 2025",
    time: "6:20 PM",
    title: "Tomorrow's temperature in Nagpur",
    preview: "You asked about the temperature forecast for Nagpur tomorrow...",
    tag: "Forecast",
    tagColor: "orange",
    icon: "thermometer",
    messages: [
      { sender: "user", text: "What's tomorrow's expected temperature in Nagpur?", time: "6:19 PM" },
      { 
        sender: "assistant", 
        text: "Nagpur is forecasted to reach a maximum of **41°C** and a minimum of 27°C with clear skies and strong afternoon sun. Stay well hydrated!",
        time: "6:20 PM"
      }
    ]
  },
  {
    id: "conv-8",
    dateGroup: "19 May 2025",
    time: "3:40 PM",
    title: "Is it safe to travel to Kerala now?",
    preview: "You asked about the safety and weather conditions in Kerala...",
    tag: "General Query",
    tagColor: "green",
    icon: "shield",
    messages: [
      { sender: "user", text: "Is it safe to travel to Kerala right now with monsoon approaching?", time: "3:39 PM" },
      { 
        sender: "assistant", 
        text: "Yes, travel is safe in coastal and backwater regions (Kochi, Alleppey, Kumarakom). However, hilly zones like Wayanad and Munnar have intermittent heavy showers, so check local road advisories before mountain treks.",
        time: "3:40 PM"
      }
    ]
  },
  {
    id: "conv-9",
    dateGroup: "19 May 2025",
    time: "10:15 AM",
    title: "How much rainfall Mumbai will get this week?",
    preview: "You asked about the total rainfall prediction in Mumbai this week...",
    tag: "Forecast",
    tagColor: "orange",
    icon: "rain",
    messages: [
      { sender: "user", text: "How much rainfall is Mumbai expected to get this week?", time: "10:14 AM" },
      { 
        sender: "assistant", 
        text: "Mumbai is predicted to receive between **60mm to 95mm** cumulative precipitation this week, with peak rain intensity on Wednesday night through Friday afternoon.",
        time: "10:15 AM"
      }
    ]
  }
];

export const activeAlerts = [
  {
    id: "alert-1",
    title: "Heavy Rainfall & High Wind Warning",
    region: "Coastal Maharashtra, Goa & Konkan",
    severity: "Severe",
    severityLevel: "high", // 'high' | 'medium' | 'low'
    time: "Issued 2 hours ago • Valid until 23 May, 18:00 IST",
    source: "India Meteorological Department (IMD)",
    description: "Inundation risk in low-lying areas. Wind gusts may exceed 55 km/h. Fishermen are advised not to venture into the deep Arabian Sea."
  },
  {
    id: "alert-2",
    title: "Depression over Central Bay of Bengal",
    region: "Odisha & West Bengal Coastal Belt",
    severity: "Moderate",
    severityLevel: "medium",
    time: "Issued 4 hours ago • Valid until 24 May, 12:00 IST",
    source: "Joint Typhoon Warning Center",
    description: "Squally wind speed reaching 45-55 kmph gusting to 65 kmph likely over Northwest Bay of Bengal. Sea condition will be rough."
  },
  {
    id: "alert-3",
    title: "Heatwave Alert (Level 2)",
    region: "Western Rajasthan & Northern Gujarat",
    severity: "Moderate",
    severityLevel: "medium",
    time: "Issued today • Valid for next 48 hours",
    source: "State Disaster Management",
    description: "Maximum temperatures likely to stay above 42°C. High likelihood of heat-related illnesses for children and elderly."
  }
];

export const hourlyForecastPune = [
  { time: "Now", temp: 27, icon: "partly-cloudy", pop: "10%" },
  { time: "11 AM", temp: 28, icon: "partly-cloudy", pop: "15%" },
  { time: "12 PM", temp: 29, icon: "sunny", pop: "20%" },
  { time: "1 PM", temp: 30, icon: "sunny", pop: "25%" },
  { time: "2 PM", temp: 30, icon: "partly-cloudy", pop: "35%" },
  { time: "3 PM", temp: 29, icon: "cloudy", pop: "50%" },
  { time: "4 PM", temp: 28, icon: "rain", pop: "75%" },
  { time: "5 PM", temp: 27, icon: "rain", pop: "80%" },
  { time: "6 PM", temp: 26, icon: "rain", pop: "65%" },
  { time: "7 PM", temp: 25, icon: "cloudy", pop: "30%" }
];
