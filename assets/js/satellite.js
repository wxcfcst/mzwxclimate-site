

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

        // ---------------------------------------------------------------------
        // Caixa de seleção
        // ---------------------------------------------------------------------

        const select = document.createElement("select");

        select.id = "satellite-channel-select";

        const defaultOption = document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent = "Selecione o canal desejado";

        defaultOption.selected = true;

        select.appendChild(defaultOption);

        // ---------------------------------------------------------------------
        // Adicionar os canais
        // ---------------------------------------------------------------------

        data.channels.forEach(channel => {

            const option = document.createElement("option");

            option.value = channel.file;

            option.textContent = channel.name;

            select.appendChild(option);

        });

        container.innerHTML = "";

        container.appendChild(select);

        // ---------------------------------------------------------------------
        // Área da imagem
        // ---------------------------------------------------------------------

        const imageContainer = document.createElement("div");

        imageContainer.id = "satellite-image-container";

        container.appendChild(imageContainer);

        // ---------------------------------------------------------------------
        // Quando o usuário escolher um canal
        // ---------------------------------------------------------------------

        select.addEventListener("change", async function () {

            const channel = data.channels.find(
                item => item.file === select.value
            );

            if (!channel) {

                imageContainer.innerHTML = "";

                return;

            }

            imageContainer.innerHTML =
                "<p>Carregando imagem...</p>";

            try {

                const imageFiles = await fetch(
                    "../assets/images/satellite/"
                );

                if (!imageFiles.ok) {
                    throw new Error(
                        "Erro ao acessar imagens de satélite"
                    );
                }

                const html = await imageFiles.text();

                const parser = new DOMParser();

                const doc = parser.parseFromString(
                    html,
                    "text/html"
                );

                const links = Array.from(
                    doc.querySelectorAll("a")
                );

                const files = links
                    .map(link => link.getAttribute("href"))
                    .filter(
                        file =>
                            file &&
                            file.endsWith(".png")
                    );

                // -------------------------------------------------------------
                // RGB
                // -------------------------------------------------------------

                if (channel.file === "RGB") {

                    if (!files.includes("RGB.png")) {

                        throw new Error(
                            "Imagem RGB.png não encontrada"
                        );

                    }

                    imageContainer.innerHTML = `
                        <h2>${channel.name}</h2>

                        <img
                            src="../assets/images/satellite/RGB.png"
                            alt="${channel.name}"
                        >
                    `;

                    return;
                }

                // -------------------------------------------------------------
                // Canais MSG
                // -------------------------------------------------------------

                const matches = files
                    .filter(
                        file =>
                            file.includes(
                                `MSG_${channel.file}_`
                            )
                    )
                    .sort()
                    .reverse();

                if (matches.length === 0) {

                    imageContainer.innerHTML =
                        "<p>Imagem não encontrada.</p>";

                    return;
                }

                const latest = matches[0];

                imageContainer.innerHTML = `
                    <h2>${channel.name}</h2>

                    <img
                        src="../assets/images/satellite/${latest}"
                        alt="${channel.name}"
                    >

                    <p>${latest}</p>
                `;

            } catch (error) {

                console.error(error);

                imageContainer.innerHTML =
                    "<p>Não foi possível carregar a imagem.</p>";

            }

        });

    } catch (error) {

        console.error(
            "Erro ao carregar imagens de satélite:",
            error
        );

        container.innerHTML =
            "<p>Não foi possível carregar os canais de satélite.</p>";

    }

});


