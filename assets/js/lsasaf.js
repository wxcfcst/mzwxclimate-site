document.addEventListener("DOMContentLoaded", function () {


    // =========================================================
    // ELEMENTOS DA PÁGINA
    // =========================================================

    const select =
        document.getElementById("product-select");

    const view =
        document.getElementById("product-view");


    // =========================================================
    // CAMINHO DO PRODUCTS.JSON
    // =========================================================

    const productsURL =
        "../assets/data/lsasaf/products.json";


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
    // MOSTRAR PRODUTO
    // =========================================================

    function showProduct(product) {


        if (!product) {

            view.innerHTML = `

                <div class="message">

                    Seleccione um produto para visualizar.

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


        const latest =
            product.latest;


        // =====================================================
        // GALERIA
        // =====================================================

        let galleryHTML = "";


        if (
            Array.isArray(product.images) &&
            product.images.length > 0
        ) {


            product.images.forEach(function (image) {


                const safeImage =
                    escapeHTML(image);


                const filename =
                    image.split("/").pop();


                galleryHTML += `

                    <a
                        href="../${safeImage}"
                        target="_blank"
                        rel="noopener"
                        class="gallery-item"
                        title="Abrir imagem em tamanho original"
                    >

                        <img
                            src="../${safeImage}"
                            alt="${escapeHTML(filename)}"
                            loading="lazy"
                        >

                    </a>

                `;

            });


        } else {


            galleryHTML = `

                <div class="message">

                    Não existem imagens históricas disponíveis.

                </div>

            `;

        }


        // =====================================================
        // CONTEÚDO PRINCIPAL
        // =====================================================

        view.innerHTML = `

            <h2 class="product-title">

                ${name}

            </h2>


            ${
                description
                    ?
                    `<p class="product-description">
                        ${description}
                    </p>`
                    :
                    ""
            }


            ${
                datetime
                    ?
                    `<div class="product-datetime">
                        <strong>Data:</strong>
                        ${escapeHTML(datetime)}
                    </div>`
                    :
                    ""
            }


            <div class="map-container">

                <a
                    href="../${escapeHTML(latest)}"
                    target="_blank"
                    rel="noopener"
                    title="Abrir imagem em tamanho original"
                >

                    <img
                        src="../${escapeHTML(latest)}"
                        alt="${name}"
                        class="map-image"
                    >

                </a>

            </div>


            <h3 class="history-title">

                Histórico

            </h3>


            <div class="gallery">

                ${galleryHTML}

            </div>

        `;

    }


    // =========================================================
    // CARREGAR PRODUCTS.JSON
    // =========================================================

    fetch(productsURL, {
        cache: "no-cache"
    })

    .then(function (response) {

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }

        return response.json();

    })

    .then(function (products) {


        // =====================================================
        // VALIDAR DADOS
        // =====================================================

        if (!Array.isArray(products)) {

            throw new Error(
                "products.json não contém uma lista válida."
            );

        }


        // =====================================================
        // LIMPAR SELECT
        // =====================================================

        select.innerHTML = `

            <option value="">
                Seleccione um produto
            </option>

        `;


        // =====================================================
        // ADICIONAR PRODUTOS DISPONÍVEIS
        // =====================================================

        products

            .forEach(function (product) {


                const option =
                    document.createElement("option");


                option.value =
                    product.id;


                option.textContent =
                    product.name;


                select.appendChild(option);

            });


        // =====================================================
        // NÃO SELECIONAR PRODUTO AUTOMATICAMENTE
        // =====================================================
        //
        // "Seleccione um produto" permanece selecionado
        // até o utilizador escolher um produto.
        // =====================================================


        // =====================================================
        // GUARDAR PRODUTOS
        // =====================================================

        select._lsasafProducts =
            products;


    })

    .catch(function (error) {


        console.error(
            "Erro ao carregar produtos LSASAF:",
            error
        );


        view.innerHTML = `

            <div class="error-message">

                <strong>
                    Não foi possível carregar os produtos LSASAF.
                </strong>

                <br><br>

                Verifique a disponibilidade do
                <code>products.json</code>.

            </div>

        `;

    });


    // =========================================================
    // MUDANÇA DO PRODUTO
    // =========================================================

    select.addEventListener(
        "change",
        function () {


            const products =
                select._lsasafProducts;


            if (!products) {
                return;
            }


            const id =
                this.value;


            if (!id) {

                showProduct(null);

                return;

            }


            const product =
                products.find(function (item) {

                    return item.id === id;

                });


            showProduct(product);

        }
    );


});
