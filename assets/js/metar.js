



// ============================================================
// MZ WX & Climate
// METAR - Principais aeroportos de Moçambique
// ============================================================

const METAR_DATA_URL = "assets/data/metar/latest.json";


// ------------------------------------------------------------
// Weather icon
// ------------------------------------------------------------

function weatherIcon(weather, clouds) {

    const text = `${weather || ""} ${clouds || ""}`.toLowerCase();

    if (
        text.includes("thunder") ||
        text.includes("ts")
    ) {
        return "⛈️";
    }

    if (
        text.includes("rain") ||
        text.includes("drizzle") ||
        text.includes("shower")
    ) {
        return "🌧️";
    }

    if (
        text.includes("fog") ||
        text.includes("mist")
    ) {
        return "🌫️";
    }

    if (
        text.includes("overcast") ||
        text.includes("ovc")
    ) {
        return "☁️";
    }

    if (
        text.includes("broken") ||
        text.includes("bkn")
    ) {
        return "🌥️";
    }

    if (
        text.includes("scattered") ||
        text.includes("sct")
    ) {
        return "⛅";
    }

    return "☀️";
}


// ------------------------------------------------------------
// Wind direction
// ------------------------------------------------------------

function windDirection(degrees) {

    if (
        degrees === null ||
        degrees === undefined ||
        degrees === "VRB"
    ) {
        return "VRB";
    }

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    const index = Math.round(degrees / 45) % 8;

    return directions[index];
}


// ------------------------------------------------------------
// Format observation time
// ------------------------------------------------------------

function formatObservationTime(dateString) {

    if (!dateString) {
        return "Sem informação";
    }

    const date = new Date(dateString);

    return date.toLocaleString(
        "pt-BR",
        {
            timeZone: "Africa/Maputo",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ------------------------------------------------------------
// Create airport card
// ------------------------------------------------------------

function createMetarCard(station) {

    const card = document.createElement("div");

    card.className = "metar-card";


    if (!station.available) {

        card.innerHTML = `
            <div class="metar-card-header">
                <strong>${station.city}</strong>
                <span>${station.icao}</span>
            </div>

            <div class="metar-unavailable">
                Sem observação METAR disponível
            </div>
        `;

        return card;
    }


    const temp =
        station.temp_c !== null &&
        station.temp_c !== undefined
            ? `${Math.round(station.temp_c)}°C`
            : "—";


    const wind =
        station.wind_speed_kt !== null &&
        station.wind_speed_kt !== undefined
            ? `${windDirection(station.wind_direction)} ${Math.round(station.wind_speed_kt)} kt`
            : "—";


    let visibility = "—";

    if (
        station.visibility !== null &&
        station.visibility !== undefined &&
        station.visibility !== ""
    ) {
        const value = String(station.visibility).trim();

        if (value === "9999") {
            visibility = "≥ 10 km";
        } else {
            const meters = Number(value);

            if (!Number.isNaN(meters) && meters > 0) {
                const km = meters / 1000;
                visibility = `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)} km`;
            } else {
                visibility = value;
            }
        }
    }


    const icon = weatherIcon(
        station.weather,
        station.clouds
    );


    const weather =
        station.weather ||
        "Condições observadas";


    card.innerHTML = `
        <div class="metar-card-header">

            <div>
                <strong>${station.city}</strong>
                <small>${station.icao}</small>
            </div>

            <span class="metar-icon">
                ${icon}
            </span>

        </div>


        <div class="metar-main">

            <div class="metar-temperature">
                ${temp}
            </div>

            <div class="metar-condition">
                ${weather}
            </div>

        </div>


        <div class="metar-details">

            <div>
                <span>Vento</span>
                <strong>${wind}</strong>
            </div>

            <div>
                <span>Visibilidade</span>
                <strong>${visibility}</strong>
            </div>

        </div>


        <div class="metar-time">
            Observado: ${formatObservationTime(station.observation_time)}
        </div>
    `;


    return card;
}


// ------------------------------------------------------------
// Load METAR
// ------------------------------------------------------------

async function loadMetar() {

    const container =
        document.getElementById("metar-container");

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(METAR_DATA_URL, {
                cache: "no-store"
            });


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        container.innerHTML = "";


        data.stations.forEach(
            station => {

                container.appendChild(
                    createMetarCard(station)
                );

            }
        );


        const updated =
            document.getElementById(
                "metar-updated"
            );


        if (updated && data.updated) {

            updated.textContent =
                `Dados atualizados em ${formatObservationTime(data.updated)} (hora de Moçambique)`;

        }


    } catch (error) {

        console.error(
            "Erro ao carregar METAR:",
            error
        );


        container.innerHTML = `
            <div class="metar-error">
                Não foi possível atualizar as observações meteorológicas.
            </div>
        `;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadMetar
);




