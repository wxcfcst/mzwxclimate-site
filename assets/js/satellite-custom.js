document.addEventListener("DOMContentLoaded", function () {

    console.log("SATELLITE-CUSTOM.JS CARREGADO");

    const customSelect =
        document.getElementById("product-select");

    const customView =
        document.getElementById("product-view");


    if (!customSelect || !customView) {

        console.error(
            "Elementos do visualizador Custom não encontrados."
        );

        return;

    }


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


    fetch(
        "../../assets/data/satellite/custom.json?v=" +
        Date.now()
    )

    .then(function (response) {

        if (!response.ok) {

            throw new Error(
                "Erro ao carregar assets/data/satellite/custom.json"
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


        customSelect.innerHTML = `

            <option value="" selected disabled>
                Escolha o produto
            </option>

        `;


        channels.forEach(function (channel) {

            const option =
                document.createElement("option");

            option.value =
                channel.file;

            option.textContent =
                channel.name;

            customSelect.appendChild(option);

        });


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
                        src="../../assets/images/satellite/${filename}"
                        alt="${name}"
                        title="${name}"
                    >

                </div>

            `;

        }


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

});
