import {
    getECMWFMessages
} from "../src/services/weather/nwp/ecmwf/client.js";

import {
    GribMessageFactory
} from "@mattnucc/gribberish";

import {
    normalizeECMWF
} from "../src/services/weather/nwp/ecmwf/normalizer.js";


const result =
    await getECMWFMessages();

const {
    date,
    cycle,
    messages
} = result;


function parseMessage(param) {
    const item = messages[param];

    if (!item) {
        throw new Error(
            `Missing ECMWF parameter: ${param}`
        );
    }

    const factory =
        GribMessageFactory.fromBuffer(
            new Uint8Array(item.buffer)
        );

    if (
        factory.availableMessages.length === 0
    ) {
        throw new Error(
            `No GRIB message found for ${param}`
        );
    }

    return factory.getMessage(
        factory.availableMessages[0]
    );
}


const normalized =
    normalizeECMWF(
        {
            temperature:
                parseMessage("2t"),

            dewPoint:
                parseMessage("2d"),

            uWind:
                parseMessage("10u"),

            vWind:
                parseMessage("10v"),

            pressure:
                parseMessage("msl")
        },
        {
            latitude: 18.51957,
            longitude: 73.85535
        }
    );


console.log(
    "\n========== ECMWF RESULT ==========\n"
);

console.log(
    `Run: ${date} ${cycle}Z\n`
);

console.log(
    JSON.stringify(
        normalized,
        null,
        2
    )
);

console.log(
    "\n==================================\n"
);