document.addEventListener("DOMContentLoaded", function () {

    const select = document.getElementById("product-select");
    const view = document.getElementById("product-view");

    if (!select || !view) {
        console.error(
            "Elementos do visualizador de satélite não encontrados."
        );
        return;
    }

    fetch("../assets/data/satellite.json")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar assets/data/satellite.json"
                );
            }

            return response.json();

        })

        .then(data => {

            /*
             * =====================================================
             * PRODUTOS DE SATÉLITE
             * =====================================================
             */

            const products = data.channels || [];

            if (products.length === 0) {

                view.innerHTML = `
                    <div class="satellite-error">
                        Nenhuma imagem de satélite disponível.
                    </div>
                `;

                return;
            }


            /*
             * =====================================================
             * LIMPAR SELECT
             * =====================================================
             */

            select.innerHTML = `
                <option value="" selected disabled>
                    Escolha o produto
                </option>
            `;


            /*
             * =====================================================
             * CRIAR OPÇÕES
             * =====================================================
             */

            products.forEach((product, index) => {

                const option =
                    document.createElement("option");

                option.value = index;

                option.textContent =
                    product.name;

                select.appendChild(option);

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

                            <h2>
                                ${product.name}
                            </h2>

                        </div>


                        <div class="satellite-map">

                            <img
                                src="../assets/images/satellite/${product.file}"
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

                    const index =
                        Number(this.value);

                    const product =
                        products[index];

                    showProduct(product);

                }
            );


            /*
             * =====================================================
             * INFORMAÇÃO NO CONSOLE
             * =====================================================
             */

            console.log(
                `Imagens de satélite carregadas: ${products.length}`
            );

            products.forEach(product => {

                console.log(
                    `${product.name} | ${product.file}`
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
                    as imagens de satélite.

                </div>

            `;

        });

});


