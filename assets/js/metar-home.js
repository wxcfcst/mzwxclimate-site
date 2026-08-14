const METAR_HOME_DATA_URL = "../assets/data/metar/latest.json";

let metarHomeStations = [];
let metarHomeIndex = 0;

function formatHomeVisibility(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const text = String(value).trim();

    if (text === "9999" || text === "≥ 10 km" || text === "6+") {
        return "≥ 10 km";
    }

    const meters = Number(text);

    if (!Number.isNaN(meters) && meters > 0) {
        const km = meters / 1000;

        return `${km % 1 === 0
            ? km.toFixed(0)
            : km.toFixed(1)
        } km`;
    }

    return text;
}


function formatHomeWind(direction, speed) {

    if (
        speed === null ||
        speed === undefined
    ) {
        return "—";
    }

    const directions = [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW"
    ];

    let dir = "—";

    if (
        direction !== null &&
        direction !== undefined
    ) {
        const index =
            Math.round(Number(direction) / 22.5) % 16;

        dir = directions[index];
    }

    return `${dir} ${Math.round(speed)} kt`;
}


function formatHomeTime(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function showHomeMetar() {

    const container =
        document.getElementById("metar-home-container");

    if (!container || !metarHomeStations.length) {
        return;
    }

    const station =
        metarHomeStations[metarHomeIndex];

    const visibility =
        formatHomeVisibility(
            station.visibility
        );

    const wind =
        formatHomeWind(
            station.wind_direction,
            station.wind_speed_kt
        );

    container.innerHTML = `
        <div class="metar-home-card">

            <div class="metar-home-title">
                ✈️ ${station.city}
            </div>

            <div class="metar-home-temp">
                ${station.temp_c !== null &&
                  station.temp_c !== undefined
                    ? `${Math.round(station.temp_c)}°C`
                    : "—"}
            </div>

            <div class="metar-home-details">

                <div>
                    <span>Vento</span>
                    <strong>${wind}</strong>
                </div>

                <div>
                    <span>Visibilidade</span>
                    <strong>${visibility}</strong>
                </div>

            </div>

            <div class="metar-home-time">
                Observado: ${formatHomeTime(
                    station.observation_time
                )}
            </div>

        </div>
    `;

    metarHomeIndex++;

    if (
        metarHomeIndex >=
        metarHomeStations.length
    ) {
        metarHomeIndex = 0;
    }
}


async function loadHomeMetar() {

    try {

        const response =
            await fetch(
                METAR_HOME_DATA_URL,
                {
                    cache: "no-store"
                }
            );

        const data =
            await response.json();

        metarHomeStations =
            (data.stations || [])
            .filter(
                station =>
                    station.available === true
            );

        if (!metarHomeStations.length) {
            return;
        }

        showHomeMetar();

        setInterval(
            showHomeMetar,
            5000
        );

    } catch (error) {

        console.error(
            "Erro ao carregar METAR:",
            error
        );

    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadHomeMetar
);
