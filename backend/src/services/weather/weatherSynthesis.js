function isUsableSource (data) {
  return Boolean(data && !data.error)
}

function buildSourceStatus (provider, data) {
  return {
    provider,
    status:
      isUsableSource(data) && data.source === provider
        ? 'available'
        : 'unavailable'
  }
}

function buildModelForecast (provider, data) {
  if (!isUsableSource(data) || data.source !== provider) {
    return {
      available: false,
      source: data?.source || provider,
      reason: isUsableSource(data)
        ? 'provider_unavailable'
        : 'source_unavailable',
      fallback: isUsableSource(data) ? data : null,
      forecast: null
    }
  }

  return {
    available: true,
    source: data.source || provider,
    forecast: data
  }
}

function buildObservation (observation) {
  const available = isUsableSource(observation)
  return {
    source: 'IMD',
    available,
    data: available ? observation : null,
    reason: available ? null : 'observation_unavailable'
  }
}

function buildAlerts (alerts) {
  const items = Array.isArray(alerts) ? alerts : alerts ? [alerts] : []
  const available = alerts != null

  return {
    source: 'IMD',
    available,
    items,
    reason: available ? null : 'alerts_unavailable'
  }
}

function buildUnavailableModelAgreement () {
  return {
    agreementLevel: 'unavailable',
    modelAgreementScore: null,
    uncertainty: {
      temperature: 'unavailable',
      precipitation: 'unavailable',
      windSpeed: 'unavailable'
    },
    largestDisagreement: null,
    matchedTimestamps: 0
  }
}

export function buildWeatherSynthesis ({
  observation,
  alerts,
  gfs,
  ecmwf,
  modelComparison
} = {}) {
  const observationSection = buildObservation(observation)
  const alertsSection = buildAlerts(alerts)
  const gfsSection = buildModelForecast('NOAA-GFS', gfs)
  const ecmwfSection = buildModelForecast('ECMWF-IFS', ecmwf)
  const modelAgreement =
    modelComparison?.forecastUncertainty || buildUnavailableModelAgreement()
  const hasForecast = gfsSection.available || ecmwfSection.available
  const hasAnySource =
    observationSection.available || alertsSection.available || hasForecast

  return {
    available: hasAnySource,
    observation: observationSection,
    current: observationSection.available
      ? {
          available: true,
          source: 'IMD',
          weather: observation
        }
      : {
          available: false,
          reason: 'observation_unavailable'
        },
    alerts: alertsSection,
    forecast: {
      numericalModels: {
        gfs: gfsSection,
        ecmwf: ecmwfSection
      },
      alignedForecasts: modelComparison?.alignedForecasts || [],
      modelAgreement,
      uncertainty: modelAgreement.uncertainty
    },
    sources: {
      observation: buildSourceStatus('IMD', observation),
      alerts: {
        provider: 'IMD',
        status: alertsSection.available ? 'available' : 'unavailable'
      },
      gfs: buildSourceStatus('NOAA-GFS', gfs),
      ecmwf: buildSourceStatus('ECMWF-IFS', ecmwf)
    },
    error: hasAnySource ? null : 'all_sources_unavailable'
  }
}

export default { buildWeatherSynthesis }
