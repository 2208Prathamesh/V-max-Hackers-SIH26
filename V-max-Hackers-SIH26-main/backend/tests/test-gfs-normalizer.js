import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";

import { getGFSForecast }
    from "../src/services/weather/nwp/noaaGfs/client.js";

import { normalizeGFS }
    from "../src/services/weather/nwp/noaaGfs/normalizer.js";

const execFileAsync = promisify(execFile);

const latitude = 18.51957;
const longitude = 73.85535;

const data = await getGFSForecast(
    latitude,
    longitude
);

const gribFile = "./tests/temp-gfs.grib2";

await fs.writeFile(gribFile, data);

try {

    const { stdout } = await execFileAsync(
        "java",
        [
            "-jar",
            "node_modules/@weacast/grib2json/bin/grib2json.jar",
            "--data",
            "--names",
            gribFile
        ],
        {
            maxBuffer: 50 * 1024 * 1024
        }
    );

    const records = JSON.parse(stdout);

    const weather = normalizeGFS(
        records,
        latitude,
        longitude
    );

    console.log(
        JSON.stringify(weather, null, 2)
    );

} finally {
    await fs.unlink(gribFile).catch(() => {});
}