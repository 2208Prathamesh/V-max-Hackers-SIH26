import { searchLocation } from "../src/services/weather/openMeteo/geocoding.js";

const results = await searchLocation("Pune");

console.log(JSON.stringify(results, null, 2));