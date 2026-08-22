document.addEventListener("DOMContentLoaded", function () {

    console.log("SATELLITE.JS v3 CARREGADO");


    // =========================================================
    // ELEMENTOS — CUSTOM
    // =========================================================

    const customSelect =
        document.getElementById("product-select");

    const customView =
        document.getElementById("product-view");


    // =========================================================
    // ELEMENTOS — GEORING
    // =========================================================

    const georingSelect =
        document.getElementById("georing-product");

    const georingView =
        document.getElementById("georing-view");


    // =========================================================
    // VERIFICAR ELEMENTOS
    // =========================================================

    if (!customSelect || !customView) {

        console.error(
            "Elementos do visualizador Custom não encontrados."
        );

    }


    if (!georingSelect || !georingView) {

        console.error(
            "Elementos do visualizador GeoRing não encontrados."
        );

    }


    // =========================================================
    // FUNÇÃO PARA ESCAPAR HTML
    // =========================================================

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =========================================================
    // FORMATAR DATA/HORA
    // =========================================================

    function formatDateTime(datetime) {

        if (!datetime) {
            return "";
        }

        const date = new Date(datetime);

        if (Number.isNaN(date.getTime())) {
            return datetime;
        }

        return date.toLocaleString(
            "pt-PT",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    }


    // =========================================================
    // CARREGAR CUSTOM
    // =========================================================

    if (customSelect && customView) {

        fetch(
            "../assets/data/satellite.json?v=" +
            Date.now()
        )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Erro ao carregar assets/data/satellite.json"
                );

            }

            return response.json();

        })

        .then(function (data) {

            const channels =
                data.channels || [];


            if (channels.length === 0) {

                customView.innerHTML = `

                    <div class="satellite-error">

                        Nenhuma imagem de satélite disponível.

                    </div>

                `;

                return;

            }


            // =================================================
            // LIMPAR SELECT
            // =================================================

            customSelect.innerHTML = `

                <option value="" selected disabled>
                    Escolha o produto
                </option>

            `;


            // =================================================
            // CRIAR OPÇÕES
            // =================================================

            channels.forEach(function (channel) {

                const option =
                    document.createElement("option");

                option.value =
                    channel.file;

                option.textContent =
                    channel.name;

                customSelect.appendChild(option);

            });


            // =================================================
            // MOSTRAR IMAGEM CUSTOM
            // =================================================

            function showCustomChannel(channel) {

                if (!channel) {

                    customView.innerHTML = "";

                    return;

                }


                const filename =
                    escapeHTML(channel.file);


                const name =
                    escapeHTML(channel.name);


                customView.innerHTML = `

                    <div class="satellite-product-header">

                        <h2>
                            ${name}
                        </h2>

                    </div>


                    <div class="satellite-map">

                        <img
                            src="../assets/images/satellite/${filename}"
                            alt="${name}"
                            title="${name}"
                        >

                    </div>

                `;

            }


            // =================================================
            // ALTERAÇÃO DO PRODUTO CUSTOM
            // =================================================

            customSelect.addEventListener(
                "change",
                function () {

                    const filename =
                        this.value;


                    const channel =
                        channels.find(
                            function (item) {

                                return item.file === filename;

                            }
                        );


                    showCustomChannel(channel);

                }
            );


            console.log(
                "Canais MSG/SEVIRI carregados:",
                channels.length
            );

        })

        .catch(function (error) {

            console.error(
                "Erro no visualizador Custom:",
                error
            );


            customView.innerHTML = `

                <div class="satellite-error">

                    Não foi possível carregar
                    as imagens de satélite.

                </div>

            `;

        });

    }


    // =========================================================
    // CARREGAR GEORING
    // =========================================================

    if (georingSelect && georingView) {

        fetch(
            "../assets/data/georing.json?v=" +
            Date.now()
        )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Erro ao carregar assets/data/georing.json"
                );

            }

            return response.json();

        })

        .then(function (data) {

            const images =
                data.images || [];


            if (images.length === 0) {

                georingView.innerHTML = `

                    <div class="satellite-error">

                        Nenhuma imagem GeoRing disponível.

                    </div>

                `;

                return;

            }


            // =================================================
            // LIMPAR SELECT GEORING
            // =================================================

            georingSelect.innerHTML = `

                <option value="" selected disabled>
                    Escolha o produto
                </option>

            `;


            // =================================================
            // CRIAR OPÇÕES GEORING
            // =================================================

            images.forEach(function (item) {

                const option =
                    document.createElement("option");

                option.value =
                    item.id;

                option.textContent =
                    item.name;

                georingSelect.appendChild(option);

            });


            // =================================================
            // MOSTRAR SOMENTE A IMAGEM GEORING
            // =================================================

            function showGeoRing(item) {

                if (!item) {

                    georingView.innerHTML = "";

                    return;

                }


                const name =
                    escapeHTML(item.name);


                const imagePath =
                    escapeHTML(item.image);


                georingView.innerHTML = `

                    <div class="satellite-map"
                         id="georing-map">

                        <img
                            src="../${imagePath}"
                            alt="${name}"
                            title="${name}"
                            id="georing-image"
                        >

                        <div
                            class="satellite-unavailable"
                            id="georing-unavailable"
                            style="display: none;"
                        >
                            Imagem indisponível
                        </div>

                    </div>

                `;


                // =================================================
                // DETECTAR IMAGEM AUSENTE
                // =================================================

                const image =
                    document.getElementById(
                        "georing-image"
                    );


                const unavailable =
                    document.getElementById(
                        "georing-unavailable"
                    );


                if (image && unavailable) {

                    image.addEventListener(
                        "error",
                        function () {

                            image.style.display =
                                "none";

                            unavailable.style.display =
                                "block";

                        }
                    );

                }

            }


            // =================================================
            // ALTERAÇÃO DO PRODUTO GEORING
            // =================================================

            georingSelect.addEventListener(
                "change",
                function () {

                    const id =
                        this.value;


                    const item =
                        images.find(
                            function (product) {

                                return product.id === id;

                            }
                        );


                    showGeoRing(item);

                }
            );


            // =================================================
            // INFORMAÇÃO NO CONSOLE
            // =================================================

            console.log(
                "Produtos GeoRing carregados:",
                images.length
            );


            images.forEach(function (item) {

                console.log(
                    item.name +
                    " | " +
                    item.filename
                );

            });

        })

        .catch(function (error) {

            console.error(
                "Erro no visualizador GeoRing:",
                error
            );


            georingView.innerHTML = `

                <div class="satellite-error">

                    Não foi possível carregar
                    as imagens GeoRing.

                </div>

            `;

        });

    }

});
