import { getGFSForecast }
    from "../src/services/weather/nwp/noaaGfs/client.js";

const data = await getGFSForecast(
    18.51957,
    73.85535
);

console.log("Downloaded bytes:", data.length);
console.log(data.toString("utf8"));