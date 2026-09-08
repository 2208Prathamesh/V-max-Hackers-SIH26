import { getECMWFForecast }
    from "../src/services/weather/openMeteo/ecmwf.js";

import { getGFSForecast }
    from "../src/services/weather/openMeteo/gfs.js";

import { normalizeForecast }
    from "../src/services/weather/normalizers/weatherNormalizer.js";


const latitude = 18.51957;
const longitude = 73.85535;


// ECMWF
const ecmwfRaw = await getECMWFForecast(latitude, longitude);

const ecmwf = normalizeForecast(ecmwfRaw, "ECMWF");

console.log("========== ECMWF ==========");
console.log(JSON.stringify(ecmwf, null, 2));


// GFS
const gfsRaw = await getGFSForecast(latitude, longitude);

const gfs = normalizeForecast(gfsRaw, "GFS");

console.log("========== GFS ==========");
console.log(JSON.stringify(gfs, null, 2));