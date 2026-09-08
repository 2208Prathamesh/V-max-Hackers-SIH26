import {
    getECMWFMessages
} from "../src/services/weather/nwp/ecmwf/client.js";

const messages =
    await getECMWFMessages(
        "20260825",
        "12",
        "0"
    );

console.log("\n========== RESULT ==========\n");

for (
    const [param, message]
    of Object.entries(messages)
) {
    console.log(
        `${param}: ` +
        `${(message.buffer.length / 1024).toFixed(1)} KB`
    );
}

console.log(
    "\n============================\n"
);