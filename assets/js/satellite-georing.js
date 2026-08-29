document.addEventListener("DOMContentLoaded", function () {

    console.log("SATELLITE-GEORING.JS CARREGADO");

    const georingSelect =
        document.getElementById("georing-product");

    const georingView =
        document.getElementById("georing-view");


    if (!georingSelect || !georingView) {

        console.error(
            "Elementos do visualizador GeoRing não encontrados."
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
        "../../assets/data/satellite/georing.json?v=" +
        Date.now()
    )

    .then(function (response) {

        if (!response.ok) {

            throw new Error(
                "Erro ao carregar assets/data/satellite/georing.json"
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


        georingSelect.innerHTML = `

            <option value="" selected disabled>
                Escolha o produto
            </option>

        `;


        images.forEach(function (item) {

            const option =
                document.createElement("option");

            option.value =
                item.id;

            option.textContent =
                item.name;

            georingSelect.appendChild(option);

        });


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

                <div class="satellite-map">

                    <img
                        src="../../${imagePath}"
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

});
