// src/services/weather/nwp/ecmwf/client.js

const BASE_URL ="https://data.ecmwf.int/forecasts";

let cachedECMWFRun = null;
let inflightECMWFPromise = null;

function buildForecastUrl(
    date,
    cycle = "00",
    step = "0"
) {
    return (
        `${BASE_URL}/${date}/${cycle}z/ifs/0p25/oper/` +
        `${date}${cycle}0000-${step}h-oper-fc.grib2`
    );
}


function buildIndexUrl(
    date,
    cycle = "00",
    step = "0"
) {
    return (
        `${BASE_URL}/${date}/${cycle}z/ifs/0p25/oper/` +
        `${date}${cycle}0000-${step}h-oper-fc.index`
    );
}


function parseIndex(indexText) {
    return indexText
        .split(/\r?\n/)
        .filter(Boolean)
        .map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(Boolean);
}


function findMessage(index, param) {
    return index.find(item =>
        item.param === param &&
        item.step === "0" &&
        item.levtype === "sfc"
    );
}


async function fetchRange(url, offset, length) {
    const start = Number(offset);
    const end = start + Number(length) - 1;

    const maxRetries = 4;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const response = await fetch(url, {
            headers: {
                Range: `bytes=${start}-${end}`,
                "Accept-Encoding": "identity"
            }
        });

        if (response.ok) {
            const contentRange =
                response.headers.get("content-range");

            if (!contentRange) {
                throw new Error(
                    "ECMWF server did not return Content-Range. " +
                    "Range requests may not be supported."
                );
            }

            return Buffer.from(
                await response.arrayBuffer()
            );
        }

        if (
            response.status === 429 &&
            attempt < maxRetries
        ) {
            const retryAfter =
                response.headers.get("retry-after");

            const retrySeconds =
                retryAfter
                    ? Number(retryAfter)
                    : Math.pow(2, attempt + 1);

            console.log(
                `ECMWF rate limited. ` +
                `Retrying in ${retrySeconds}s...`
            );

            await new Promise(resolve =>
                setTimeout(
                    resolve,
                    retrySeconds * 1000
                )
            );

            continue;
        }

        throw new Error(
            `ECMWF range request failed: ` +
            `${response.status} ` +
            `${response.statusText}`
        );
    }

    throw new Error(
        "ECMWF range request failed after retries"
    );
}

async function getECMWFForecast(
    date,
    cycle = "00",
    step = "0"
) {
    const url =
        buildForecastUrl(
            date,
            cycle,
            step
        );

    const response =
        await fetch(url);

    if (!response.ok) {
        throw new Error(
            `ECMWF error: ` +
            `${response.status} ` +
            `${response.statusText}`
        );
    }

    return Buffer.from(
        await response.arrayBuffer()
    );
}

async function findLatestECMWFRun() {
    const cycles = ["18", "12", "06", "00"];

    const now = new Date();

    // Start with today and search backwards.
    for (let daysBack = 0; daysBack < 3; daysBack++) {
        const date = new Date(now);

        date.setUTCDate(
            date.getUTCDate() - daysBack
        );

        const dateString =
            date.toISOString().slice(0, 10)
                .replaceAll("-", "");

        for (const cycle of cycles) {

            const indexUrl =
                buildIndexUrl(
                    dateString,
                    cycle,
                    "0"
                );

            try {
                const response =
                    await fetch(indexUrl, {
                        method: "GET"
                    });

                if (!response.ok) {
                    continue;
                }

                const indexText =
                    await response.text();

                if (!indexText.trim()) {
                    continue;
                }

                console.log(
                    `Latest ECMWF run found: ` +
                    `${dateString} ${cycle}Z`
                );

                return {
                    date: dateString,
                    cycle,
                    indexText
                };

            } catch {
                // Try the next cycle/run.
                continue;
            }
        }
    }

    throw new Error(
        "Could not find a recent ECMWF forecast run"
    );
}

async function getECMWFIndex(
    date,
    cycle = "12",
    step = "0"
) {
    const url =
        buildIndexUrl(
            date,
            cycle,
            step
        );

    const response =
        await fetch(url);

    if (!response.ok) {
        throw new Error(
            `ECMWF index error: ` +
            `${response.status} ` +
            `${response.statusText}`
        );
    }

    return response.text();
}


async function getECMWFMessages() {
    if (inflightECMWFPromise) {
        return await inflightECMWFPromise;
    }

    inflightECMWFPromise = (async () => {
        try {
            const latestRun = await findLatestECMWFRun();

            const {
                date,
                cycle
            } = latestRun;

            const cacheKey = `${date}-${cycle}`;

            // Reuse already downloaded fields for this ECMWF run
            if (
                cachedECMWFRun &&
                cachedECMWFRun.key === cacheKey
            ) {
                console.log(
                    `Using cached ECMWF run: ${date} ${cycle}Z`
                );

                return cachedECMWFRun.data;
            }

            const gribUrl =
                buildForecastUrl(
                    date,
                    cycle,
                    "0"
                );

            const index =
                parseIndex(
                    latestRun.indexText
                );

            console.log(
                `Downloading ECMWF run: ${date} ${cycle}Z`
            );

            const requiredParams = [
                "2t",
                "2d",
                "10u",
                "10v",
                "msl"
            ];

            const messages = {};

            for (const param of requiredParams) {
                const entry =
                    findMessage(
                        index,
                        param
                    );

                if (!entry) {
                    throw new Error(
                        `ECMWF parameter not found: ${param}`
                    );
                }

                const offset =
                    Number(entry._offset);

                const length =
                    Number(entry._length);

                console.log(
                    `${param}: ` +
                    `offset=${offset}, ` +
                    `length=${length}`
                );

                const buffer =
                    await fetchRange(
                        gribUrl,
                        offset,
                        length
                    );

                console.log(
                    `${param}: fetched ` +
                    `${(buffer.length / 1024).toFixed(1)} KB`
                );

                messages[param] = {
                    buffer,
                    index: entry
                };

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );
            }

            const result = {
                date,
                cycle,
                messages
            };

            cachedECMWFRun = {
                key: cacheKey,
                data: result
            };

            console.log(
                `ECMWF run cached: ${cacheKey}`
            );

            return result;
        } finally {
            inflightECMWFPromise = null;
        }
    })();

    return await inflightECMWFPromise;
}

export {
    getECMWFForecast,
    getECMWFIndex,
    getECMWFMessages,
    findLatestECMWFRun
};