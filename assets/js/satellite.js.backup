document.addEventListener("DOMContentLoaded", function () {

    const select = document.getElementById("product-select");
    const view = document.getElementById("product-view");

    if (!select || !view) {
        console.error(
            "Elementos do visualizador de satélite não encontrados."
        );
        return;
    }

    fetch("../assets/data/satellite/products.json")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar assets/data/satellite/products.json"
                );
            }

            return response.json();

        })

        .then(products => {

            /*
             * =====================================================
             * PRODUTOS DISPONÍVEIS
             * =====================================================
             */

            const availableProducts =
                products.filter(product =>
                    product.available === true &&
                    product.latest
                );


            if (availableProducts.length === 0) {

                view.innerHTML = `
                    <div class="satellite-error">
                        Nenhum produto de satélite disponível.
                    </div>
                `;

                return;
            }


            /*
             * =====================================================
             * AGRUPAR POR FONTE
             * =====================================================
             */

            const groups = {};

            availableProducts.forEach(product => {

                const source =
                    product.source || "Outros";

                if (!groups[source]) {
                    groups[source] = [];
                }

                groups[source].push(product);

            });


            /*
             * =====================================================
             * LIMPAR SELECT
             * =====================================================
             */

            select.innerHTML = `
                <option value="">
                    Escolha o produto
                </option>
            `;


            /*
             * =====================================================
             * CRIAR GRUPOS NO SELECT
             * =====================================================
             */

            Object.keys(groups)
                .sort()
                .forEach(source => {

                    const optgroup =
                        document.createElement("optgroup");

                    optgroup.label = source;

                    groups[source].forEach(product => {

                        const option =
                            document.createElement("option");

                        option.value = product.id;

                        option.textContent =
                            product.name;

                        optgroup.appendChild(option);

                    });

                    select.appendChild(optgroup);

                });


            /*
             * =====================================================
             * FUNÇÃO PARA MOSTRAR PRODUTO
             * =====================================================
             */

            function showProduct(product) {

                if (!product) {

                    view.innerHTML = "";

                    return;

                }


                view.innerHTML = `

                    <div class="satellite-product">

                        <div class="satellite-product-header">

                            <div class="satellite-source">
                                ${product.source}
                            </div>

                            <h2>
                                ${product.name}
                            </h2>

                        </div>


                        <div class="satellite-map">

                            <img
                                src="../${product.latest}"
                                alt="${product.name}"
                                title="${product.name}"
                            >

                        </div>

                    </div>

                `;

            }


            /*
             * =====================================================
             * ALTERAÇÃO DO PRODUTO
             * =====================================================
             */

            select.addEventListener(
                "change",
                function () {

                    const id = this.value;

                    const product =
                        availableProducts.find(
                            p => p.id === id
                        );

                    showProduct(product);

                }
            );


            /*
             * =====================================================
             * INFORMAÇÃO NO CONSOLE
             * =====================================================
             */

            console.log(
                `Produtos de satélite carregados: ${availableProducts.length}`
            );

            availableProducts.forEach(product => {

                console.log(
                    `${product.id} | ${product.source} | ${product.latest}`
                );

            });

        })

        .catch(error => {

            console.error(
                "Erro no visualizador de satélite:",
                error
            );

            view.innerHTML = `

                <div class="satellite-error">

                    Não foi possível carregar
                    os produtos de satélite.

                </div>

            `;

        });

});
