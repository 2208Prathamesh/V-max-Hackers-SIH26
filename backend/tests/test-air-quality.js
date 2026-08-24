import { getAirQuality }
    from "../src/services/weather/openMeteo/airQuality.js";

const data = await getAirQuality(
    18.51957,
    73.85535
);

console.log(JSON.stringify(data, null, 2));