import React, { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', speechCode: 'mr-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' }
];

export const TRANSLATIONS = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    chat: 'WeatherGPT AI Chat',
    advisory: 'Agro & Safety Advisories',
    alerts: 'Official Alerts',
    weatherMap: 'Weather Map',
    forecast: 'Forecast & Models',
    history: 'Climate & History',
    savedLocations: 'Saved Locations',
    settings: 'Settings',
    logout: 'Logout',

    // Titles & Subtitles
    dashboardTitle: 'Weather Intelligence Dashboard',
    dashboardSubtitle: 'Real-time AI weather intelligence, radar telemetry & environmental metrics',
    chatTitle: 'WeatherGPT Conversational AI',
    chatSubtitle: 'Ask any meteorological, agricultural or climate question with zero hallucination',
    advisoryTitle: 'Agricultural & Disaster Decision Support',
    advisorySubtitle: 'Crop phenology guide, root-zone soil moisture & emergency disaster action plan',
    alertsTitle: 'Official IMD Meteorological Warnings',
    alertsSubtitle: 'Real-time severe weather warnings, district-level radar alerts & bulletins',
    forecastTitle: 'NWP Multi-Model Weather Forecast',
    forecastSubtitle: 'High-resolution extended forecast comparing ECMWF IFS and NOAA GFS models',
    mapTitle: 'Interactive GIS Weather & Radar Map',
    mapSubtitle: 'Live OpenStreetMap layers, Doppler radar precipitation & ISRO satellite telemetry',
    historyTitle: 'Historical Climate Analysis',
    historySubtitle: '20-year ERA5 climate shift analysis, temperature trends & past conversation logs',
    savedLocationsTitle: 'Saved Locations & Favorite Cities',
    savedLocationsSubtitle: 'Quickly access multi-city weather updates and telemetry across India',
    settingsTitle: 'System Settings & Preferences',
    settingsSubtitle: 'Customize units, language, appearance, and notification thresholds',

    // Metrics
    currentWeather: 'Current Weather',
    overview: 'Live Overview',
    temperature: 'Temperature',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    pressure: 'Atmospheric Pressure',
    precipitation: 'Precipitation',
    airQuality: 'Air Quality Index (AQI)',
    uvIndex: 'UV Index',
    visibility: 'Visibility',
    cloudCover: 'Cloud Cover',
    feelsLike: 'Feels Like',
    dewPoint: 'Dew Point',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    hourlyForecast: 'Hourly Forecast (Next 24 Hours)',
    sevenDayForecast: '7-Day Extended Forecast',
    radarSummary: 'Live Weather Radar',
    satelliteView: 'INSAT-3D Satellite Imagery',

    // Conditions
    clearSky: 'Clear Sky',
    sunny: 'Sunny',
    partlyCloudy: 'Partly Cloudy',
    overcast: 'Overcast',
    lightRain: 'Light Rain',
    moderateRain: 'Moderate Rain',
    heavyRain: 'Heavy Rain Warning',
    thunderstorm: 'Thunderstorm with Lightning',
    fog: 'Dense Fog',
    mist: 'Mist & Haze',

    // IMD Warning Levels
    redAlert: 'Red Alert (Take Action Immediately)',
    orangeAlert: 'Orange Alert (Be Prepared)',
    yellowAlert: 'Yellow Alert (Be Updated)',
    greenAlert: 'Green Alert (No Warning)',
    imdOfficialWarning: 'IMD Official District Warning',
    searchDistrict: 'Search Indian district or city for live alerts...',
    activeWarningsCount: 'Active Severe Warnings',
    safetyGuidelines: 'Official Safety Guidelines & Advice',

    // Hazards
    hazardHeavyRain: 'Extremely Heavy Rainfall & Flooding',
    hazardHeatwave: 'Severe Heatwave Conditions',
    hazardThunderstorm: 'Severe Thunderstorm & Lightning Strikes',
    hazardCyclone: 'Cyclonic Storm Warning',
    hazardFog: 'Dense Fog & Low Visibility',

    // Forecast & Models
    nwpConsensus: 'NWP Multi-Model Consensus',
    modelAgreement: 'Model Agreement Note',
    confidenceScore: 'Forecast Confidence Score',
    rainProbability: 'Rain Probability',
    today: 'Today',
    tomorrow: 'Tomorrow',
    maxTemp: 'Max Temp',
    minTemp: 'Min Temp',
    ensembleSpread: 'Inter-Model Ensemble Spread',

    // Agro & Safety
    cropAdvisory: 'Agro-Meteorological Crop Advisory',
    cropSelector: 'Select Target Crop Profile',
    topsoilMoisture: 'Topsoil Moisture (0-7 cm)',
    evapotranspiration: 'Daily Evapotranspiration (ET₀)',
    soilTemperature: 'Seedbed Soil Temperature',
    rainForecast3Day: '3-Day Rain Forecast',
    irrigationStatus: 'Irrigation Status',
    sprayingWindow: 'Chemical Spraying Window',
    agronomicHealth: 'Agronomic Health & Crop Guidance',
    disasterActionPlan: 'Disaster Emergency Action Plan',
    emergencyHelplines: '24x7 National & State Emergency Helplines',

    // Voice & Chat
    askPlaceholder: 'Ask WeatherGPT about rain, temperature, crop guidance, or warnings...',
    listening: 'Listening to your speech... Speak clearly.',
    voiceRecognized: 'Voice Recognized',
    listenVoice: 'Listen in Voice',
    stopVoice: 'Stop Audio',
    voiceError: 'Microphone access is unavailable or denied in your browser.',
    newChat: 'New Chat',

    // Actions & Tools
    search: 'Search city or district...',
    refresh: 'Refresh Live Data',
    viewAll: 'View All',
    saveLocation: 'Save Location',
    removeLocation: 'Remove',
    favorite: 'Favorite'
  },
  mr: {
    // Navigation
    dashboard: 'डॅशबोर्ड',
    chat: 'वेदर-जीपीटी एआय संवाद',
    advisory: 'कृषी व आपत्ती सल्ला',
    alerts: 'हवामान इशारे व चेतावणी',
    weatherMap: 'हवामान नकाशा (रडार)',
    forecast: 'हवामान अंदाज व मॉडेल्स',
    history: 'हवामान इतिहास व नोंदी',
    savedLocations: 'जतन केलेली शहरे',
    settings: 'सेटिंग्ज व प्राधान्ये',
    logout: 'बाहेर पडा (लॉगआउट)',

    // Titles & Subtitles
    dashboardTitle: 'हवामान बुद्धिमत्ता डॅशबोर्ड',
    dashboardSubtitle: 'थेट हवामान अंदाज, रडार माहिती आणि पर्यावरणीय विश्लेषण',
    chatTitle: 'वेदर-जीपीटी संभाषण एआय',
    chatSubtitle: 'हवामान, शेती, पाऊस आणि वादळांविषयी कोणतीही अचूक माहिती विचारा',
    advisoryTitle: 'कृषी पीक संरक्षण व आपत्ती निवारण',
    advisorySubtitle: 'पीक वाढीचे टप्पे, मातीतील ओलावा व आपत्कालीन सुरक्षा कृती योजना',
    alertsTitle: 'भारतीय हवामान विभाग (IMD) अधिकृत इशारे',
    alertsSubtitle: 'जिल्हानिहाय थेट हवामान इशारे, अतिवृष्टी सूचना आणि सुरक्षा उपाय',
    forecastTitle: 'एनडब्ल्यूपी बहु-मॉडेल हवामान अंदाज',
    forecastSubtitle: 'युरोपियन (ECMWF) आणि अमेरिकन (GFS) मॉडेल्सची तुलना व ७ ते १४ दिवसांचा अंदाज',
    mapTitle: 'थेट परस्परसंवादी हवामान व रडार नकाशा',
    mapSubtitle: 'ओपन-स्ट्रीट-मॅप थर, पाऊस रडार आणि इस्रो उपग्रह थेट चित्रण',
    historyTitle: '२० वर्षांचे हवामान विश्लेषण व इतिहास',
    historySubtitle: 'मागील २० वर्षांतील तापमान वाढ, पावसाचे प्रमाण आणि जुने प्रश्नोत्तर',
    savedLocationsTitle: 'जतन केलेली आवडती शहरे',
    savedLocationsSubtitle: 'महाराष्ट्रातील व देशातील आवडत्या शहरांचे हवामान एका क्लिकवर पहा',
    settingsTitle: 'प्रणाली सेटिंग्ज आणि भाषा निवडी',
    settingsSubtitle: 'तापमान एकक, भाषा, डार्क मोड आणि सूचना प्राधान्ये बदला',

    // Metrics
    currentWeather: 'सध्याचे थेट हवामान',
    overview: 'थेट आढावा',
    temperature: 'तापमान',
    humidity: 'हवेतील आर्द्रता (ओलावा)',
    windSpeed: 'वाऱ्याचा वेग',
    pressure: 'हवेचा वातावरणीय दाब',
    precipitation: 'पर्जन्यमान (पाऊस)',
    airQuality: 'हवेची गुणवत्ता (AQI)',
    uvIndex: 'अतिनील किरणे निर्देशांक (UV)',
    visibility: 'दृश्यमानता',
    cloudCover: 'ढगाळ वातावरण',
    feelsLike: 'जाणवणारे तापमान',
    dewPoint: 'दवबिंदू',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    hourlyForecast: 'तासनिहाय हवामान अंदाज (पुढील २४ तास)',
    sevenDayForecast: '७ दिवसांचा सविस्तर हवामान अंदाज',
    radarSummary: 'थेट हवामान रडार',
    satelliteView: 'इन्सॅट-३डी उपग्रह थेट प्रतिमा',

    // Conditions
    clearSky: 'निरभ्र व स्वच्छ आकाश',
    sunny: 'उष्ण व निरभ्र ऊन',
    partlyCloudy: 'अंशतः ढगाळ',
    overcast: 'पूर्णपणे ढगाळ वातावरण',
    lightRain: 'हलका ते मध्यम पाऊस',
    moderateRain: 'मध्यम स्वरूपाचा पाऊस',
    heavyRain: 'मुसळधार पावसाचा इशारा',
    thunderstorm: 'विजांच्या कडकडाटासह वादळी पाऊस',
    fog: 'दाट धुके व कुहासा',
    mist: 'धुकट हवा',

    // IMD Warning Levels
    redAlert: 'रेड अलर्ट (तात्काळ सुरक्षिततेची कृती करा)',
    orangeAlert: 'ऑरेंज अलर्ट (सावध व सज्ज राहा)',
    yellowAlert: 'यलो अलर्ट (हवामान माहिती घेत राहा)',
    greenAlert: 'ग्रीन अलर्ट (कोणताही धोका नाही, सुरक्षित)',
    imdOfficialWarning: 'हवामान विभागाचा (IMD) अधिकृत जिल्हा इशारा',
    searchDistrict: 'महाराष्ट्रातील किंवा देशातील जिल्हा किंवा शहर शोधा...',
    activeWarningsCount: 'सक्रिय हवामान इशारे',
    safetyGuidelines: 'अधिकृत आपत्कालीन सुरक्षा उपाय व मार्गदर्शन',

    // Hazards
    hazardHeavyRain: 'अतिवृष्टी, मुसळधार पाऊस व पूर धोका',
    hazardHeatwave: 'तीव्र उष्णतेची लाट (उष्माघात धोका)',
    hazardThunderstorm: 'विजांचा कडकडाट व वादळी वारे',
    hazardCyclone: 'तीव्र चक्रीवादळाचा धोका',
    hazardFog: 'अतिदाट धुके व कमी दृश्यमानता',

    // Forecast & Models
    nwpConsensus: 'एनडब्ल्यूपी बहु-मॉडेल समन्वय व खात्री',
    modelAgreement: 'मॉडेल निष्कर्ष आढावा',
    confidenceScore: 'अंदाज विश्वासार्हता गुण',
    rainProbability: 'पावसाची शक्यता',
    today: 'आज',
    tomorrow: 'उद्या',
    maxTemp: 'कमाल तापमान',
    minTemp: 'किमान तापमान',
    ensembleSpread: 'मॉडेल्समधील फरक व निष्कर्ष',

    // Agro & Safety
    cropAdvisory: 'कृषी-हवामान पीक सल्ला व संरक्षण',
    cropSelector: 'लक्षित पीक निवडा',
    topsoilMoisture: 'मातीच्या वरच्या थरातील ओलावा (०-७ सेमी)',
    evapotranspiration: 'दैनिक बाष्पोत्सर्जन दर (ET₀)',
    soilTemperature: 'मातीचे तापमान',
    rainForecast3Day: 'पुढील ३ दिवसांचा पावसाचा अंदाज',
    irrigationStatus: 'पाणी व्यवस्थापन (सिंचन गरज)',
    sprayingWindow: 'औषध फवारणीसाठी योग्य वेळ',
    agronomicHealth: 'पीक वाढ व कीड नियंत्रण मार्गदर्शन',
    disasterActionPlan: 'आपत्कालीन सुरक्षा व बचाव कृती योजना',
    emergencyHelplines: '२४ तास आपत्कालीन संपर्क हेल्पलाइन',

    // Voice & Chat
    askPlaceholder: 'पाऊस, तापमान, पीक संरक्षण किंवा हवामान इशाऱ्यांबद्दल विचारा...',
    listening: 'ऐकत आहे... तुमचा प्रश्न स्पष्ट बोला.',
    voiceRecognized: 'ओळखलेला आवाज संदेश',
    listenVoice: 'मराठी आवाजात ऐका',
    stopVoice: 'आवाज थांबवा',
    voiceError: 'मायक्रोफोन परवानगी नाकारली आहे किंवा उपलब्ध नाही.',
    newChat: 'नवीन संवाद',

    // Actions & Tools
    search: 'शहर किंवा जिल्हा शोधा...',
    refresh: 'माहिती ताजी करा',
    viewAll: 'सर्व पहा',
    saveLocation: 'शहर जतन करा',
    removeLocation: 'काढून टाका',
    favorite: 'आवडते शहर'
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    chat: 'वेदर-जीपीटी एआई चैट',
    advisory: 'कृषि एवं सुरक्षा सलाह',
    alerts: 'सरकारी मौसम चेतावनियां',
    weatherMap: 'मौसम मानचित्र (रडार)',
    forecast: 'पूर्वानुमान एवं मॉडल',
    history: 'जलवायु एवं इतिहास',
    savedLocations: 'सहेजे गए स्थान',
    settings: 'सेटिंग्स एवं प्राथमिकताएं',
    logout: 'लॉगआउट',

    // Titles & Subtitles
    dashboardTitle: 'मौसम बुद्धिमत्ता डैशबोर्ड',
    dashboardSubtitle: 'रीयल-टाइम मौसम पूर्वानुमान, रडार डेटा और पर्यावरण विश्लेषण',
    chatTitle: 'वेदर-जीपीटी संवादात्मक एआई',
    chatSubtitle: 'मौसम, खेती, बारिश और आपदाओं से संबंधित कोई भी सवाल पूछें',
    advisoryTitle: 'कृषि फसल सुरक्षा एवं आपदा प्रबंधन',
    advisorySubtitle: 'फसल विकास चरण, मिट्टी की नमी और आपातकालीन कार्य योजना',
    alertsTitle: 'भारतीय मौसम विभाग (IMD) आधिकारिक चेतावनियां',
    alertsSubtitle: 'जिला स्तरीय मौसम अलर्ट, भारी बारिश चेतावनी और सुरक्षा निर्देश',
    forecastTitle: 'एनडब्ल्यूपी मल्टी-मॉडल मौसम पूर्वानुमान',
    forecastSubtitle: 'यूरोपीय (ECMWF) और अमेरिकी (GFS) मॉडल्स की तुलना एवं 7-14 दिन का पूर्वानुमान',
    mapTitle: 'लाइव इंटरएक्टिव मौसम और रडार मैप',
    mapSubtitle: 'ओपन-स्ट्रीट-मैप लेयर्स, वर्षा रडार और इसरो उपग्रह टेलीमेट्री',
    historyTitle: '20-वर्षीय ऐतिहासिक जलवायु विश्लेषण',
    historySubtitle: 'तापमान वृद्धि का रुझान, वर्षा विचलन और पिछले संवाद रिकॉर्ड्स',
    savedLocationsTitle: 'सहेजे गए पसंदीदा शहर',
    savedLocationsSubtitle: 'देश के विभिन्न शहरों के मौसम पर एक क्लिक में नज़र रखें',
    settingsTitle: 'सिस्टम सेटिंग्स एवं भाषा प्राथमिकता',
    settingsSubtitle: 'तापमान इकाई, भाषा, डार्क मोड और अलर्ट नोटिफिकेशन सेट करें',

    // Metrics
    currentWeather: 'वर्तमान मौसम',
    overview: 'लाइव मौसम विवरण',
    temperature: 'तापमान',
    humidity: 'हवा में नमी (आर्द्रता)',
    windSpeed: 'हवा की गति',
    pressure: 'वायुमंडलीय दबाव',
    precipitation: 'वर्षा / बारिश',
    airQuality: 'वायु गुणवत्ता सूचकांक (AQI)',
    uvIndex: 'पराबैंगनी किरणें (UV Index)',
    visibility: 'दृश्यता',
    cloudCover: 'बादल छाए रहना',
    feelsLike: 'महसूस होने वाला तापमान',
    dewPoint: 'ओसांक बिंदु',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    hourlyForecast: 'प्रति घंटे का पूर्वानुमान (अगले 24 घंटे)',
    sevenDayForecast: '7-दिवसीय विस्तृत मौसम पूर्वानुमान',
    radarSummary: 'लाइव मौसम रडार',
    satelliteView: 'इनसैट-3डी उपग्रह चित्र',

    // Conditions
    clearSky: 'साफ एवं खुला आसमान',
    sunny: 'धूप खिली हुई',
    partlyCloudy: 'आंशिक रूप से बादल',
    overcast: 'घने बादल',
    lightRain: 'हल्की से मध्यम बारिश',
    moderateRain: 'मध्यम बारिश',
    heavyRain: 'भारी बारिश की चेतावनी',
    thunderstorm: 'गरज-चमक के साथ आंधी-तूफान',
    fog: 'घना कोहरा',
    mist: 'धुंध एवं कुहासा',

    // IMD Warning Levels
    redAlert: 'रेड अलर्ट (तुरंत सुरक्षा कदम उठाएं)',
    orangeAlert: 'ऑरेंज अलर्ट (सावधान एवं तैयार रहें)',
    yellowAlert: 'यलो अलर्ट (मौसम पर नज़र बनाए रखें)',
    greenAlert: 'ग्रीन अलर्ट (कोई चेतावनी नहीं, सुरक्षित)',
    imdOfficialWarning: 'मौसम विभाग (IMD) का आधिकारिक जिला अलर्ट',
    searchDistrict: 'भारत के किसी भी जिले या शहर का नाम खोजें...',
    activeWarningsCount: 'सक्रिय मौसम चेतावनियां',
    safetyGuidelines: 'आधिकारिक आपातकालीन सुरक्षा उपाय एवं निर्देश',

    // Hazards
    hazardHeavyRain: 'अत्यधिक भारी बारिश एवं बाढ़ का खतरा',
    hazardHeatwave: 'भीषण गर्मी एवं लू (हीटवेव)',
    hazardThunderstorm: 'तेज आंधी एवं आकाशीय बिजली गिरने का खतरा',
    hazardCyclone: 'चक्रवाती तूफान की चेतावनी',
    hazardFog: 'अत्यधिक घना कोहरा एवं कम दृश्यता',

    // Forecast & Models
    nwpConsensus: 'एनडब्ल्यूपी मल्टी-मॉडल सहमति',
    modelAgreement: 'मॉडल सहमति सारांश',
    confidenceScore: 'पूर्वानुमान सटीकता स्कोर',
    rainProbability: 'बारिश की संभावना',
    today: 'आज',
    tomorrow: 'कल',
    maxTemp: 'अधिकतम तापमान',
    minTemp: 'न्यूनतम तापमान',
    ensembleSpread: 'मॉडल्स में तुलना एवं अंतर',

    // Agro & Safety
    cropAdvisory: 'कृषि मौसम परामर्श एवं फसल सुरक्षा',
    cropSelector: 'लक्षित फसल चुनें',
    topsoilMoisture: 'ऊपरी मिट्टी की नमी (0-7 सेमी)',
    evapotranspiration: 'दैनिक वाष्पीकरण दर (ET₀)',
    soilTemperature: 'मिट्टी का तापमान',
    rainForecast3Day: 'अगले 3 दिनों की बारिश का अनुमान',
    irrigationStatus: 'सिंचाई आवश्यकता स्थिति',
    sprayingWindow: 'कीटनाशक छिड़काव के लिए उपयुक्त समय',
    agronomicHealth: 'फसल स्वास्थ्य एवं कीट सुरक्षा सलाह',
    disasterActionPlan: 'आपदा आपातकालीन सुरक्षा कार्य योजना',
    emergencyHelplines: '24x7 राष्ट्रीय एवं राज्य आपातकालीन हेल्पलाइन',

    // Voice & Chat
    askPlaceholder: 'बारिश, तापमान, फसल सुरक्षा या अलर्ट के बारे में पूछें...',
    listening: 'सुन रहा हूँ... अपना प्रश्न स्पष्ट बोलें।',
    voiceRecognized: 'पहचाना गया संदेश',
    listenVoice: 'हिन्दी आवाज में सुनें',
    stopVoice: 'आवाज बंद करें',
    voiceError: 'माइक्रोफ़ोन की अनुमति नहीं मिली या यह उपलब्ध नहीं है।',
    newChat: 'नया संवाद',

    // Actions & Tools
    search: 'शहर या जिला खोजें...',
    refresh: 'डेटा अपडेट करें',
    viewAll: 'सभी देखें',
    saveLocation: 'स्थान सहेजें',
    removeLocation: 'हटाएं',
    favorite: 'पसंदीदा शहर'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    chat: 'ওয়েদার-জিপিটি এআই',
    advisory: 'কৃষি ও দুর্যোগ পরামর্শ',
    alerts: 'সরকারি সতর্কবার্তা',
    weatherMap: 'আবহাওয়া মানচিত্র',
    forecast: 'পূর্বাভাস ও মডেল',
    history: 'জলবায়ু ও ইতিহাস',
    savedLocations: 'সংরক্ষিত শহর',
    settings: 'সেটিংস',
    logout: 'লগআউট',
    temperature: 'তাপমাত্রা',
    humidity: 'আর্দ্রতা',
    windSpeed: 'বাতাসের গতি',
    precipitation: 'বৃষ্টিপাত',
    currentWeather: 'বর্তমান আবহাওয়া',
    overview: 'সংক্ষিপ্ত বিবরণ',
    hourlyForecast: 'ঘণ্টাভিত্তিক পূর্বাভাস',
    sevenDayForecast: '৭ দিনের আবহাওয়া পূর্বাভাস',
    redAlert: 'রেড অ্যালার্ট (তাত্ক্ষণিক পদক্ষেপ নিন)',
    orangeAlert: 'অরেঞ্জ অ্যালার্ট (প্রস্তুত থাকুন)',
    yellowAlert: 'ইয়েলো অ্যালার্ট (নজর রাখুন)',
    greenAlert: 'গ্রিন অ্যালার্ট (কোনো ঝুঁকি নেই)',
    cropAdvisory: 'কৃষি আবহাওয়া পরামর্শ',
    disasterActionPlan: 'জরুরি নিরাপত্তা পরিকল্পনা',
    emergencyHelplines: 'জরুরি হেল্পলাইন নম্বর',
    askPlaceholder: 'বৃষ্টি, তাপমাত্রা বা ফসল সম্পর্কে জিজ্ঞাসা করুন...',
    listening: 'শুনছি... আপনার প্রশ্ন বলুন।',
    listenVoice: 'ভয়েসে শুনুন',
    stopVoice: 'ভয়েস বন্ধ করুন',
    search: 'শহর বা জেলা খুঁজুন...',
    refresh: 'রিফ্রেশ করুন',
    viewAll: 'সব দেখুন'
  },
  ta: {
    dashboard: 'முகப்பு பலகை',
    chat: 'வெதர்-ஜிபிடி AI',
    advisory: 'விவசாய & பாதுகாப்பு',
    alerts: 'அதிகாரப்பூர்வ எச்சரிக்கைகள்',
    weatherMap: 'வானிலை வரைபடம்',
    forecast: 'வானிலை முன்னறிவிப்பு',
    history: 'காலநிலை வரலாறு',
    savedLocations: 'சேமிக்கப்பட்ட இடங்கள்',
    settings: 'அமைப்புகள்',
    logout: 'வெளியேறு',
    temperature: 'வெப்பநிலை',
    humidity: 'ஈரப்பதம்',
    windSpeed: 'காற்றின் வேகம்',
    precipitation: 'மழைப்பொழிவு',
    currentWeather: 'தற்போதைய வானிலை',
    overview: 'கண்ணோட்டம்',
    hourlyForecast: 'மணிநேர முன்னறிவிப்பு',
    sevenDayForecast: '7 நாள் முன்னறிவிப்பு',
    redAlert: 'ரெட் அலர்ட் (உடனடி நடவடிக்கை தேவை)',
    orangeAlert: 'ஆரஞ்ச் அலர்ட் (தயாராக இருங்கள்)',
    yellowAlert: 'மஞ்சள் அலர்ட் (கவனமாக இருங்கள்)',
    greenAlert: 'பச்சை அலர்ட் (பாதுகாப்பானது)',
    cropAdvisory: 'விவசாய பயிர் ஆலோசனை',
    disasterActionPlan: 'பேரிடர் அவசர திட்டம்',
    emergencyHelplines: 'அவசர உதவி எண்கள்',
    askPlaceholder: 'வானிலை அல்லது பயிர் பற்றி கேளுங்கள்...',
    listening: 'கேட்கிறது... உங்கள் கேள்வியைப் பேசுங்கள்.',
    listenVoice: 'குரலில் கேளுங்கள்',
    stopVoice: 'குரலை நிறுத்து',
    search: 'நகரம் அல்லது மாவட்டம் தேடுக...',
    refresh: 'புதுப்பிக்கவும்',
    viewAll: 'அனைத்தையும் காண்க'
  },
  te: {
    dashboard: 'డ్యాష్‌బోర్డ్',
    chat: 'వెదర్-జీపీటీ AI',
    advisory: 'వ్యవసాయ & రక్షణ సలహాలు',
    alerts: 'అధికారిక హెచ్చరికలు',
    weatherMap: 'వాతావరణ మ్యాప్',
    forecast: 'వాతావరణ సూచనలు',
    history: 'చరిత్ర & రికార్డులు',
    savedLocations: 'సేవ్ చేసిన నగరాలు',
    settings: 'సెట్టింగ్‌లు',
    logout: 'లాగౌట్',
    temperature: 'ఉష్ణోగ్రత',
    humidity: 'గాలిలో తేమ',
    windSpeed: 'గాలి వేగం',
    precipitation: 'వర్షపాతం',
    currentWeather: 'ప్రస్తుత వాతావరణం',
    overview: 'వాతావరణ సారాంశం',
    hourlyForecast: 'గంటల వారీ అంచనా',
    sevenDayForecast: '7 రోజుల వాతావరణ అంచనా',
    redAlert: 'రెడ్ అలర్ట్ (వెంటనే రక్షణ చర్యలు తీసుకోండి)',
    orangeAlert: 'ఆరెంజ్ అలర్ట్ (అప్రమత్తంగా ఉండండి)',
    yellowAlert: 'ఎల్లో అలర్ట్ (గమనిస్తూ ఉండండి)',
    greenAlert: 'గ్రీన్ అలర్ట్ (సురక్షితం)',
    cropAdvisory: 'వ్యవసాయ పంటల సలహా',
    disasterActionPlan: 'విపత్తు రక్షణ ప్రణాళిక',
    emergencyHelplines: 'అత్యవసర హెల్ప్‌లైన్లు',
    askPlaceholder: 'వర్షం లేదా పంటల రక్షణ గురించి అడగండి...',
    listening: 'వింటున్నాను... మీ ప్రశ్న చెప్పండి.',
    listenVoice: 'వాయిస్‌లో వినండి',
    stopVoice: 'వాయిస్ ఆపండి',
    search: 'నగరం లేదా జిల్లా శోధించండి...',
    refresh: 'తాజాకరించండి',
    viewAll: 'అన్నీ చూడండి'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('weathergpt_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('weathergpt_language', language);
  }, [language]);

  const t = (key, fallback) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key] || fallback || key;
  };

  const translateWarningLevel = (level) => {
    if (!level) return t('greenAlert');
    const l = String(level).toLowerCase();
    if (l.includes('red')) return t('redAlert');
    if (l.includes('orange')) return t('orangeAlert');
    if (l.includes('yellow')) return t('yellowAlert');
    return t('greenAlert');
  };

  const translateHazard = (hazard) => {
    if (!hazard) return t('clearSky');
    const h = String(hazard).toLowerCase();
    if (h.includes('rain') || h.includes('flood') || h.includes('पाऊस') || h.includes('बारिश')) return t('hazardHeavyRain');
    if (h.includes('heat') || h.includes('उष्ण') || h.includes('गर्मी')) return t('hazardHeatwave');
    if (h.includes('thunder') || h.includes('lightning') || h.includes('वादळ') || h.includes('आंधी')) return t('hazardThunderstorm');
    if (h.includes('cyclone') || h.includes('चक्रीवादळ') || h.includes('तूफान')) return t('hazardCyclone');
    if (h.includes('fog') || h.includes('धुके') || h.includes('कोहरा')) return t('hazardFog');
    return hazard;
  };

  const translateCondition = (conditionText) => {
    if (!conditionText) return t('clearSky');
    const lower = String(conditionText).toLowerCase();
    if (lower.includes('thunder') || lower.includes('storm')) return t('thunderstorm');
    if (lower.includes('heavy rain') || lower.includes('downpour')) return t('heavyRain');
    if (lower.includes('light rain') || lower.includes('drizzle')) return t('lightRain');
    if (lower.includes('rain') || lower.includes('shower')) return t('moderateRain');
    if (lower.includes('fog')) return t('fog');
    if (lower.includes('mist') || lower.includes('haze')) return t('mist');
    if (lower.includes('overcast')) return t('overcast');
    if (lower.includes('partly') || lower.includes('scattered')) return t('partlyCloudy');
    if (lower.includes('sunny') || lower.includes('clear')) return t('sunny');
    return conditionText;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCondition,
        translateWarningLevel,
        translateHazard,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
