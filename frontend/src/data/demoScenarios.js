/**
 * DEMO SCENARIO ENGINE — Smart India Hackathon Prototype
 * 
 * Provides deterministic, technically consistent scenario data for judging demonstrations.
 * Distinguishes clearly between LIVE operational feeds and DEMO scenarios.
 */

export const DEMO_SCENARIOS = {
  heavy_rain: {
    id: 'heavy_rain',
    name: 'Monsoon Flash Flood & Inundation',
    region: 'Mumbai Metropolitan Region & Konkan',
    badge: 'DEMO SCENARIO: HEAVY RAIN',
    badgeColor: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
    summary: {
      activeAlerts: 6,
      criticalAlerts: 3,
      affectedDistricts: 4,
      usersNotified: '48,200',
      riskScore: 88,
      riskLevel: 'CRITICAL'
    },
    currentSituation: {
      headline: 'Severe Monsoon Depression Driving Coastal Inundation & Rail Disruption',
      hazard: 'Extreme Heavy Rainfall (142 mm / 24h) & Coastal Surge',
      severity: 'extreme',
      observedAt: 'Live Scenario Telemetry',
      keyMetrics: [
        { label: 'Rainfall Rate', value: '48 mm/hr', status: 'critical' },
        { label: 'Peak Wind Gust', value: '58 km/h', status: 'warning' },
        { label: 'High Tide Height', value: '4.38 m', status: 'critical' },
        { label: 'River Discharge', value: '+185% vs normal', status: 'critical' }
      ]
    },
    priorityAreas: [
      {
        district: 'Mumbai Suburban',
        risk: 'CRITICAL',
        riskColor: 'bg-red-600 text-white',
        population: '9.3M',
        primaryThreat: 'Kurla & Hindmata low-lying waterlogging; Harbour line suspended',
        actionRequired: 'NDRF teams 1 & 2 dispatched; activate 120 dewatering pumps'
      },
      {
        district: 'Thane',
        risk: 'HIGH',
        riskColor: 'bg-orange-500 text-white',
        population: '2.4M',
        primaryThreat: 'Ulhas river cresting 0.3m below danger mark; highway diversions',
        actionRequired: 'Deploy SDRF flood rescue boats; halt heavy vehicular movement'
      },
      {
        district: 'Raigad',
        risk: 'HIGH',
        riskColor: 'bg-orange-500 text-white',
        population: '1.8M',
        primaryThreat: 'Ghat section landslide hazard (Poladpur & Mahad)',
        actionRequired: 'Close scenic ghat passes to recreational traffic; monitor telemetry'
      },
      {
        district: 'Ratnagiri',
        risk: 'MODERATE',
        riskColor: 'bg-amber-500 text-slate-950',
        population: '1.6M',
        primaryThreat: 'High wave warning (3.8m swell) for coastal fishing communities',
        actionRequired: 'Total ban on artisanal and mechanized fishing boat departures'
      }
    ],
    timelineTransitions: [
      {
        time: '14:00 (T+0)',
        title: 'Intense Convective Band Landfall',
        desc: 'Doppler radar shows dense reflectivity core (48–52 dBZ) moving over South Mumbai.',
        badge: 'RAIN SURGE',
        badgeColor: 'bg-red-500/20 text-red-600'
      },
      {
        time: '16:30 (T+2.5h)',
        title: 'High Tide (4.38m) Inundation Peak',
        desc: 'Mithi river sluice gates closed due to sea level. Gravity drainage ceases completely.',
        badge: 'DRAINAGE LOCK',
        badgeColor: 'bg-rose-500/20 text-rose-600'
      },
      {
        time: '19:15 (T+5h)',
        title: 'Convective Relaxation & Tide Ebb',
        desc: 'Rainfall transitions to intermittent light-to-moderate showers. Sluice gates reopen.',
        badge: 'RECEDING',
        badgeColor: 'bg-emerald-500/20 text-emerald-600'
      }
    ],
    impactAndCascade: [
      {
        sector: 'Urban Transport & Transit',
        level: 'Severe Disruption',
        detail: 'Central railway slow corridor submerged at Sion; Western railway operating with 20-min headway. Airport primary runway active with CAT-I ILS.'
      },
      {
        sector: 'Power Infrastructure',
        level: 'Elevated Risk',
        detail: 'Substation at Kurla East sandbagged; preventive feeder shutdown ready if water reaches 0.5m threshold.'
      },
      {
        sector: 'Public Safety & Schools',
        level: 'Immediate Action Taken',
        detail: 'District Collector issued afternoon school dispersion advisory; non-essential government offices shifted to remote status.'
      }
    ],
    recommendedActions: [
      { id: 1, action: 'Broadcast Cell Broadcast Warning (CAP) to Konkan subscribers', priority: 'Immediate' },
      { id: 2, action: 'Position 3 SDRF inflatable rescue units at Ulhasnagar & Mahad', priority: 'Immediate' },
      { id: 3, action: 'Synchronize high-capacity pumps with 16:30 high-tide timeline', priority: 'Next 60 min' },
      { id: 4, action: 'Coordinate with BEST/MSRTC for high-ground evacuation bus corridors', priority: 'Standing' }
    ]
  },

  heat_wave: {
    id: 'heat_wave',
    name: 'Severe Heatwave & Thermal Stress',
    region: 'Vidarbha & Marathwada Corridor',
    badge: 'DEMO SCENARIO: SEVERE HEATWAVE',
    badgeColor: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
    summary: {
      activeAlerts: 5,
      criticalAlerts: 2,
      affectedDistricts: 6,
      usersNotified: '62,800',
      riskScore: 82,
      riskLevel: 'SEVERE'
    },
    currentSituation: {
      headline: 'Extreme Heatwave Triggering Dangerous Thermal Index and Crop Desiccation',
      hazard: 'Maximum Surface Temperature 46.2°C (+5.4°C Anomaly)',
      severity: 'extreme',
      observedAt: 'Live Scenario Telemetry',
      keyMetrics: [
        { label: 'Max Surface Temp', value: '46.2 °C', status: 'critical' },
        { label: 'Heat Index (Apparent)', value: '49.8 °C', status: 'critical' },
        { label: 'Relative Humidity', value: '18 %', status: 'warning' },
        { label: 'Nocturnal Min Temp', value: '31.4 °C', status: 'critical' }
      ]
    },
    priorityAreas: [
      {
        district: 'Chandrapur',
        risk: 'CRITICAL',
        riskColor: 'bg-red-600 text-white',
        population: '2.2M',
        primaryThreat: 'Thermal anomaly 46.2°C; industrial zone cooling stress; heat stroke admissions up 40%',
        actionRequired: 'Operationalize 24/7 cooling centers; mandate halt to coal open-cast operations 11:30–16:00'
      },
      {
        district: 'Nagpur',
        risk: 'CRITICAL',
        riskColor: 'bg-red-600 text-white',
        population: '4.6M',
        primaryThreat: 'Urban heat island effect amplifying core temperature to 45.8°C; high water demand',
        actionRequired: 'Deploy municipal misting tankers along transit hubs; hospital ORS replenishment'
      },
      {
        district: 'Akola',
        risk: 'HIGH',
        riskColor: 'bg-orange-500 text-white',
        population: '1.8M',
        primaryThreat: 'Severe soil moisture deficit; cotton and soybean seedling desiccation warning',
        actionRequired: 'Issue micro-irrigation and mulching advisories to Krishi Vigyan Kendras'
      },
      {
        district: 'Wardha',
        risk: 'HIGH',
        riskColor: 'bg-orange-500 text-white',
        population: '1.3M',
        primaryThreat: 'Livestock dehydration and heat prostration in rural dairy clusters',
        actionRequired: 'Setup livestock shading stations with subsidized electrolyte troughs'
      }
    ],
    timelineTransitions: [
      {
        time: '11:30 (T+0)',
        title: 'Thermal Index Threshold Exceeded',
        desc: 'Wet-bulb globe temperature reaches 32.5°C (Extreme Warning). Outdoor labor hazard alert.',
        badge: 'HEAT SPIKE',
        badgeColor: 'bg-orange-500/20 text-orange-600'
      },
      {
        time: '14:30 (T+3h)',
        title: 'Peak Solar Radiation (960 W/m²)',
        desc: 'Maximum daily temperature peaks at 46.2°C. Power grid load surges to 28,400 MW.',
        badge: 'PEAK LOAD',
        badgeColor: 'bg-red-500/20 text-red-600'
      },
      {
        time: '19:00 (T+7.5h)',
        title: 'Night Thermal Trapping',
        desc: 'Nocturnal cooling retarded by dry haze. Night minimum projected at 31.4°C.',
        badge: 'NOCTURNAL STRESS',
        badgeColor: 'bg-amber-500/20 text-amber-600'
      }
    ],
    impactAndCascade: [
      {
        sector: 'Healthcare & Public Health',
        level: 'Code Orange Hospital Alert',
        detail: 'District Civil Hospitals activated dedicated Heat Stroke Units with ice baths and IV fluids. 38 cases treated in last 24 hours.'
      },
      {
        sector: 'Agriculture & Livestock',
        level: 'Extreme Desiccation',
        detail: 'Surface soil evaporation rate at 11 mm/day. Unirrigated nursery seedlings face 30% mortality without immediate evening wetting.'
      },
      {
        sector: 'Energy & Water Grid',
        level: 'Peak Demand Stress',
        detail: 'Continuous commercial and residential AC usage causing distribution transformer thermal overload alerts in Nagpur urban ring.'
      }
    ],
    recommendedActions: [
      { id: 1, action: 'Enforce ban on non-emergency outdoor labor between 11:30 AM and 4:30 PM', priority: 'Immediate' },
      { id: 2, action: 'Mobilize 45 municipal water tankers to water-scarce bastis and slums', priority: 'Immediate' },
      { id: 3, action: 'Direct Krishi extension officers to broadcast drip-irrigation schedules', priority: 'Standing' },
      { id: 4, action: 'Ensure power utilities avoid scheduled maintenance outages during daytime', priority: 'Operational' }
    ]
  },

  severe_storm: {
    id: 'severe_storm',
    name: 'Squall Line & Lightning Emergency',
    region: 'Pune, Satara & Western Ghats Foothills',
    badge: 'DEMO SCENARIO: SEVERE SQUALL',
    badgeColor: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    summary: {
      activeAlerts: 4,
      criticalAlerts: 2,
      affectedDistricts: 3,
      usersNotified: '34,500',
      riskScore: 76,
      riskLevel: 'HIGH'
    },
    currentSituation: {
      headline: 'Severe Multicell Convective Thunderstorm with Dangerous Cloud-to-Ground Lightning',
      hazard: 'Severe Thunderstorm, Squall (68 km/h) & Lightning Activity',
      severity: 'high',
      observedAt: 'Live Scenario Telemetry',
      keyMetrics: [
        { label: 'Lightning Rate', value: '142 strikes/min', status: 'critical' },
        { label: 'Gust Front Speed', value: '68 km/h', status: 'critical' },
        { label: 'Radar Reflectivity', value: '54 dBZ', status: 'critical' },
        { label: 'Hail Probability', value: '65% (1.5–2cm)', status: 'warning' }
      ]
    },
    priorityAreas: [
      {
        district: 'Pune District',
        risk: 'CRITICAL',
        riskColor: 'bg-red-600 text-white',
        population: '7.2M',
        primaryThreat: 'High-density lightning cluster over Haveli & Pimpri-Chinchwad; tree fall hazards',
        actionRequired: 'Broadcast instant lightning sirens via Smart City PA system; ground ground operations'
      },
      {
        district: 'Satara',
        risk: 'HIGH',
        riskColor: 'bg-orange-500 text-white',
        population: '3.0M',
        primaryThreat: 'Hail strike threatening standing pomegranate and table grape plantations in Phaltan',
        actionRequired: 'Issue anti-hail net alerts to farmer FPOs; standby agricultural damage assessors'
      },
      {
        district: 'Kolhapur',
        risk: 'MODERATE',
        riskColor: 'bg-amber-500 text-slate-950',
        population: '3.8M',
        primaryThreat: 'Sudden squall winds impacting lake & reservoir fishing boats and billboard structures',
        actionRequired: 'Direct municipal teams to inspect overhead hoardings; harbor boat recall'
      }
    ],
    timelineTransitions: [
      {
        time: '15:15 (T+0)',
        title: 'Gust Front Arrival',
        desc: 'Cold outflow boundary reaches Western Pune outskirts with sudden wind veer and 68 km/h gusts.',
        badge: 'GUST ONSET',
        badgeColor: 'bg-purple-500/20 text-purple-600'
      },
      {
        time: '15:45 (T+30m)',
        title: 'Peak Lightning Density & Microburst',
        desc: '142 flashes/minute recorded on IMD lightning detection network. Localized 2cm hail at Kothrud.',
        badge: 'LIGHTNING PEAK',
        badgeColor: 'bg-red-500/20 text-red-600'
      },
      {
        time: '17:15 (T+2h)',
        title: 'Convective Cell Dissipation',
        desc: 'Thunderstorm transitions eastward towards Ahmednagar border, intensity down to 22 dBZ.',
        badge: 'CLEARING',
        badgeColor: 'bg-emerald-500/20 text-emerald-600'
      }
    ],
    impactAndCascade: [
      {
        sector: 'Aviation & Transit',
        level: 'Ground Stop Active',
        detail: 'Pune Airport (VAPO) issued 35-min ramp freeze due to lightning within 5km radius. 4 flights in holding pattern.'
      },
      {
        sector: 'Power Grid Infrastructure',
        level: 'Local Outages',
        detail: '11kV feeder tripped in Shivaji Nagar due to tree limb impact. MSEDCL emergency crews dispatched.'
      },
      {
        sector: 'Agricultural Horticulture',
        level: 'Hail Impact',
        detail: 'Phaltan taluka reports minor hail damage to uncovered grape bunches. Net-covered plots protected.'
      }
    ],
    recommendedActions: [
      { id: 1, action: 'Send Damini Lightning Warning to active mobile towers in 15km radar radius', priority: 'Immediate' },
      { id: 2, action: 'Halt all outdoor sports and construction work until 30 minutes after last thunder', priority: 'Immediate' },
      { id: 3, action: 'Scramble fire brigade tree-clearing rapid response squads', priority: 'Standing' },
      { id: 4, action: 'Notify airport ATC and metro control of expected squall dissipation by 17:15', priority: 'Operational' }
    ]
  }
}
