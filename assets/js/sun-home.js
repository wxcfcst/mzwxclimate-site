/* ============================================================
   MZ WX & Climate
   Nascer e pôr do Sol - Página Inicial

   Calcula automaticamente os horários de amanhã para Maputo,
   utilizando a mesma função calculateSunTimes() existente
   em assets/js/astronomy.js.
   ============================================================ */

const SUN_HOME_LOCATION = {
    name: "Maputo",
    latitude: -25.90548,
    longitude: 32.5871
};


/* ------------------------------------------------------------
   Formata data no padrão DD/MM/AAAA
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
   Atualiza o painel
   ------------------------------------------------------------ */

function updateSunHome() {

    const container =
        document.getElementById("sun-home-container");

    if (!container) return;


    const tomorrow =
        new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const year =
        tomorrow.getFullYear();

    const month =
        tomorrow.getMonth() + 1;

    const day =
        tomorrow.getDate();


    const sun =
        calculateSunTimes(
            SUN_HOME_LOCATION.latitude,
            SUN_HOME_LOCATION.longitude,
            year,
            month,
            day
        );


    container.innerHTML = `

        <div class="sun-home-panel">

            <div class="sun-home-title">
                ☀️ Nascer e pôr do Sol
            </div>

            <div class="sun-home-date">
                Amanhã • ${formatSunHomeDate(tomorrow)}
                • ${SUN_HOME_LOCATION.name}
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

}


document.addEventListener(
    "DOMContentLoaded",
    updateSunHome
);
