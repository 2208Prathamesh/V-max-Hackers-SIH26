import {
    findLatestECMWFRun
} from "../src/services/weather/nwp/ecmwf/client.js";

const result =
    await findLatestECMWFRun();

console.log("\n========== LATEST ECMWF ==========\n");

console.log(
    `Date: ${result.date}`
);

console.log(
    `Cycle: ${result.cycle}Z`
);

console.log(
    `Index size: ${result.indexText.length} characters`
);

console.log(
    "\n==================================\n"
);