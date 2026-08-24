import { getMarineForecast }
    from "../src/services/weather/openMeteo/marine.js";

const data = await getMarineForecast(
    18.51957,
    73.85535
);

console.log(JSON.stringify(data, null, 2));