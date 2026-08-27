import {
    getECMWFWeather
} from "../src/services/weather/nwp/ecmwf/service.js";


console.log("\n========== FIRST REQUEST ==========\n");

const first =
    await getECMWFWeather(
        18.51957,
        73.85535
    );

console.log(
    JSON.stringify(
        first,
        null,
        2
    )
);


console.log("\n========== SECOND REQUEST ==========\n");

const second =
    await getECMWFWeather(
        19.0760,
        72.8777
    );

console.log(
    JSON.stringify(
        second,
        null,
        2
    )
);