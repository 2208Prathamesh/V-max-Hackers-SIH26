// src/services/weather/nwp/ecmwf/client.js

const BASE_URL =
    "https://data.ecmwf.int/forecasts";


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


async function fetchRange(
    url,
    offset,
    length
) {
    const start = Number(offset);
    const end =
        start +
        Number(length) -
        1;

    const response = await fetch(url, {
        headers: {
            Range: `bytes=${start}-${end}`,
            "Accept-Encoding": "identity"
        }
    });

    if (!response.ok) {
        throw new Error(
            `ECMWF range request failed: ` +
            `${response.status} ${response.statusText}`
        );
    }

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


async function getECMWFMessages(
    date,
    cycle = "12",
    step = "0"
) {
    const gribUrl =
        buildForecastUrl(
            date,
            cycle,
            step
        );

    const indexUrl =
        buildIndexUrl(
            date,
            cycle,
            step
        );

    console.log(
        "ECMWF INDEX:",
        indexUrl
    );

    const indexResponse =
        await fetch(indexUrl);

    if (!indexResponse.ok) {
        throw new Error(
            `ECMWF index error: ` +
            `${indexResponse.status} ` +
            `${indexResponse.statusText}`
        );
    }

    const indexText =
        await indexResponse.text();

    const index =
        parseIndex(indexText);

    console.log(
        `ECMWF index records: ${index.length}`
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
            console.warn(
                `ECMWF parameter not found: ${param}`
            );

            continue;
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
    }

    return messages;
}


export {
    getECMWFForecast,
    getECMWFIndex,
    getECMWFMessages
};