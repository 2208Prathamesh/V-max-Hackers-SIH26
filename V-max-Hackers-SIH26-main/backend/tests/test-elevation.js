import { getElevation }
    from "../src/services/weather/openMeteo/elevation.js";

const data = await getElevation(
    18.51957,
    73.85535
);

console.log(JSON.stringify(data, null, 2));