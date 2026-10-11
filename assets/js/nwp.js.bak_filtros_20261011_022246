document.addEventListener("DOMContentLoaded", function () {


    // =========================================================
    // ELEMENTOS DA PÁGINA
    // =========================================================

    const modelSelect =
        document.getElementById("model-select");

    const productSelect =
        document.getElementById("product-select");

    const view =
        document.getElementById("product-view");


    // =========================================================
    // MANIFESTO NWP
    // =========================================================

    const manifestURL =
        "../assets/data/nwp/nwp.json";


    // =========================================================
    // ESCAPAR HTML
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
    // DATA/HORA
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
    // MOSTRAR PRODUTO
    // =========================================================

    function showProduct(product) {

        if (!product) {

            view.innerHTML = `

                <div class="message">

                    Seleccione um produto
                    para visualizar a previsão.

                </div>

            `;

            return;
        }


        const name =
            escapeHTML(product.name);


        const description =
            escapeHTML(product.description || "");


        const datetime =
            formatDateTime(product.datetime);


        const image =
            escapeHTML(product.path || "");


        if (!image) {

            view.innerHTML = `

                <div class="error-message">

                    Imagem indisponível.

                </div>

            `;

            return;
        }


        view.innerHTML = `

            <h2 class="product-title">
                ${name}
            </h2>


            <div class="product-description">
                ${description}
            </div>


            <div class="product-datetime">
                ${datetime}
            </div>


            <div class="map-container">

                <a
                    href="../${image}"
                    target="_blank"
                    rel="noopener"
                    title="Abrir imagem original"
                >

                    <img
                        src="../${image}"
                        alt="${name}"
                        class="map-image"
                    >

                </a>

            </div>

        `;
    }


    // =========================================================
    // CARREGAR MANIFESTO
    // =========================================================

    fetch(manifestURL, {
        cache: "no-cache"
    })

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }

        return response.json();

    })


    .then(manifest => {

        if (
            !manifest ||
            !manifest.models
        ) {

            throw new Error(
                "nwp.json inválido"
            );

        }


        modelSelect.innerHTML = `

            <option value="">
                Seleccione um modelo
            </option>

        `;


        Object.entries(manifest.models)
            .forEach(([id, model]) => {

                const option =
                    document.createElement("option");

                option.value = id;

                option.textContent = model.name;

                modelSelect.appendChild(option);

            });


        modelSelect._nwpModels =
            manifest.models;

    })


    .catch(error => {

        console.error(
            "Erro NWP:",
            error
        );


        view.innerHTML = `

            <div class="error-message">

                <strong>
                    Não foi possível carregar os produtos NWP.
                </strong>

            </div>

        `;

    });


    // =========================================================
    // SELEÇÃO DO MODELO
    // =========================================================

    modelSelect.addEventListener(
        "change",
        function () {

            const models =
                modelSelect._nwpModels;


            productSelect.innerHTML = `

                <option value="">
                    Seleccione um produto
                </option>

            `;


            productSelect.disabled = true;

            showProduct(null);


            if (!models || !this.value) {
                return;
            }


            const model =
                models[this.value];


            if (
                !model ||
                !Array.isArray(model.products)
            ) {
                return;
            }


            model.products.forEach(product => {

                const option =
                    document.createElement("option");

                option.value =
                    product.id;

                option.textContent =
                    product.name;

                productSelect.appendChild(option);

            });


            productSelect.disabled = false;


            productSelect._nwpProducts =
                model.products;

        }
    );


    // =========================================================
    // SELEÇÃO DO PRODUTO
    // =========================================================

    productSelect.addEventListener(
        "change",
        function () {

            const products =
                productSelect._nwpProducts;


            if (!products || !this.value) {

                showProduct(null);

                return;
            }


            const product =
                products.find(
                    item => item.id === this.value
                );


            showProduct(product);

        }
    );

});
