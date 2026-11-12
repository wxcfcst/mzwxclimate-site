document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const modelSelect = document.getElementById("model-select");
    const variableSelect = document.getElementById("variable-select");
    const levelSelect = document.getElementById("level-select");
    const productSelect = document.getElementById("product-select");
    const view = document.getElementById("product-view");
    const manifestURL = "../assets/data/nwp/nwp.json";

    if (![modelSelect, variableSelect, levelSelect, productSelect, view].every(Boolean)) {
        console.error("NWP: faltam elementos HTML dos seletores.");
        return;
    }

    let models = {};
    let currentProducts = [];

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDateTime(datetime) {
        if (!datetime) return "";
        const date = new Date(datetime);
        return Number.isNaN(date.getTime()) ? String(datetime) :
            date.toLocaleString("pt-PT", {dateStyle: "medium", timeStyle: "short"});
    }

    function setOptions(select, values, prompt) {
        select.replaceChildren(new Option(prompt, ""));
        values.forEach(({value, label}) => select.add(new Option(label, value)));
        select.disabled = values.length === 0;
        select.value = "";
    }

    function resetBelow(level) {
        if (level <= 1) setOptions(variableSelect, [], "Seleccione uma variável");
        if (level <= 2) setOptions(levelSelect, [], "Seleccione um nível");
        if (level <= 3) setOptions(productSelect, [], "Seleccione um produto");
        view.innerHTML = '<div class="message">Seleccione os filtros para visualizar a análise.</div>';
    }

    // Classificação pelo nome do produto: não modifica o JSON nem os ficheiros.
    // Campos combinados têm prioridade para não desaparecerem na filtragem.
    function variableFor(product) {
        const n = String(product.name || "").toLowerCase();
        const id = String(product.id || "").toLowerCase();
        if (n.includes(" + ")) return "Combinados";
        if (n.includes("vorticidade") || /^vo_/.test(id)) return "Vorticidade";
        if (n.includes("vent") || n.includes("vento") || n.includes("linhas de corrente")) return "Vento";
        if (n.includes("temperatura")) return "Temperatura";
        if (n.includes("umidade") || n.includes("humidade") || n.includes("água precipitável") || n.includes("agua precipitavel")) return "Humidade";
        if (n.includes("geopotencial")) return "Geopotencial";
        if (n.includes("espessura")) return "Espessura";
        if (n.includes("pressão") || n.includes("pressao")) return "Pressão";
        if (n.includes("precipitação") || n.includes("precipitacao")) return "Precipitação";
        if (n.includes("nebulosidade")) return "Nebulosidade";
        return "Outros";
    }

    function levelFor(product) {
        const n = String(product.name || "");
        const all = [...n.matchAll(/(\d{3,4})\s*hpa/gi)].map(m => Number(m[1]));
        const distinct = [...new Set(all)];
        if (distinct.length > 1) return {
            key: "layer:" + distinct.join("-"), label: `Camada ${distinct.join("–")} hPa`, order: 2000
        };
        if (distinct.length === 1) return {
            key: "hpa:" + distinct[0], label: `${distinct[0]} hPa`, order: distinct[0]
        };
        if (/\b2\s*m\b/i.test(n)) return {key: "height:2m", label: "2 m", order: 1100};
        if (/nível médio do mar|nivel medio do mar/i.test(n)) return {key: "msl", label: "Nível médio do mar", order: 1200};
        if (/água precipitável|agua precipitavel/i.test(n)) return {key: "column", label: "Coluna atmosférica", order: 1300};
        if (/nebulosidade/i.test(n)) return {key: "cloud", label: "Camadas de nuvens", order: 1400};
        if (/precipitação total/i.test(n)) return {key: "surface", label: "Superfície / acumulado", order: 1500};
        return {key: "other", label: "Outros níveis", order: 2100};
    }

    function showProduct(product) {
        if (!product) {
            view.innerHTML = '<div class="message">Seleccione um produto para visualizar a análise.</div>';
            return;
        }
        const path = String(product.path || "").replace(/^\/+/, "");
        // Caminho esperado no manifesto: assets/images/nwp/... (relativo à raiz do projeto)
        if (!path.startsWith("assets/images/nwp/") || path.includes("..")) {
            view.innerHTML = '<div class="error-message">Caminho de imagem inválido ou indisponível.</div>';
            return;
        }
        const imageURL = new URL("../" + path, document.baseURI).href;
        const name = escapeHTML(product.name);
        view.innerHTML = `
            <h2 class="product-title">${name}</h2>
            <div class="product-description">${escapeHTML(product.description || "")}</div>
            <div class="product-datetime">${escapeHTML(formatDateTime(product.datetime))}</div>
            <div class="map-container">
                <a href="${escapeHTML(imageURL)}" target="_blank" rel="noopener" title="Abrir imagem original">
                    <img src="${escapeHTML(imageURL)}" alt="${name}" class="map-image">
                </a>
            </div>`;
    }

    modelSelect.addEventListener("change", function () {
        resetBelow(1);
        const model = models[modelSelect.value];
        if (!model || !Array.isArray(model.products)) return;
        currentProducts = model.products;
        const vars = [...new Set(currentProducts.map(variableFor))]
            .sort((a,b) => a.localeCompare(b, "pt"));
        setOptions(variableSelect, vars.map(v => ({value: v, label: v})), "Seleccione uma variável");
    });

    variableSelect.addEventListener("change", function () {
        resetBelow(2);
        if (!variableSelect.value) return;
        const filtered = currentProducts.filter(p => variableFor(p) === variableSelect.value);
        const levels = new Map(filtered.map(p => {
            const level = levelFor(p);
            return [level.key, level];
        }));
        const ordered = [...levels.values()].sort((a,b) => a.order - b.order || a.label.localeCompare(b.label));
        setOptions(levelSelect, ordered.map(l => ({value: l.key, label: l.label})), "Seleccione um nível");
    });

    levelSelect.addEventListener("change", function () {
        resetBelow(3);
        if (!levelSelect.value) return;
        const filtered = currentProducts.filter(p =>
            variableFor(p) === variableSelect.value && levelFor(p).key === levelSelect.value
        );
        // Usa índice, não ID, para suportar IDs repetidos entre produtos.
        const options = filtered.map((p, i) => ({value: String(i), label: p.name}));
        productSelect._filteredProducts = filtered;
        setOptions(productSelect, options, "Seleccione um produto");
    });

    productSelect.addEventListener("change", function () {
        const i = Number(productSelect.value);
        const products = productSelect._filteredProducts || [];
        showProduct(productSelect.value === "" ? null : products[i]);
    });

    fetch(manifestURL, {cache: "no-cache"})
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(manifest => {
            if (!manifest || !manifest.models || typeof manifest.models !== "object") {
                throw new Error("nwp.json inválido");
            }
            models = manifest.models;
            setOptions(modelSelect,
                Object.entries(models).map(([id, model]) => ({value: id, label: model.name || id})),
                "Seleccione um modelo"
            );
            resetBelow(1);
        })
        .catch(error => {
            console.error("Erro NWP:", error);
            view.innerHTML = '<div class="error-message">Não foi possível carregar os produtos NWP.</div>';
        });
});
