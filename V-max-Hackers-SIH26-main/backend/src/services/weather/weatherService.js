import { getForecast as getOpenMeteoForecast } from './openMeteo/client.js'
import { getECMWFWeather } from "./nwp/ecmwf/service.js";
import { getGFSForecast } from "./openMeteo/gfs.js";
import { getAirQuality } from "./openMeteo/airQuality.js";
import { getElevation } from "./openMeteo/elevation.js";
import { getFloodForecast } from "./openMeteo/flood.js";
import { getMarineForecast } from "./openMeteo/marine.js";

import { normalizeForecast } from "./normalizers/weatherNormalizer.js";

async function getWeather(latitude, longitude) {
    const [
        forecastRaw,
        ecmwfRaw,
        gfsRaw,
        airQuality,
        elevation,
        flood,
        marine
    ] = await Promise.all([
        getForecast(latitude, longitude),
        getECMWFWeather(latitude, longitude),
        getGFSForecast(latitude, longitude),
        getAirQuality(latitude, longitude),
        getElevation(latitude, longitude),
        getFloodForecast(latitude, longitude),
        getMarineForecast(latitude, longitude)
    ]);

    return {
        location: {
            latitude,
            longitude
        },

        forecast: normalizeForecast(
            forecastRaw,
            "Open-Meteo"
        ),

        models: {
            ecmwf: ecmwfRaw,

            gfs: normalizeForecast(
                gfsRaw,
                "GFS"
            )
        },

        airQuality,
        elevation,
        flood,
        marine
    };
}

async function getForecast(latitude, longitude, days = 7) {
    const [
        openMeteoRaw,
        ecmwfRaw,
        gfsRaw
    ] = await Promise.all([
        getOpenMeteoForecast(latitude, longitude),
        getECMWFWeather(latitude, longitude),
        getGFSForecast(latitude, longitude)
    ])

    return {
        location: {
            latitude,
            longitude
        },

        models: {
            openMeteo: normalizeForecast(
                openMeteoRaw,
                'Open-Meteo'
            ),

            ecmwf: ecmwfRaw,

            gfs: normalizeForecast(
                gfsRaw,
                'GFS'
            )
        }
    }
}

async function getHourlyForecast({
    latitude,
    longitude,
    hours = 24
}) {
    const forecastRaw = await getOpenMeteoForecast(
        latitude,
        longitude
    )

    const normalized = normalizeForecast(
        forecastRaw,
        'Open-Meteo'
    )

    return {
        location: {
            latitude,
            longitude
        },
        hourly: normalized.hourly.slice(0, hours)
    }
}

export default { getWeather,getForecast, getHourlyForecast };