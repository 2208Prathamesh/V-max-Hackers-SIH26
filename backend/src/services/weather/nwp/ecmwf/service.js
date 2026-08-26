import {
    getECMWFMessages
} from "./client.js";

import {
    GribMessageFactory
} from "@mattnucc/gribberish";

import {
    normalizeECMWF
} from "./normalizer.js";


function parseMessage(buffer, param) {
    const factory =
        GribMessageFactory.fromBuffer(
            new Uint8Array(buffer)
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


export async function getECMWFWeather(
    latitude,
    longitude
) {
    if (
        typeof latitude !== "number" ||
        typeof longitude !== "number"
    ) {
        throw new Error(
            "Latitude and longitude must be numbers"
        );
    }

    if (
        latitude < -90 ||
        latitude > 90
    ) {
        throw new Error(
            "Latitude must be between -90 and 90"
        );
    }

    if (
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error(
            "Longitude must be between -180 and 180"
        );
    }

    const {
        date,
        cycle,
        messages
    } = await getECMWFMessages();


    const normalized =
        normalizeECMWF(
            {
                temperature:
                    parseMessage(
                        messages["2t"].buffer,
                        "2t"
                    ),

                dewPoint:
                    parseMessage(
                        messages["2d"].buffer,
                        "2d"
                    ),

                uWind:
                    parseMessage(
                        messages["10u"].buffer,
                        "10u"
                    ),

                vWind:
                    parseMessage(
                        messages["10v"].buffer,
                        "10v"
                    ),

                pressure:
                    parseMessage(
                        messages["msl"].buffer,
                        "msl"
                    )
            },
            {
                latitude,
                longitude
            }
        );


    return {
        ...normalized,

        run: {
            date,
            cycle
        }
    };
}