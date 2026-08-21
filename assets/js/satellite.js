document.addEventListener("DOMContentLoaded", function () {

    const select = document.getElementById("product-select");
    const view = document.getElementById("product-view");

    if (!select || !view) {
        console.error("Elementos do visualizador de satélite não encontrados.");
        return;
    }

    fetch("../assets/data/satellite.json?v=" + Date.now())

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar assets/data/satellite.json"
                );
            }

            return response.json();

        })

        .then(data => {

            const channels = data.channels || [];

            if (channels.length === 0) {

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

            channels.forEach(channel => {

                const option = document.createElement("option");

                option.value = channel.file;

                option.textContent = channel.name;

                select.appendChild(option);

            });


            /*
             * =====================================================
             * MOSTRAR IMAGEM
             * =====================================================
             */

            function showChannel(channel) {

                if (!channel) {

                    view.innerHTML = "";

                    return;

                }

                view.innerHTML = `

                    <div class="satellite-product-header">

                        <h2>
                            ${channel.name}
                        </h2>

                    </div>

                    <div class="satellite-map">

                        <img
                            src="../assets/images/satellite/${channel.file}"
                            alt="${channel.name}"
                            title="${channel.name}"
                        >

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

                    const filename = this.value;

                    const channel =
                        channels.find(
                            item => item.file === filename
                        );

                    showChannel(channel);

                }
            );


            /*
             * =====================================================
             * INFORMAÇÃO NO CONSOLE
             * =====================================================
             */

            console.log(
                `Canais MSG/SEVIRI carregados: ${channels.length}`
            );

            channels.forEach(channel => {

                console.log(
                    `${channel.name} | ${channel.file}`
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
