/* ============================================================
   MZ WX & Climate
   Nascer e pôr do Sol - Página Inicial

   Mostra automaticamente o nascer e o pôr do Sol de amanhã
   para todos os distritos disponíveis em data/locations.json.

   Cada distrito permanece visível durante 10 segundos.
   ============================================================ */


/* ------------------------------------------------------------
   Configuração
   ------------------------------------------------------------ */

const SUN_HOME_INTERVAL = 10000;


/* ------------------------------------------------------------
   Estado
   ------------------------------------------------------------ */

let sunHomeLocations = [];

let sunHomeIndex = 0;


/* ------------------------------------------------------------
   Formata a data
   ------------------------------------------------------------ */

function formatSunHomeDate(date) {

    return date.toLocaleDateString(
        "pt-PT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* ------------------------------------------------------------
   Obtém a data de amanhã
   ------------------------------------------------------------ */

function getTomorrow() {

    const tomorrow = new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    return tomorrow;

}


/* ------------------------------------------------------------
   Mostra um distrito
   ------------------------------------------------------------ */

function showSunHomeLocation() {

    const container =
        document.getElementById(
            "sun-home-container"
        );

    if (!container) return;

    if (!sunHomeLocations.length) return;


    const location =
        sunHomeLocations[
            sunHomeIndex
        ];


    const tomorrow =
        getTomorrow();


    const year =
        tomorrow.getFullYear();

    const month =
        tomorrow.getMonth() + 1;

    const day =
        tomorrow.getDate();


    const sun =
        calculateSunTimes(
            Number(location.lat),
            Number(location.lon),
            year,
            month,
            day
        );


    container.classList.remove(
        "sun-home-visible"
    );


    setTimeout(() => {

        container.innerHTML = `

            <div class="sun-home-panel">

                <div class="sun-home-title">
                    ☀️ Nascer e pôr do Sol
                </div>


                <div class="sun-home-date">

                    Amanhã •
                    ${formatSunHomeDate(tomorrow)}

                </div>


                <div class="sun-home-province">

                    ${location.province}

                </div>


                <div class="sun-home-district">

                    ${location.district}

                </div>


                <div class="sun-home-times">


                    <div class="sun-home-item">

                        <span class="sun-home-icon">
                            🌅
                        </span>

                        <div>

                            <span class="sun-home-label">
                                Nascer do Sol
                            </span>

                            <strong>
                                ${sun.sunrise}
                            </strong>

                        </div>

                    </div>


                    <div class="sun-home-item">

                        <span class="sun-home-icon">
                            🌇
                        </span>

                        <div>

                            <span class="sun-home-label">
                                Pôr do Sol
                            </span>

                            <strong>
                                ${sun.sunset}
                            </strong>

                        </div>

                    </div>


                </div>

            </div>

        `;


        container.classList.add(
            "sun-home-visible"
        );


    }, 250);


    sunHomeIndex++;


    if (
        sunHomeIndex >=
        sunHomeLocations.length
    ) {

        sunHomeIndex = 0;

    }

}


/* ------------------------------------------------------------
   Carrega os distritos
   ------------------------------------------------------------ */

async function loadSunHomeLocations() {

    const container =
        document.getElementById(
            "sun-home-container"
        );

    if (!container) return;


    try {

        const response =
            await fetch(
                "../data/locations.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Não foi possível carregar locations.json"
            );

        }


        const locations =
            await response.json();


        sunHomeLocations =
            locations.filter(
                location =>
                    location.province &&
                    location.district &&
                    Number.isFinite(
                        Number(location.lat)
                    ) &&
                    Number.isFinite(
                        Number(location.lon)
                    )
            );


        if (!sunHomeLocations.length) {

            throw new Error(
                "Nenhum distrito válido encontrado"
            );

        }


        sunHomeIndex = 0;


        showSunHomeLocation();


        setInterval(
            showSunHomeLocation,
            SUN_HOME_INTERVAL
        );


    } catch (error) {

        console.error(
            "Erro no componente nascer/pôr do Sol:",
            error
        );


        container.innerHTML = `

            <div class="sun-home-panel">

                ☀️ Não foi possível carregar
                os horários do Sol.

            </div>

        `;

    }

}


/* ------------------------------------------------------------
   Inicialização
   ------------------------------------------------------------ */

document.addEventListener(
    "DOMContentLoaded",
    loadSunHomeLocations
);
