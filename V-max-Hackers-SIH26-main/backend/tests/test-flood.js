import { getFloodForecast }
    from "../src/services/weather/openMeteo/flood.js";

const data = await getFloodForecast(
    18.51957,
    73.85535
);

console.log(JSON.stringify(data, null, 2));