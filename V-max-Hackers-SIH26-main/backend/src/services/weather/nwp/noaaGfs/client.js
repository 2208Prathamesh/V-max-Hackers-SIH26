const BASE_URL =
    "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl";

async function getGFSForecast(
    latitude,
    longitude,
    forecastHour = "f003"
) {
    const today = new Date();

    const date = today.toISOString().slice(0, 10).replace(/-/g, "");
    const cycle = "00";

    const params = new URLSearchParams({
        file: `gfs.t${cycle}z.pgrb2.0p25.${forecastHour}`,

        var_TMP: "on",
        var_RH: "on",
        var_UGRD: "on",
        var_VGRD: "on",
        var_PRMSL: "on",

        lev_2_m_above_ground: "on",
        lev_10_m_above_ground: "on",
        lev_mean_sea_level: "on",

        subregion: "",
        leftlon: String(longitude - 1),
        rightlon: String(longitude + 1),
        toplat: String(latitude + 1),
        bottomlat: String(latitude - 1),

        dir: `/gfs.${date}/${cycle}/atmos`
    });

    const url = `${BASE_URL}?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `NOAA GFS error: ${response.status}`
        );
    }

    return Buffer.from(await response.arrayBuffer());
}

export { getGFSForecast };