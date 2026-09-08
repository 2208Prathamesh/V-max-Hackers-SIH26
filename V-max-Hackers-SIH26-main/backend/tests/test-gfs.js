import { getGFSForecast }
    from "../src/services/weather/openMeteo/gfs.js";

const data = await getGFSForecast(
    18.51957,
    73.85535
);

console.log(JSON.stringify(data, null, 2));