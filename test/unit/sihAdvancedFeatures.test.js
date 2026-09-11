import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  parseMetar,
  classifyFlightRules,
  calculateCrosswind
} from '../../backend/src/services/aviation/aviationService.js'

import {
  classifyBeaufort,
  determinePortSignal,
  getFishermenSafetyVerdict
} from '../../backend/src/services/marine/marineService.js'

import {
  calculateFloodIndex,
  CITY_PROFILES
} from '../../backend/src/services/urban/urbanFloodService.js'

import {
  generateCapXml,
  generateCapJson
} from '../../backend/src/services/cap/capService.js'

describe('SIH 2026 Advanced Features - Aviation Engine', () => {
  it('parses standard METAR string correctly', () => {
    const raw = 'VABB 101200Z 24012KT 6000 FEW020 BKN080 29/24 Q1008 NOSIG'
    const result = parseMetar(raw)
    assert.equal(result.station, 'VABB')
    assert.equal(result.wind?.direction, 240)
    assert.equal(result.wind?.speed, 12)
    assert.equal(result.visibility?.value, 6000)
    assert.equal(result.temperature, 29)
    assert.equal(result.dewpoint, 24)
    assert.equal(result.pressure?.qnh, 1008)
  })

  it('classifies flight rules according to FAA/ICAO thresholds', () => {
    // VFR: ceiling > 3000ft and vis > 5 SM (8000m)
    assert.equal(classifyFlightRules(10000, 5000), 'VFR')
    // MVFR: ceiling 1000-3000ft or vis 3-5 SM (4800-8000m)
    assert.equal(classifyFlightRules(6000, 2500), 'MVFR')
    // IFR: ceiling 500-1000ft or vis 1-3 SM (1600-4800m)
    assert.equal(classifyFlightRules(3000, 800), 'IFR')
    // LIFR: ceiling < 500ft or vis < 1 SM (1600m)
    assert.equal(classifyFlightRules(1000, 400), 'LIFR')
  })

  it('calculates runway crosswind and headwind trigonometry', () => {
    // Wind 240 deg at 20 knots, Runway heading 270 deg (Runway 27)
    // Angle diff = 30 deg -> crosswind = 20 * sin(30) = 10 knots
    const wind = calculateCrosswind(240, 20, 270)
    assert.equal(wind.crosswind, 10)
    assert.ok(wind.headwind >= 17)
  })
})

describe('SIH 2026 Advanced Features - Marine & Coastal Safety Engine', () => {
  it('classifies Beaufort wind scale accurately', () => {
    // 0 km/h -> Calm (Force 0)
    assert.equal(classifyBeaufort(0).force, 0)
    // 15 km/h ≈ 8 knots -> Gentle Breeze (Force 3)
    assert.equal(classifyBeaufort(15).force, 3)
    // 45 km/h ≈ 24 knots -> Strong Breeze (Force 6)
    assert.equal(classifyBeaufort(45).force, 6)
    // 100 km/h ≈ 54 knots -> Storm (Force 10)
    assert.equal(classifyBeaufort(100).force, 10)
  })

  it('determines Indian Maritime Port Danger Signals (1-11)', () => {
    // Normal / Calm conditions -> null
    assert.equal(determinePortSignal(0.3, 10), null)
    // Wave height 1.8m -> Signal 2
    const s2 = determinePortSignal(1.8, 15)
    assert.ok(s2)
    assert.equal(s2.signal, 2)
    // Gale force winds 65 km/h -> Signal 7
    const s7 = determinePortSignal(3.0, 70)
    assert.ok(s7)
    assert.equal(s7.signal, 7)
    // Super cyclone winds > 166 km/h -> Signal 10
    const s10 = determinePortSignal(6.0, 180)
    assert.ok(s10)
    assert.equal(s10.signal, 10)
  })

  it('provides reliable fishermen safety verdicts', () => {
    // Calm sea
    const safe = getFishermenSafetyVerdict(0.8, 12)
    assert.equal(safe.status, 'SAFE')

    // Moderate sea
    const caution = getFishermenSafetyVerdict(1.8, 25)
    assert.equal(caution.status, 'CAUTION')

    // Rough sea
    const warn = getFishermenSafetyVerdict(2.8, 38)
    assert.equal(warn.status, 'WARNING')

    // Dangerous sea
    const danger = getFishermenSafetyVerdict(4.5, 55)
    assert.equal(danger.status, 'DANGER')
  })
})

describe('SIH 2026 Advanced Features - Urban Flash Flood Engine', () => {
  it('calculates rational runoff and saturation for Mumbai', () => {
    const res = calculateFloodIndex(40, 'mumbai')
    assert.equal(res.city, 'Mumbai')
    assert.equal(res.rainfallIntensityMmh, 40)
    // C = 0.85, elevationRisk = 1.3, Q = 0.85 * 40 * 1.3 = 44.2 mm/hr
    assert.equal(res.computedRunoff, 44.2)
    // Drain capacity = 25 mm/hr, Saturation ratio = 44.2 / 25 = 1.77 (> 1.2 => Severe)
    assert.equal(res.saturationRatio, 1.77)
    assert.equal(res.saturation.level, 'Severe')
    assert.ok(res.estimatedWaterlogDepthCm > 0)
    assert.ok(res.activeHotspots.length > 0)
  })

  it('supports known Indian metros in CITY_PROFILES', () => {
    const metros = ['mumbai', 'delhi', 'pune', 'bengaluru', 'chennai', 'kolkata']
    metros.forEach((m) => {
      assert.ok(CITY_PROFILES[m], `Metro profile for ${m} should exist`)
      assert.ok(CITY_PROFILES[m].hotspots.length > 0, `${m} should have vulnerable hotspots listed`)
    })
  })
})

describe('SIH 2026 Advanced Features - CAP v1.2 Engine', () => {
  const mockAlert = {
    _id: '65f123456789abcdef012345',
    title: 'Severe Flash Flood Warning',
    description: 'Extremely heavy rainfall causing urban waterlogging.',
    severity: 'extreme',
    areas: [
      { name: 'Mumbai', coordinates: { lat: 19.08, lng: 72.88 } }
    ],
    source: 'WeatherGPT Multi-Model Engine',
    instruction: 'Avoid all travel through low-lying areas.',
    createdAt: new Date('2026-09-10T12:00:00Z'),
    expiresAt: new Date('2026-09-11T12:00:00Z')
  }

  it('generates valid ITU / OASIS CAP v1.2 XML', () => {
    const xml = generateCapXml(mockAlert)
    assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'))
    assert.ok(xml.includes('xmlns="urn:oasis:names:tc:emergency:cap:1.2"'))
    assert.ok(xml.includes('<identifier>65f123456789abcdef012345</identifier>'))
    assert.ok(xml.includes('<severity>Extreme</severity>'))
    assert.ok(xml.includes('<event>Severe Flash Flood Warning</event>'))
    assert.ok(xml.includes('<areaDesc>Mumbai</areaDesc>'))
  })

  it('generates standard CAP JSON format', () => {
    const json = generateCapJson(mockAlert)
    assert.equal(json.identifier, '65f123456789abcdef012345')
    assert.equal(json.status, 'Actual')
    assert.equal(json.info[0].severity, 'Extreme')
    assert.equal(json.info[0].area[0].areaDesc, 'Mumbai')
  })
})
