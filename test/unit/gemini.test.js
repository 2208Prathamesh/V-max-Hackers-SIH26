import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildGroundedContextPrompt,
  SYSTEM_INSTRUCTION
} from '../../backend/src/services/ai/promptTemplates.js'
import { generateGeminiWeatherResponse } from '../../backend/src/services/ai/geminiService.js'

test('Unit: Gemini AI Grounded Meteorological Engine', async t => {
  await t.test(
    'SYSTEM_INSTRUCTION should enforce strict grounding and forbid hallucinated metrics',
    () => {
      assert.match(SYSTEM_INSTRUCTION, /WeatherGPT/)
      assert.match(SYSTEM_INSTRUCTION, /NEVER invent/i)
      assert.match(SYSTEM_INSTRUCTION, /Multilingual/i)
    }
  )

  await t.test(
    'buildGroundedContextPrompt should format verified metrics into structured context',
    () => {
      const prompt = buildGroundedContextPrompt({
        location: 'Pune, Maharashtra, India',
        currentWeather: {
          temperature: 27.5,
          apparentTemperature: 28.2,
          humidity: 70,
          windSpeed: 15,
          weatherDescription: 'Moderate Rain'
        },
        forecastDaily: [
          {
            date: '2026-08-28',
            maxTemperature: 29,
            minTemperature: 22,
            precipitationProbability: 80
          }
        ],
        imdWarning: {
          hasActiveWarning: true,
          warningLevel: 'Orange',
          action: 'Be Prepared',
          hazard: 'Heavy rainfall'
        },
        language: 'en'
      })

      assert.ok(prompt.includes('Pune, Maharashtra, India'))
      assert.ok(prompt.includes('27.5°C'))
      assert.ok(prompt.includes('Orange Alert'))
      assert.ok(prompt.includes('Rain Prob: 80%'))
    }
  )

  await t.test(
    'buildGroundedContextPrompt should preserve source-aware synthesis rules',
    () => {
      const prompt = buildGroundedContextPrompt({
        location: 'Pune',
        currentWeather: {
          source: 'IMD',
          temperatureC: 29,
          pressureHpa: 1008,
          windSpeedMs: 4
        },
        nwpComparison: {
          forecastUncertainty: {
            agreementLevel: 'moderate',
            modelAgreementScore: 82,
            uncertainty: {
              temperature: 'low',
              precipitation: 'moderate',
              windSpeed: 'low'
            },
            largestDisagreement: null,
            matchedTimestamps: 24
          }
        }
      })

      assert.ok(prompt.includes('IMD observation'))
      assert.ok(prompt.includes('Agreement level: moderate'))
      assert.ok(prompt.includes('not a probability'))
      assert.ok(prompt.includes('Do not invent another score'))
    }
  )

  await t.test(
    'generateGeminiWeatherResponse should produce grounded offline fallback when API key is unset',
    async () => {
      const response = await generateGeminiWeatherResponse({
        userMessage: 'Will it rain in Pune today?',
        groundedContext: {
          location: 'Pune',
          currentWeather: {
            temperature: 28,
            humidity: 65,
            windSpeed: 14,
            weatherDescription: 'Scattered clouds'
          },
          forecastDaily: [
            {
              precipitationProbability: 75,
              maxTemperature: 30,
              minTemperature: 21
            }
          ]
        },
        language: 'en'
      })

      assert.ok(typeof response === 'string')
      assert.ok(response.includes('Pune'))
      assert.ok(response.includes('28°C') || response.includes('Rain'))
    }
  )

  await t.test(
    'generateGeminiWeatherResponse should support Marathi linguistic fallback',
    async () => {
      const response = await generateGeminiWeatherResponse({
        userMessage: 'पुण्यात आज पाऊस पडेल का?',
        groundedContext: {
          location: 'Pune',
          currentWeather: {
            temperature: 27,
            humidity: 80,
            windSpeed: 18,
            weatherDescription: 'पाऊस'
          },
          forecastDaily: [{ precipitationProbability: 85 }]
        },
        language: 'mr'
      })

      assert.ok(typeof response === 'string')
      assert.ok(response.includes('Pune') || response.includes('तापमान'))
    }
  )
})
