import { getForecast } from "./openMeteo/client.js";

import { getECMWFForecast } from "./openMeteo/ecmwf.js";

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

        getECMWFForecast(latitude, longitude),

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
            ecmwf: normalizeForecast(
                ecmwfRaw,
                "ECMWF"
            ),

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


export { getWeather };