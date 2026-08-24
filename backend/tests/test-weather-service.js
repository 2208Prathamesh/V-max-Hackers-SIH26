import { getWeather }
    from "../src/services/weather/weatherService.js";

const data = await getWeather(
    18.51957,
    73.85535
);

console.log(JSON.stringify(data, null, 2));