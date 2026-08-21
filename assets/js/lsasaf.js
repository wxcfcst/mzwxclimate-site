


document.addEventListener("DOMContentLoaded", function () {


    // =========================================================
    // ELEMENTOS DA PÁGINA
    // =========================================================

    const select =
        document.getElementById("product-select");

    const view =
        document.getElementById("product-view");


    // =========================================================
    // PRODUCTS.JSON
    // =========================================================

    const productsURL =
        "../assets/data/lsasaf/products.json";


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



        // =====================================================
        // IMAGEM PRINCIPAL
        // =====================================================

        let mainImageHTML = "";



        if (
            product.latest &&
            product.latest.trim() !== ""
        ) {


            const image =
                escapeHTML(product.latest);



            mainImageHTML = `


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

        else {


            mainImageHTML = `


            <div class="message">

                Imagem indisponível.

            </div>


            `;

        }





        // =====================================================
        // HISTÓRICO
        // =====================================================


        let galleryHTML = "";



        if (

            Array.isArray(product.images)

            &&

            product.images.length > 0

        ) {



            product.images.forEach(function(image){



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
                    title="Abrir imagem original"
                >


                    <img

                        src="../${safeImage}"

                        alt="${escapeHTML(filename)}"

                        loading="lazy"

                    >


                </a>


                `;


            });



        }

        else {


            galleryHTML = `


            <div class="message">

                Não existem imagens históricas disponíveis.

            </div>


            `;


        }





        // =====================================================
        // CONTEÚDO
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




        ${mainImageHTML}



        <h3 class="history-title">

            Histórico

        </h3>



        <div class="gallery">

            ${galleryHTML}

        </div>


        `;



    }





    // =========================================================
    // CARREGAR JSON
    // =========================================================


    fetch(productsURL, {
        cache:"no-cache"
    })


    .then(response=>{


        if(!response.ok){

            throw new Error(
                "HTTP "+response.status
            );

        }


        return response.json();


    })


    .then(products=>{


        if(!Array.isArray(products)){


            throw new Error(
                "products.json inválido"
            );


        }



        select.innerHTML = `


        <option value="">

            Seleccione um produto

        </option>


        `;



        products.forEach(product=>{


            const option =
                document.createElement("option");


            option.value =
                product.id;


            option.textContent =
                product.name;


            select.appendChild(option);


        });



        select._lsasafProducts =
            products;



    })


    .catch(error=>{


        console.error(
            "Erro LSASAF:",
            error
        );


        view.innerHTML = `


        <div class="error-message">


        <strong>

        Não foi possível carregar os produtos LSASAF.

        </strong>


        </div>


        `;



    });





    // =========================================================
    // SELEÇÃO DO PRODUTO
    // =========================================================


    select.addEventListener(
        "change",
        function(){


            const products =
                select._lsasafProducts;



            if(!products){

                return;

            }



            const id =
                this.value;



            if(!id){


                showProduct(null);

                return;

            }



            const product =
                products.find(
                    item=>item.id===id
                );



            showProduct(product);



        }

    );



});


