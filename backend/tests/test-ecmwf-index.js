import { getECMWFIndex }
    from "../src/services/weather/nwp/ecmwf/client.js";

const index = await getECMWFIndex(
    "20260825",
    "12",
    "0"
);

console.log(index);