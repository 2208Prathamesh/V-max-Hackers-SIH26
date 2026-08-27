import { getECMWFForecast }
    from "../src/services/weather/nwp/ecmwf/client.js";

const data = await getECMWFForecast(
    "20260825",
    "12",
    "0"
);

console.log("ECMWF GRIB bytes:", data.length);

console.log(
    data.subarray(0, 4).toString()
);