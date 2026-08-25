import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const GRIB2JSON_JAR =
    "node_modules/@weacast/grib2json/bin/grib2json.jar";

export async function parseECMWF(gribBuffer) {
    const tempFile =
        "./tests/temp-ecmwf.grib2";

    await fs.writeFile(tempFile, gribBuffer);

    try {
        const { stdout } = await execFileAsync(
            "java",
            [
                "-jar",
                GRIB2JSON_JAR,
                "--data",
                "--names",
                tempFile
            ],
            {
                maxBuffer: 500 * 1024 * 1024
            }
        );

        return JSON.parse(stdout);

    } finally {
        await fs.unlink(tempFile).catch(() => {});
    }
}