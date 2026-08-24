import { getForecast } from "../src/services/weather/openMeteo/client.js";
import { normalizeForecast } from "../src/services/weather/openMeteo/normalizer.js";

async function main() {
    try {
        const rawData = await getForecast(18.5204, 73.8567);

        const weatherData = normalizeForecast(rawData);

        console.log(JSON.stringify(weatherData, null, 2));
    } catch (error) {
        console.error("Weather integration failed:", error.message);
    }
}

main();