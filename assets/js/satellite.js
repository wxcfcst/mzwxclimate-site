


/**
 * MZ WX & Climate - Imagens de Satélite
 */

document.addEventListener("DOMContentLoaded", async function () {

    const container = document.getElementById("satellite-container");

    if (!container) {
        return;
    }

    try {

        const response = await fetch("../assets/data/satellite.json");

        if (!response.ok) {
            throw new Error("Erro ao carregar satellite.json");
        }

        const data = await response.json();

        container.innerHTML = `
            <div style="text-align:center; margin:20px 0;">
                <select id="satellite-channel">
                    <option value="">Selecione o canal desejado</option>
                </select>
            </div>

            <div id="satellite-image-container"></div>
        `;

        const select = document.getElementById("satellite-channel");
        const imageContainer = document.getElementById("satellite-image-container");

        data.channels.forEach(channel => {

            const option = document.createElement("option");

            option.value = channel.file;
            option.textContent = channel.name;

            select.appendChild(option);

        });

        select.addEventListener("change", function () {

            const file = this.value;

            imageContainer.innerHTML = "";

            if (!file) {
                return;
            }

            const image = document.createElement("img");

            image.src = `../assets/images/satellite/${file}`;

            image.alt = "Imagem de satélite";

            imageContainer.appendChild(image);

        });

    } catch (error) {

        console.error(
            "Erro ao carregar imagens de satélite:",
            error
        );

        container.innerHTML =
            "<p>Não foi possível carregar as imagens de satélite.</p>";
    }

});

