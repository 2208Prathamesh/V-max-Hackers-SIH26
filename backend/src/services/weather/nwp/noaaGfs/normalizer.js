function findNearestGridPoint(data, latitude, longitude) {
    const header = data.header;

    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let index = 0; index < data.data.length; index++) {
        const row = Math.floor(index / header.nx);
        const col = index % header.nx;

        // GRIB scanMode 64:
        // latitude increases from la1 toward la2
        const lat = header.la1 + row * header.dy;
        const lon = header.lo1 + col * header.dx;

        const distance =
            Math.pow(lat - latitude, 2) +
            Math.pow(lon - longitude, 2);

        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
        }
    }

    const row = Math.floor(nearestIndex / header.nx);
    const col = nearestIndex % header.nx;

    return {
        index: nearestIndex,
        latitude: header.la1 + row * header.dy,
        longitude: header.lo1 + col * header.dx
    };
}


function findParameter(records, parameterName) {
    return records.find(
        record =>
            record.header.parameterNumberName === parameterName
    );
}


function normalizeGFS(records, latitude, longitude) {

    const pressure = findParameter(
        records,
        "Pressure_reduced_to_MSL"
    );

    const temperature = findParameter(
        records,
        "Temperature"
    );

    const humidity = findParameter(
        records,
        "Relative_humidity"
    );

    const uWind = findParameter(
        records,
        "U-component_of_wind"
    );

    const vWind = findParameter(
        records,
        "V-component_of_wind"
    );

    if (!pressure || !temperature || !humidity || !uWind || !vWind) {
        throw new Error("Required GFS parameters are missing");
    }

    const gridPoint = findNearestGridPoint(
        temperature,
        latitude,
        longitude
    );

    const i = gridPoint.index;

    const temperatureC =
        temperature.data[i] - 273.15;

    const u = uWind.data[i];
    const v = vWind.data[i];

    const windSpeed =
        Math.sqrt(u * u + v * v);

    const windDirection =
        (Math.atan2(u, v) * 180 / Math.PI + 360) % 360;

    return {
        source: "NOAA-GFS",

        location: {
            requestedLatitude: latitude,
            requestedLongitude: longitude,
            gridLatitude: gridPoint.latitude,
            gridLongitude: gridPoint.longitude
        },

        forecast: {
            forecastTime: temperature.header.forecastTime,

            temperature: Number(temperatureC.toFixed(2)),

            humidity: Number(
                humidity.data[i].toFixed(2)
            ),

            pressure: Number(
                pressure.data[i].toFixed(2)
            ),

            windSpeed: Number(
                windSpeed.toFixed(2)
            ),

            windDirection: Number(
                windDirection.toFixed(2)
            )
        }
    };
}

export {
    findNearestGridPoint,
    normalizeGFS
};