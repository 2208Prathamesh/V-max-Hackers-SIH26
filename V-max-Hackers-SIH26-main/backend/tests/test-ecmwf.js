import { getECMWFForecast }
    from "../src/services/weather/openMeteo/ecmwf.js";

const data = await getECMWFForecast(
    18.51957,
    73.85535
);

console.log(JSON.stringify(data, null, 2));