// Authority Dashboard Mock Data
// District map markers, alerts, and analytics for State Disaster Management Authority

export const initialAuthorityAlerts = [
  {
    id: "auth-alert-1",
    type: "Heavy Rainfall",
    iconType: "rain",
    title: "Heavy Rainfall Alert",
    location: "Pune District, Maharashtra",
    district: "Pune",
    severity: "Red",
    severityLabel: "Red (Critical)",
    severityLevel: "critical",
    startTime: "9 Sep, 08:00",
    expiryTime: "9 Sep, 20:00",
    status: "Active",
    source: "IMD",
    affectedUsers: "4,230",
    timeAgo: "2 hours ago",
    description: "Heavy to very heavy rainfall is expected in Pune district. Possibility of localized flooding in low-lying areas. Authorities are advised to take necessary precautions.",
    forecastOverview: {
      imd: { expectedRain: "80–120 mm", windSpeed: "25–40 km/h", thunderstorms: "Likely", floodRisk: "High" },
      gfs: { expectedRain: "70–100 mm", windSpeed: "20–35 km/h", thunderstorms: "Possible", floodRisk: "Moderate" },
      ecmwf: { expectedRain: "85–130 mm", windSpeed: "30–45 km/h", thunderstorms: "Likely", floodRisk: "High" }
    },
    lat: 18.5204,
    lng: 73.8567
  },
  {
    id: "auth-alert-2",
    type: "Thunderstorm",
    iconType: "thunderstorm",
    title: "Thunderstorm & Lightning Warning",
    location: "Mumbai Metropolitan Region",
    district: "Mumbai",
    severity: "Orange",
    severityLabel: "Orange (High)",
    severityLevel: "high",
    startTime: "9 Sep, 10:00",
    expiryTime: "9 Sep, 18:00",
    status: "Active",
    source: "IMD",
    affectedUsers: "2,850",
    timeAgo: "3 hours ago",
    description: "Intense thunderstorm cells with convective squalls and cloud-to-ground lightning moving eastwards across Mumbai and suburban coastal corridors.",
    forecastOverview: {
      imd: { expectedRain: "50–80 mm", windSpeed: "40–55 km/h", thunderstorms: "Severe", floodRisk: "Moderate" },
      gfs: { expectedRain: "45–70 mm", windSpeed: "35–50 km/h", thunderstorms: "Likely", floodRisk: "Moderate" },
      ecmwf: { expectedRain: "60–90 mm", windSpeed: "45–60 km/h", thunderstorms: "Severe", floodRisk: "High" }
    },
    lat: 19.0760,
    lng: 72.8777
  },
  {
    id: "auth-alert-3",
    type: "Strong Winds",
    iconType: "wind",
    title: "Strong Winds Advisory",
    location: "Nashik District",
    district: "Nashik",
    severity: "Orange",
    severityLabel: "Orange (High)",
    severityLevel: "high",
    startTime: "9 Sep, 09:00",
    expiryTime: "9 Sep, 15:00",
    status: "Active",
    source: "GFS",
    affectedUsers: "1,140",
    timeAgo: "5 hours ago",
    description: "Sustained high-velocity winds exceeding 45-55 km/h expected in elevated sections. Risk of temporary tree fall and hoarding damage.",
    forecastOverview: {
      imd: { expectedRain: "20–35 mm", windSpeed: "45–55 km/h", thunderstorms: "Isolated", floodRisk: "Low" },
      gfs: { expectedRain: "15–30 mm", windSpeed: "50–60 km/h", thunderstorms: "None", floodRisk: "Low" },
      ecmwf: { expectedRain: "25–40 mm", windSpeed: "40–50 km/h", thunderstorms: "Isolated", floodRisk: "Low" }
    },
    lat: 19.9975,
    lng: 73.7898
  },
  {
    id: "auth-alert-4",
    type: "Heavy Rainfall",
    iconType: "rain",
    title: "Heavy Rainfall Alert",
    location: "Ratnagiri District",
    district: "Ratnagiri",
    severity: "Yellow",
    severityLabel: "Yellow (Moderate)",
    severityLevel: "moderate",
    startTime: "9 Sep, 07:00",
    expiryTime: "9 Sep, 18:00",
    status: "Active",
    source: "IMD",
    affectedUsers: "920",
    timeAgo: "6 hours ago",
    description: "Persistent coastal moisture advection producing heavy intermittent spells across southern Konkan coastlines.",
    forecastOverview: {
      imd: { expectedRain: "40–70 mm", windSpeed: "30–40 km/h", thunderstorms: "Possible", floodRisk: "Moderate" },
      gfs: { expectedRain: "35–65 mm", windSpeed: "25–35 km/h", thunderstorms: "Possible", floodRisk: "Moderate" },
      ecmwf: { expectedRain: "45–75 mm", windSpeed: "30–45 km/h", thunderstorms: "Likely", floodRisk: "Moderate" }
    },
    lat: 16.9902,
    lng: 73.3120
  },
  {
    id: "auth-alert-5",
    type: "Flood Watch",
    iconType: "flood",
    title: "Panchganga River Flood Watch",
    location: "Kolhapur District",
    district: "Kolhapur",
    severity: "Yellow",
    severityLabel: "Yellow (Moderate)",
    severityLevel: "moderate",
    startTime: "8 Sep, 20:00",
    expiryTime: "9 Sep, 12:00",
    status: "Active",
    source: "State Disaster Management",
    affectedUsers: "1,480",
    timeAgo: "8 hours ago",
    description: "River levels approaching the initial caution mark due to catchment inflows from Radhanagari dam. Low-lying bridges monitored.",
    forecastOverview: {
      imd: { expectedRain: "30–50 mm", windSpeed: "15–25 km/h", thunderstorms: "None", floodRisk: "Elevated" },
      gfs: { expectedRain: "25–45 mm", windSpeed: "15–20 km/h", thunderstorms: "None", floodRisk: "Moderate" },
      ecmwf: { expectedRain: "35–55 mm", windSpeed: "20–30 km/h", thunderstorms: "None", floodRisk: "Elevated" }
    },
    lat: 16.7050,
    lng: 74.2433
  },
  {
    id: "auth-alert-6",
    type: "Heat Alert",
    iconType: "heat",
    title: "High Temperature Advisory",
    location: "Nagpur & East Vidarbha",
    district: "Nagpur",
    severity: "Yellow",
    severityLabel: "Yellow (Moderate)",
    severityLevel: "moderate",
    startTime: "8 Sep, 11:00",
    expiryTime: "9 Sep, 18:00",
    status: "Active",
    source: "IMD",
    affectedUsers: "2,100",
    timeAgo: "1 day ago",
    description: "Dry westerly winds causing daytime heat index to elevate between 39°C and 42°C in non-irrigated zones.",
    forecastOverview: {
      imd: { expectedRain: "0 mm", windSpeed: "10–18 km/h", thunderstorms: "None", floodRisk: "None" },
      gfs: { expectedRain: "0 mm", windSpeed: "12–20 km/h", thunderstorms: "None", floodRisk: "None" },
      ecmwf: { expectedRain: "0 mm", windSpeed: "10–15 km/h", thunderstorms: "None", floodRisk: "None" }
    },
    lat: 21.1458,
    lng: 79.0882
  },
  {
    id: "auth-alert-7",
    type: "Moderate Rain",
    iconType: "cloudy",
    title: "Moderate Rainfall Advisory",
    location: "Satara District",
    district: "Satara",
    severity: "Green",
    severityLabel: "Green (Light)",
    severityLevel: "low",
    startTime: "9 Sep, 06:00",
    expiryTime: "9 Sep, 14:00",
    status: "Active",
    source: "IMD",
    affectedUsers: "650",
    timeAgo: "1 day ago",
    description: "Light to moderate passing rains over western ghat hills. Normal agricultural and transit operations continue.",
    forecastOverview: {
      imd: { expectedRain: "10–25 mm", windSpeed: "15–22 km/h", thunderstorms: "None", floodRisk: "Low" },
      gfs: { expectedRain: "10–20 mm", windSpeed: "12–20 km/h", thunderstorms: "None", floodRisk: "Low" },
      ecmwf: { expectedRain: "15–30 mm", windSpeed: "15–25 km/h", thunderstorms: "None", floodRisk: "Low" }
    },
    lat: 17.6805,
    lng: 74.0183
  }
];

export const authorityDistrictMapData = [
  { id: "dist-pune", name: "Pune", x: 260, y: 310, status: "Severe (Red)", severityColor: "#EF4444", alertCount: 12, rainMm: 110, icon: "rain", condition: "Heavy Rainfall", population: "9.4M" },
  { id: "dist-mumbai", name: "Mumbai", x: 190, y: 260, status: "High (Orange)", severityColor: "#F97316", alertCount: 8, rainMm: 75, icon: "thunderstorm", condition: "Thunderstorms", population: "12.5M" },
  { id: "dist-nashik", name: "Nashik", x: 285, y: 195, status: "High (Orange)", severityColor: "#F97316", alertCount: 6, rainMm: 35, icon: "wind", condition: "High Winds", population: "6.1M" },
  { id: "dist-aurangabad", name: "Aurangabad", x: 420, y: 230, status: "Moderate (Yellow)", severityColor: "#EAB308", alertCount: 4, rainMm: 22, icon: "cloudy", condition: "Overcast", population: "3.7M" },
  { id: "dist-kolhapur", name: "Kolhapur", x: 270, y: 440, status: "Moderate (Yellow)", severityColor: "#EAB308", alertCount: 5, rainMm: 45, icon: "flood", condition: "Flood Risk", population: "3.9M" },
  { id: "dist-solapur", name: "Solapur", x: 440, y: 380, status: "Light (Green)", severityColor: "#22C55E", alertCount: 2, rainMm: 12, icon: "sunny", condition: "Partly Cloudy", population: "4.3M" },
  { id: "dist-nagpur", name: "Nagpur", x: 620, y: 140, status: "Moderate (Yellow)", severityColor: "#EAB308", alertCount: 3, rainMm: 0, icon: "heat", condition: "Heat Alert", population: "4.7M" },
  { id: "dist-satara", name: "Satara", x: 275, y: 375, status: "Light (Green)", severityColor: "#22C55E", alertCount: 1, rainMm: 18, icon: "rain", condition: "Moderate Rain", population: "3.0M" },
  { id: "dist-ratnagiri", name: "Ratnagiri", x: 215, y: 390, status: "Moderate (Yellow)", severityColor: "#EAB308", alertCount: 3, rainMm: 58, icon: "rain", condition: "Heavy Rain", population: "1.6M" },
];

export const authorityAnalyticsData = {
  summary: {
    totalAlerts: 48,
    criticalAlerts: 12,
    affectedAreas: 18,
    usersNotified: "2,40,000"
  },
  severityBreakdown: [
    { label: "Critical", count: 12, color: "#EF4444", bgClass: "bg-red-500", textClass: "text-red-500" },
    { label: "High", count: 15, color: "#F97316", bgClass: "bg-orange-500", textClass: "text-orange-500" },
    { label: "Moderate", count: 14, color: "#EAB308", bgClass: "bg-yellow-500", textClass: "text-yellow-500" },
    { label: "Low", count: 7, color: "#22C55E", bgClass: "bg-emerald-500", textClass: "text-emerald-500" }
  ],
  timeline: [
    { label: "1 Sep", count: 8 },
    { label: "5 Sep", count: 6 },
    { label: "10 Sep", count: 10 },
    { label: "15 Sep", count: 18 },
    { label: "20 Sep", count: 12 },
    { label: "25 Sep", count: 7 },
    { label: "30 Sep", count: 16 }
  ],
  topDistricts: [
    { name: "Pune", count: 12, max: 15, color: "bg-blue-600" },
    { name: "Mumbai", count: 8, max: 15, color: "bg-blue-600" },
    { name: "Nashik", count: 6, max: 15, color: "bg-blue-600" },
    { name: "Kolhapur", count: 5, max: 15, color: "bg-blue-600" },
    { name: "Aurangabad", count: 4, max: 15, color: "bg-blue-600" }
  ]
};
