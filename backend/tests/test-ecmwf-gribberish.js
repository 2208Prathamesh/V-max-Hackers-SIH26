import { getECMWFForecast }
    from "../src/services/weather/nwp/ecmwf/client.js";

import { GribMessageFactory }
    from "@mattnucc/gribberish";

import { normalizeECMWF }
    from "../src/services/weather/nwp/ecmwf/normalizer.js";

const data = await getECMWFForecast(
    "20260825",
    "12",
    "0"
);

const factory = GribMessageFactory.fromBuffer(
    new Uint8Array(data)
);

const findMessage = (prefix) => {
    const id = factory.availableMessages.find(
        id => id.startsWith(prefix)
    );

    if (!id) {
        throw new Error(`ECMWF message not found: ${prefix}`);
    }

    return factory.getMessage(id);
};

const messages = {
    temperature: findMessage(
        "TMP:202608251200:2 in above ground:forecast"
    ),

    dewPoint: findMessage(
        "DPT:202608251200:2 in above ground:forecast"
    ),

    uWind: findMessage(
        "UGRD:202608251200:10 in above ground:forecast"
    ),

    vWind: findMessage(
        "VGRD:202608251200:10 in above ground:forecast"
    ),

    pressure: findMessage(
        "PRES:202608251200: in meansealevel:forecast"
    )
};
console.log("latlng type:", typeof messages.temperature.latlng);
console.log("latlng:", messages.temperature.latlng);
console.log(
    "latlng constructor:",
    messages.temperature.latlng?.constructor?.name
);
console.log(
    "latlng length:",
    messages.temperature.latlng?.length
);
const result = normalizeECMWF(
    messages,
    {
        latitude: 18.51957,
        longitude: 73.85535
    }
);

console.log(
    JSON.stringify(result, null, 2)
);