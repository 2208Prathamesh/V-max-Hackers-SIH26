import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Alert from '../models/Alert.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/weathergpt';

const RICH_ALERTS = [
  // =========================================================================
  // 1. OFFICIAL IMD WARNINGS (source: 'India Meteorological Department (IMD)')
  // =========================================================================
  {
    externalId: 'imd-red-ratnagiri-20260909',
    title: 'Red Alert: Extremely Heavy Rainfall & High Swell Waves',
    description: 'IMD Mumbai Regional Meteorological Centre issues Red Warning. Incessant heavy to very heavy rainfall exceeding 204.4mm in 24 hours expected in Konkan coastal belt. High swell waves up to 4.5 meters predicted along Ratnagiri and Sindhudurg coastline. Low-lying estuaries and floodplains vulnerable to tidal surges.',
    type: 'rain',
    severity: 'extreme',
    location: 'Ratnagiri, Maharashtra, India',
    latitude: 16.9902,
    longitude: 73.3120,
    startTime: new Date(Date.now() - 3600 * 1000 * 2),
    endTime: new Date(Date.now() + 3600 * 1000 * 36),
    region: 'Konkan Coast',
    probability: '95%',
    action: 'Avoid low-lying coastal stretches and ghat sections. Fishermen strictly prohibited from venturing into deep sea. Keep battery emergency lighting and village evacuation kit ready.',
    source: 'India Meteorological Department (IMD)',
    sourceType: 'official_alert',
    isOfficial: true,
    affectedAreas: ['Ratnagiri', 'Sindhudurg', 'Chiplun', 'Guhagar', 'Rajapur'],
    rawSourceUrl: 'https://mausam.imd.gov.in/imd_latest/contents/subdivisionwise-warning.php',
    issuedAt: new Date(Date.now() - 3600 * 1000 * 2),
    status: 'active',
    metadata: {
      warningLevel: 'Red',
      agency: 'IMD Mumbai — Regional Meteorological Centre',
      bulletinNo: 'RMC/MUM/WARN/0909',
      sourceType: 'official_imd'
    }
  },
  {
    externalId: 'imd-orange-pune-20260909',
    title: 'Orange Alert: Heavy to Very Heavy Rainfall in Western Ghats',
    description: 'IMD Pune Weather Forecasting Division issues Orange Warning for Pune district and adjacent Western Ghats. Rainfall intensity between 115.6mm to 204.4mm over next 48 hours. Inflow surges actively monitored at Khadakwasla, Pavana, and Mulshi dam reservoirs. Ghat causeways prone to rapid flash runoffs.',
    type: 'rain',
    severity: 'high',
    location: 'Pune, Maharashtra, India',
    latitude: 18.5204,
    longitude: 73.8567,
    startTime: new Date(Date.now() - 3600 * 1000 * 4),
    endTime: new Date(Date.now() + 3600 * 1000 * 48),
    region: 'Western Maharashtra Ghats',
    probability: '90%',
    action: 'Strictly avoid trekking and ghat driving (Lonavala, Mulshi, Varandha). Farmers advised to clear field drainage trenches in soybean and sugarcane plots.',
    source: 'India Meteorological Department (IMD)',
    sourceType: 'official_alert',
    isOfficial: true,
    affectedAreas: ['Pune', 'Lonavala', 'Mulshi', 'Bhor', 'Velhe', 'Khed'],
    rawSourceUrl: 'https://mausam.imd.gov.in',
    issuedAt: new Date(Date.now() - 3600 * 1000 * 4),
    status: 'active',
    metadata: {
      warningLevel: 'Orange',
      agency: 'IMD Pune Forecasting Division',
      bulletinNo: 'PUNE-GHAT-ORANGE-2026',
      sourceType: 'official_imd'
    }
  },
  {
    externalId: 'imd-orange-mumbai-20260909',
    title: 'Orange Alert: Severe Squall Winds & Coastal High Tide (4.2m)',
    description: 'IMD Colaba Coastal Warning: Gusty squall winds reaching 50 to 65 km/h along with intense intermittent downpours over Mumbai & Thane. Astronomical high tide of 4.22m predicted at 14:48 IST. Coastal water backflow risk across Marine Drive, Worli, and Dadar Shivaji Park sea front.',
    type: 'strong_wind',
    severity: 'high',
    location: 'Mumbai, Maharashtra, India',
    latitude: 19.0760,
    longitude: 72.8777,
    startTime: new Date(Date.now() - 3600 * 1000 * 3),
    endTime: new Date(Date.now() + 3600 * 1000 * 24),
    region: 'Mumbai Metropolitan Region',
    probability: '88%',
    action: 'Stay clear of sea promenades and rocky coastal beaches during high tide. Commuters advise checking local railway and suburban traffic updates before travel.',
    source: 'India Meteorological Department (IMD)',
    sourceType: 'official_alert',
    isOfficial: true,
    affectedAreas: ['Mumbai City', 'Mumbai Suburban', 'Thane', 'Navi Mumbai', 'Palghar'],
    rawSourceUrl: 'https://mausam.imd.gov.in',
    issuedAt: new Date(Date.now() - 3600 * 1000 * 3),
    status: 'active',
    metadata: {
      warningLevel: 'Orange',
      agency: 'IMD Colaba Coastal Observatory',
      tideHeight: '4.22m',
      sourceType: 'official_imd'
    }
  },
  {
    externalId: 'imd-yellow-aurangabad-20260909',
    title: 'Yellow Alert: Thunderstorm with Lightning & Gusty Winds',
    description: 'IMD Regional Meteorological Centre: Moderate convective thunderstorms accompanied by cloud-to-ground lightning and surface winds of 30-40 km/h across Marathwada plateau. Short spells of intense localized rainfall likely.',
    type: 'thunderstorm',
    severity: 'moderate',
    location: 'Chhatrapati Sambhajinagar, Maharashtra, India',
    latitude: 19.8762,
    longitude: 75.3433,
    startTime: new Date(Date.now() - 3600 * 1000 * 1),
    endTime: new Date(Date.now() + 3600 * 1000 * 20),
    region: 'Marathwada',
    probability: '75%',
    action: 'Do not seek shelter under isolated trees during thunderstorm. Unplug electric water pumps and sensitive agro-machinery starters.',
    source: 'India Meteorological Department (IMD)',
    sourceType: 'official_alert',
    isOfficial: true,
    affectedAreas: ['Chhatrapati Sambhajinagar', 'Jalna', 'Beed'],
    rawSourceUrl: 'https://mausam.imd.gov.in',
    issuedAt: new Date(Date.now() - 3600 * 1000 * 1),
    status: 'active',
    metadata: {
      warningLevel: 'Yellow',
      agency: 'IMD Met Centre Aurangabad',
      sourceType: 'official_imd'
    }
  },
  {
    externalId: 'imd-yellow-nagpur-20260909',
    title: 'Yellow Alert: Active Lightning & Convective Hail Threat',
    description: 'IMD Nagpur Doppler Radar detecting active cumulonimbus convective clusters moving eastward across Wardha, Nagpur, and Bhandara. Moderate hail probability in isolated pockets with lightning discharge frequency at 14 strikes/min.',
    type: 'lightning',
    severity: 'moderate',
    location: 'Nagpur, Maharashtra, India',
    latitude: 21.1458,
    longitude: 79.0882,
    startTime: new Date(Date.now() - 3600 * 1000 * 2),
    endTime: new Date(Date.now() + 3600 * 1000 * 18),
    region: 'Vidarbha',
    probability: '72%',
    action: 'Farmers in open fields must follow 30-30 lightning safety protocol. Shelter cattle in covered barns away from metal fence lines.',
    source: 'India Meteorological Department (IMD)',
    sourceType: 'official_alert',
    isOfficial: true,
    affectedAreas: ['Nagpur', 'Wardha', 'Bhandara', 'Gondia'],
    rawSourceUrl: 'https://mausam.imd.gov.in',
    issuedAt: new Date(Date.now() - 3600 * 1000 * 2),
    status: 'active',
    metadata: {
      warningLevel: 'Yellow',
      agency: 'IMD Meteorological Centre, Nagpur',
      sourceType: 'official_imd'
    }
  },
  {
    externalId: 'imd-red-odisha-20260909',
    title: 'Red Alert: Deep Depression Inundation & Coastal Gale Winds',
    description: 'IMD National Cyclone Warning Centre, New Delhi: Deep depression over northwest Bay of Bengal intensified, moving west-northwestwards. Torrential rains exceeding 250mm with gale wind speeds 65-75 km/h gusting to 85 km/h across coastal districts.',
    type: 'cyclone',
    severity: 'extreme',
    location: 'Puri, Odisha, India',
    latitude: 19.8135,
    longitude: 85.8312,
    startTime: new Date(Date.now() - 3600 * 1000 * 6),
    endTime: new Date(Date.now() + 3600 * 1000 * 48),
    region: 'Coastal Odisha & Bay of Bengal',
    probability: '96%',
    action: 'Total suspension of marine and fishing operations. Pre-position disaster relief teams and evacuate kuchcha dwellings in vulnerable storm surge zones.',
    source: 'India Meteorological Department (IMD)',
    sourceType: 'official_alert',
    isOfficial: true,
    affectedAreas: ['Puri', 'Jagatsinghpur', 'Kendrapara', 'Ganjam', 'Bhadrak'],
    rawSourceUrl: 'https://mausam.imd.gov.in',
    issuedAt: new Date(Date.now() - 3600 * 1000 * 6),
    status: 'active',
    metadata: {
      warningLevel: 'Red',
      agency: 'IMD National Cyclone Warning Centre, New Delhi',
      sourceType: 'official_imd'
    }
  },

  // =========================================================================
  // 2. WEATHERGPT AGI ANALYSIS (source: 'WeatherGPT AGI Deep Neural Weather Engine')
  // =========================================================================
  {
    externalId: 'agi-soil-saturation-junnar-20260909',
    title: 'AGI Analysis: Micro-Catchment Soil Saturation (94%) & Flash Flood Risk',
    description: 'WeatherGPT AGI Multi-Model Ensemble (ECMWF IFS + GFS 0.25° + Sentinel-1 SAR): High soil moisture index reaching 94.2% in Junnar and Ambegaon tehsils. Rapid overland runoff coefficient calculated at 0.88. Meena and Kukadi river tributaries projected to swell beyond danger threshold within 4 to 6 hours.',
    type: 'flood',
    severity: 'high',
    location: 'Junnar, Pune, Maharashtra, India',
    latitude: 19.2064,
    longitude: 73.8767,
    startTime: new Date(Date.now() - 3600 * 1000 * 1),
    endTime: new Date(Date.now() + 3600 * 1000 * 24),
    region: 'Kukadi River Catchment',
    probability: '92%',
    action: 'Clear silt from secondary agricultural drainage ditches. Relocate motorized irrigation pump sets from riverbed plinths immediately.',
    source: 'WeatherGPT AGI Deep Neural Weather Engine',
    sourceType: 'agi_analysis',
    isOfficial: false,
    affectedAreas: ['Junnar', 'Ambegaon', 'Otur', 'Narayangaon', 'Alephata'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 1),
    status: 'active',
    metadata: {
      confidence: '92.4%',
      models: ['ECMWF IFS', 'GFS 0.25', 'Doppler Radar K-band', 'Sentinel-1 SAR'],
      soilMoisture: '94.2%',
      runoffCoeff: '0.88',
      agiEngine: 'WeatherGPT AGI v4.2'
    }
  },
  {
    externalId: 'agi-crop-mildew-nashik-20260909',
    title: 'AGI Agro-Intelligence: High Downy Mildew & Fungal Spore Explosion Threat',
    description: 'WeatherGPT Autonomous Agro-AI: Microclimate sensors detect continuous canopy leaf wetness (>14 hours) combined with relative humidity at 96% and temperature 22.4°C. Perfect epidemiological threshold for Plasmopara viticola (Downy Mildew) in table and wine grape clusters across Niphad and Dindori.',
    type: 'rain',
    severity: 'high',
    location: 'Nashik, Maharashtra, India',
    latitude: 19.9975,
    longitude: 73.7898,
    startTime: new Date(Date.now() - 3600 * 1000 * 3),
    endTime: new Date(Date.now() + 3600 * 1000 * 36),
    region: 'Godavari Vineyard Belt',
    probability: '89%',
    action: 'Schedule preventative systemic copper-based or cymoxanil/mancozeb spraying immediately after canopy surface drying. Prune lower skirts to ensure canopy aeration.',
    source: 'WeatherGPT AGI Deep Neural Weather Engine',
    sourceType: 'agi_analysis',
    isOfficial: false,
    affectedAreas: ['Nashik', 'Niphad', 'Dindori', 'Pimpalgaon Baswant', 'Yeola'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 3),
    status: 'active',
    metadata: {
      confidence: '89.1%',
      diseaseIndex: 'Downy Mildew High Risk',
      leafWetnessHours: '14.2 hrs',
      humidity: '96%',
      cropType: 'Grape Orchards',
      agiEngine: 'WeatherGPT Agro-Neural v3.8'
    }
  },
  {
    externalId: 'agi-cloudburst-satara-20260909',
    title: 'AGI Deep Neural Nowcast: 86% Cloudburst Probability in Upper Ridge',
    description: 'WeatherGPT AGI Cloud Physics Model: INSAT-3DR Thermal IR band detects cloud top brightness temperature dropping abruptly to -72°C over Mahabaleshwar-Wai ridge. Hyper-localized convective updraft index indicates extreme high-density precipitation (>70mm/hr) between 16:00 and 19:30 IST.',
    type: 'thunderstorm',
    severity: 'extreme',
    location: 'Mahabaleshwar, Satara, Maharashtra, India',
    latitude: 17.9237,
    longitude: 73.6586,
    startTime: new Date(Date.now() - 3600 * 1000 * 1),
    endTime: new Date(Date.now() + 3600 * 1000 * 12),
    region: 'Sahyadri High Ridgeline',
    probability: '86%',
    action: 'Halt all vehicular traffic on Pasarni Ghat and Ambenali Ghat. Pre-position emergency earthmoving backhoes near designated rockfall hazard zones.',
    source: 'WeatherGPT AGI Deep Neural Weather Engine',
    sourceType: 'agi_analysis',
    isOfficial: false,
    affectedAreas: ['Mahabaleshwar', 'Wai', 'Panchgani', 'Jawali'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 1),
    status: 'active',
    metadata: {
      confidence: '86.5%',
      cloudTopTemp: '-72°C',
      updraftVelocity: '28 m/s',
      modelSource: 'INSAT-3DR + Doppler Radar Mesh',
      agiEngine: 'WeatherGPT Cloud-Physics DeepNet'
    }
  },
  {
    externalId: 'agi-crop-heat-solapur-20260909',
    title: 'AGI Crop Stress Warning: Acute Thermal Radiation & ET0 Spike (8.2 mm/day)',
    description: 'WeatherGPT AGI Biosphere Engine: Solar irradiance reaching 980 W/m² with vapor pressure deficit (VPD) > 3.4 kPa in Barshi, Mohol, and Karmala. Sugarcane and pomegranate orchards entering high water-stress transpiration shock with leaf curling observed.',
    type: 'heatwave',
    severity: 'moderate',
    location: 'Solapur, Maharashtra, India',
    latitude: 17.6599,
    longitude: 75.9064,
    startTime: new Date(Date.now() - 3600 * 1000 * 5),
    endTime: new Date(Date.now() + 3600 * 1000 * 30),
    region: 'Southern Marathwada & Solapur Plains',
    probability: '91%',
    action: 'Apply pulse drip irrigation during nighttime hours. Apply 5% kaolin foliar spray on pomegranate tree canopy to reflect excess thermal radiation.',
    source: 'WeatherGPT AGI Deep Neural Weather Engine',
    sourceType: 'agi_analysis',
    isOfficial: false,
    affectedAreas: ['Solapur', 'Barshi', 'Mohol', 'Pandharpur', 'Karmala'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 5),
    status: 'active',
    metadata: {
      confidence: '91.0%',
      vpdKPa: '3.45 kPa',
      et0Rate: '8.2 mm/day',
      cropStressLevel: 'Severe',
      agiEngine: 'WeatherGPT Biosphere Model'
    }
  },
  {
    externalId: 'agi-panchganga-kolhapur-20260909',
    title: 'AGI Hydrological Model: Panchganga River Projected to Touch 39 ft Warning Level',
    description: 'WeatherGPT AGI Watershed Simulation: Upstream catchment inflow from Radhanagari (100% full capacity) and continuous 120mm rainfall in Gaganbawda will push Panchganga river water level at Rajaram Barrage to 39.4 ft by 06:00 IST tomorrow.',
    type: 'flood',
    severity: 'high',
    location: 'Kolhapur, Maharashtra, India',
    latitude: 16.7050,
    longitude: 74.2433,
    startTime: new Date(Date.now() - 3600 * 1000 * 2),
    endTime: new Date(Date.now() + 3600 * 1000 * 40),
    region: 'Panchganga Basin',
    probability: '94%',
    action: 'Residents in floodplains (Shahupuri, Kumbhar Galli, Shirol) must safeguard documents and prepare for evacuation to designated community shelters.',
    source: 'WeatherGPT AGI Deep Neural Weather Engine',
    sourceType: 'agi_analysis',
    isOfficial: false,
    affectedAreas: ['Kolhapur', 'Shirol', 'Hatkanangale', 'Karveer'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 2),
    status: 'active',
    metadata: {
      confidence: '94.3%',
      barrageGaugeTarget: '39.4 ft',
      warningLevel: '39 ft',
      dangerLevel: '43 ft',
      agiEngine: 'WeatherGPT Hydro-Dynamic v2'
    }
  },

  // =========================================================================
  // 3. APP AUTHORITY / DISASTER OPERATIONS (source: 'District Disaster Management Authority (DDMA)')
  // =========================================================================
  {
    externalId: 'auth-khadakwasla-dam-20260909',
    title: 'Authority Directive: Khadakwasla Dam Spillway Discharge of 22,500 Cusecs',
    description: 'Issued by Executive Engineer, Khadakwasla Dam Division & Pune District Collectorate: Water discharge from Khadakwasla spillway increased from 11,200 to 22,500 cusecs starting 20:30 IST today due to heavy ghat inflows. Water level in Mutha riverbed rising rapidly. Bhide Bridge and riverbed connecting roads submerged.',
    type: 'flood',
    severity: 'high',
    location: 'Pune, Maharashtra, India',
    latitude: 18.4419,
    longitude: 73.7634,
    startTime: new Date(Date.now() - 3600 * 1000 * 1),
    endTime: new Date(Date.now() + 3600 * 1000 * 24),
    region: 'Mutha River Basin',
    probability: '100%',
    action: 'General public and motorists strictly prohibited from entering low-lying riverbank roads (Bhide Pool, Deccan Gymkhana, Baba Bhide causeway). Move vehicles parked in riverbed to high ground immediately.',
    source: 'District Disaster Management Authority (DDMA) & Irrigation Dept',
    sourceType: 'authority_broadcast',
    isOfficial: true,
    affectedAreas: ['Pune City', 'Deccan Gymkhana', 'Sinhagad Road', 'Khadakwasla', 'Haveli'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 1),
    status: 'active',
    metadata: {
      orderNo: 'DDMA/PUNE/DAM-REL/2026/412',
      issuingOfficer: 'District Disaster Management Authority & Irrigation Dept',
      verifiedAuthority: true,
      emergencyPhone: '020-26123371'
    }
  },
  {
    externalId: 'auth-raigad-ghat-closure-20260909',
    title: 'Authority Order: Tamhini & Varandha Ghats Closed for Heavy Commercial Vehicles',
    description: 'District Collector & Chairman DDMA Raigad: In exercise of powers under Disaster Management Act 2005, Tamhini Ghat (SH-60) and Varandha Ghat (NH-965DD) are closed for all multi-axle trucks, private buses, and tourist vehicles from 18:00 to 06:00 IST due to recurrent rockfall incidents and dense zero-visibility fog.',
    type: 'strong_wind',
    severity: 'high',
    location: 'Raigad, Maharashtra, India',
    latitude: 18.5158,
    longitude: 73.1822,
    startTime: new Date(Date.now() - 3600 * 1000 * 3),
    endTime: new Date(Date.now() + 3600 * 1000 * 36),
    region: 'Northern Konkan Ghat Passes',
    probability: '100%',
    action: 'Use alternative route via Mumbai-Pune Expressway or Khopoli-Pali route. Local emergency crane & JCB deployed at km 44 for immediate debris clearing.',
    source: 'District Disaster Management Authority (DDMA) & Raigad Collectorate',
    sourceType: 'authority_broadcast',
    isOfficial: true,
    affectedAreas: ['Raigad', 'Mangaon', 'Mahad', 'Roha', 'Poladpur'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 3),
    status: 'active',
    metadata: {
      orderNo: 'RAIGAD-DISASTER-ORD-88',
      issuingOfficer: 'District Magistrate & Collector Raigad',
      verifiedAuthority: true,
      emergencyPhone: '1077'
    }
  },
  {
    externalId: 'auth-coastal-fisheries-ban-20260909',
    title: 'Authority Mandate: Total Prohibition on Sea Navigation & Coastal Fishing',
    description: 'Department of Fisheries, Government of Maharashtra: All mechanized trawlers and purse-seine fishing crafts instructed to return to harbour or anchor in sheltered creeks. Coast Guard and Marine Police deployed to enforce sea perimeter under rough sea conditions.',
    type: 'other',
    severity: 'extreme',
    location: 'Mumbai Coast, Maharashtra, India',
    latitude: 18.9220,
    longitude: 72.8347,
    startTime: new Date(Date.now() - 3600 * 1000 * 4),
    endTime: new Date(Date.now() + 3600 * 1000 * 48),
    region: 'Maharashtra Coastal Waters (Zone 1 to 4)',
    probability: '100%',
    action: 'No vessel shall breach harbor locks until green clearance is signaled by Port Officer. Coastal fishermen can verify harbor safety status at 022-22614138.',
    source: 'State Disaster Management Authority & Fisheries Commissionerate',
    sourceType: 'authority_broadcast',
    isOfficial: true,
    affectedAreas: ['Mumbai', 'Sassoon Docks', 'Versova', 'Malvan', 'Alibaug', 'Dahanu'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 4),
    status: 'active',
    metadata: {
      orderNo: 'FISH-MAR-BAN-2026/09',
      issuingOfficer: 'Commissioner of Fisheries, Govt of Maharashtra',
      verifiedAuthority: true,
      emergencyPhone: '022-22614138'
    }
  },
  {
    externalId: 'auth-school-holiday-pune-20260909',
    title: 'Authority Advisory: Precautionary Holiday for Primary Schools in Bhor & Velhe',
    description: 'Office of the District Collector & District Education Officer: In view of red/orange rainfall warnings and overflowing stream causeways, all Zilla Parishad and private primary schools in Bhor, Velhe, and Mulshi tehsils shall observe holiday tomorrow.',
    type: 'other',
    severity: 'moderate',
    location: 'Bhor, Pune, Maharashtra, India',
    latitude: 18.1631,
    longitude: 73.8441,
    startTime: new Date(Date.now() - 3600 * 1000 * 5),
    endTime: new Date(Date.now() + 3600 * 1000 * 24),
    region: 'Pune Rural Tehsils',
    probability: '100%',
    action: 'Parents advised not to send children across stream crossings. Secondary schools to operate under discretionary local headmaster evaluation.',
    source: 'District Administration & Education Directorate',
    sourceType: 'authority_broadcast',
    isOfficial: true,
    affectedAreas: ['Bhor', 'Velhe', 'Mulshi', 'Khed-Shivapur'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 5),
    status: 'active',
    metadata: {
      orderNo: 'EDU-WEATHER-HOLIDAY-0909',
      issuingOfficer: 'Collector & District Magistrate, Pune',
      verifiedAuthority: true,
      emergencyPhone: '020-26123371'
    }
  },
  {
    externalId: 'auth-sdrf-deployment-sangli-20260909',
    title: 'Authority Deployment: SDRF Flood Rescue Columns Mobilized in Sangli & Karad',
    description: 'Maharashtra State Disaster Management Authority (SDMA): Two specialized flood rescue columns of SDRF (5th Bn) equipped with inflatable motor boats, satellite comms, and rescue divers stationed at Walwa and Karad tehsils along Krishna river basin as precautionary readiness.',
    type: 'flood',
    severity: 'high',
    location: 'Sangli, Maharashtra, India',
    latitude: 16.8524,
    longitude: 74.5815,
    startTime: new Date(Date.now() - 3600 * 1000 * 3),
    endTime: new Date(Date.now() + 3600 * 1000 * 48),
    region: 'Krishna River Basin',
    probability: '100%',
    action: 'Villagers in floodplain areas can report water ingress to 24/7 District Emergency Control Room (1077 or 1070).',
    source: 'State Disaster Management Authority (SDMA)',
    sourceType: 'authority_broadcast',
    isOfficial: true,
    affectedAreas: ['Sangli', 'Karad', 'Walwa', 'Shirala', 'Miraj'],
    rawSourceUrl: null,
    issuedAt: new Date(Date.now() - 3600 * 1000 * 3),
    status: 'active',
    metadata: {
      orderNo: 'SDMA-SDRF-DEP-2026-14',
      issuingOfficer: 'Relief & Rehabilitation Department, Mantralaya',
      verifiedAuthority: true,
      emergencyPhone: '1070'
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for rich alerts synchronization...');

    // Upsert each alert by externalId to prevent duplication
    for (const alertData of RICH_ALERTS) {
      await Alert.findOneAndUpdate(
        { externalId: alertData.externalId },
        { $set: alertData },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      console.log(`Synced: [${alertData.sourceType.toUpperCase()}] ${alertData.title}`);
    }

    // Clean up older duplicate test alerts where externalId contains odisha duplicates except the current one
    const keepOdishaId = 'imd-red-odisha-20260909';
    await Alert.deleteMany({
      $or: [
        { externalId: { $regex: /^urn:oid:.*:odisha$/i } },
        { externalId: null, location: /odisha/i }
      ],
      externalId: { $ne: keepOdishaId }
    });

    console.log('Cleanup of legacy duplicate records finished.');

    const count = await Alert.countDocuments();
    console.log(`Total alerts in database: ${count}`);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
