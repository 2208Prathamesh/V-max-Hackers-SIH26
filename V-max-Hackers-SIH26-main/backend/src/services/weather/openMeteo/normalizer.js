function normalizeForecast(data) {
    return {
        source: "open-meteo",

        location: {
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone
        },

        current: {
            temperature: data.current?.temperature_2m ?? null,
            humidity: data.current?.relative_humidity_2m ?? null,
            apparentTemperature: data.current?.apparent_temperature ?? null,
            precipitation: data.current?.precipitation ?? null,
            windSpeed: data.current?.wind_speed_10m ?? null,
            windDirection: data.current?.wind_direction_10m ?? null,
            pressure: data.current?.surface_pressure ?? null
        },

        hourly: data.hourly?.time.map((time, index) => ({
            time,

            temperature:
                data.hourly.temperature_2m[index] ?? null,

            precipitationProbability:
                data.hourly.precipitation_probability[index] ?? null,

            precipitation:
                data.hourly.precipitation[index] ?? null,

            weatherCode:
                data.hourly.weather_code[index] ?? null,

            windSpeed:
                data.hourly.wind_speed_10m[index] ?? null
        })) ?? []
    };
}

export { normalizeForecast };