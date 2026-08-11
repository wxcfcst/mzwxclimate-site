


/* ==========================================================
   MZ WX & Climate
   ETA Forecast Viewer
   ========================================================== */

/* ==========================================================
   Diretórios
   ========================================================== */

const IMAGE_DIR = "../assets/images/eta/";
const CSV_DIR   = "../assets/data/eta/csv/";
const TXT_DIR   = "../assets/data/eta/txt/";
const PDF_DIR   = "../assets/data/eta/pdf/";

/* ==========================================================
   Data da previsão
   (será substituída futuramente por leitura automática)
   ========================================================== */

const RUN_DATE = "20260731";

/* ==========================================================
   Variáveis disponíveis
   ========================================================== */

const VARIABLES = {

    RAIN_PRES_24H : "Precipitação",

    TMAX_24H : "Temperatura Máxima",

    TMEAN_24H : "Temperatura Média",

    TMIN_24H : "Temperatura Mínima",

    WIND_24H : "Vento"

};

/* ==========================================================
   Províncias
   ========================================================== */

const PROVINCES = [

    "cabo_delgado",

    "gaza",

    "inhambane",

    "manica",

    "maputo",

    "nampula",

    "niassa",

    "sofala",

    "tete",

    "zambezia"

];

/* ==========================================================
   Distritos
   (preencheremos todos posteriormente)
   ========================================================== */

const DISTRICTS = {

    cabo_delgado : [],

    gaza : [],

    inhambane : [],

    manica : [],

    maputo : [],

    nampula : [],

    niassa : [],

    sofala : [],

    tete : [],

    zambezia : []

};

/* ==========================================================
   Elementos HTML
   ========================================================== */

const mapVariable = document.getElementById("map-variable");

const mapDay = document.getElementById("map-day");

const mapImage = document.getElementById("map-image");


const provinceSelect =
document.getElementById("table-province");

const districtSelect =
document.getElementById("table-district");

const daySelect =
document.getElementById("table-day");


const textProvince =
document.getElementById("text-province");

const textDistrict =
document.getElementById("text-district");

const textDay =
document.getElementById("text-day");

const tableContainer =
document.getElementById("table-container");

const forecastText =
document.getElementById("forecast-text");

/* ==========================================================
   Inicialização
   ========================================================== */

document.addEventListener("DOMContentLoaded", init);


/* ==========================================================
   Inicialização da página
   ========================================================== */

function init(){

    loadProvinceLists();

    updateDistrictLists();
    
    loadManifest();

}


/* ==========================================================
   PARTE 2
   Leitura do manifesto e atualização automática dos mapas
   ========================================================== */


let manifest = null;


/* ==========================================================
   Carregar manifesto ETA
   ========================================================== */

async function loadManifest(){

    try {

        const response = await fetch(
            "../assets/data/eta/manifest.json"
        );


        if(!response.ok){

            throw new Error(
                "Manifesto ETA não encontrado"
            );

        }


        manifest = await response.json();


        console.log(
            "Manifest ETA carregado:",
            manifest
        );


        updateMap();


    } catch(error){

        console.error(
            "Erro ao carregar manifesto ETA:",
            error
        );

    }

}



/* ==========================================================
   Atualizar mapa automaticamente
   ========================================================== */

function updateMap(){


    if(!manifest){

        return;

    }


    const variable =
        mapVariable.value;


    const day =
        mapDay.value;



    if(

        manifest.maps[variable] &&
        manifest.maps[variable][day]

    ){


        mapImage.src =
            IMAGE_DIR +
            manifest.maps[variable][day];


    }

    else{


        mapImage.src =
            "../assets/images/placeholder.png";


        console.warn(
            "Mapa não encontrado:",
            variable,
            day
        );


    }

}



/* ==========================================================
   Eventos dos seletores de mapa
   ========================================================== */


mapVariable.addEventListener(
    "change",
    updateMap
);


mapDay.addEventListener(
    "change",
    updateMap
);


/* ==========================================================
   PARTE 3
   Leitura e exibição dos CSV
   ========================================================== */


/* ==========================================================
   Carregar CSV de uma província
   ========================================================== */

async function loadCSV(province){


    if(!manifest){

        console.warn(
            "Manifesto ainda não carregado."
        );

        return;

    }


    if(
        !manifest.locations[province] ||
        !manifest.locations[province].csv
    ){

        tableContainer.innerHTML =
        "<p>Não existe tabela disponível para esta localidade.</p>";

        return;

    }


    const csvFile =
        manifest.locations[province].csv;



    try{


        const response =
            await fetch(
                CSV_DIR + csvFile
            );


        const text =
            await response.text();



        createTable(text);



    }


    catch(error){


        console.error(
            "Erro ao carregar CSV:",
            error
        );


        tableContainer.innerHTML =
        "<p>Erro ao carregar tabela.</p>";

    }


}



/* ==========================================================
   Converter CSV em tabela HTML
   ========================================================== */

function createTable(csvText){


    const lines =
        csvText.trim().split("\n");


    if(lines.length < 2){

        tableContainer.innerHTML =
        "<p>CSV vazio.</p>";

        return;

    }



    let html =
    "<table>";



    lines.forEach(
        (line,index)=>{


            const columns =
                line.split(",");



            if(index===0){


                html += "<thead><tr>";


                columns.forEach(col=>{

                    html +=
                    `<th>${col}</th>`;

                });


                html +=
                "</tr></thead>";

            }


            else{


                if(index===1){

                    html += "<tbody>";

                }


                html += "<tr>";


                columns.forEach(col=>{

                    html +=
                    `<td>${col}</td>`;

                });


                html += "</tr>";

            }


        }

    );


    html += "</tbody></table>";



    tableContainer.innerHTML = html;


}



/* ==========================================================
   Evento mudança da província
   ========================================================== */

provinceSelect.addEventListener(
    "change",
    ()=>{

        const province =
            provinceSelect.value;


        loadCSV(province);

    }
);


/* ==========================================================
   PARTE 4
   Leitura e exibição dos TXT
   ========================================================== */


/* ==========================================================
   Carregar previsão em texto
   ========================================================== */

async function loadTXT(province, day){


    if(!manifest){

        console.warn(
            "Manifesto ainda não carregado."
        );

        return;

    }



    if(

        !manifest.locations[province] ||

        !manifest.locations[province].days ||

        !manifest.locations[province].days[day]

    ){


        forecastText.textContent =
        "Não existe previsão em texto disponível para esta localidade.";


        return;

    }



    const txtFile =
        manifest.locations[province].days[day];



    try{


        const response =
            await fetch(
                TXT_DIR + txtFile
            );


        const text =
            await response.text();



        forecastText.textContent =
            text;


    }


    catch(error){


        console.error(
            "Erro ao carregar TXT:",
            error
        );


        forecastText.textContent =
        "Erro ao carregar previsão em texto.";

    }


}



/* ==========================================================
   Atualizar lista de distritos
   ========================================================== */

function updateDistrictLists(){


    const province =
        provinceSelect.value;



    const districts =
        DISTRICTS[province] || [];



    districtSelect.innerHTML = "";

    textDistrict.innerHTML = "";



    districts.forEach(
        district=>{


            const option1 =
            document.createElement("option");


            option1.value =
                district;


            option1.textContent =
                district;



            districtSelect.appendChild(
                option1
            );



            const option2 =
            document.createElement("option");


            option2.value =
                district;


            option2.textContent =
                district;



            textDistrict.appendChild(
                option2
            );


        }

    );


}



/* ==========================================================
   Eventos dos seletores de texto
   ========================================================== */


provinceSelect.addEventListener(
    "change",
    ()=>{

        updateDistrictLists();

    }
);



textProvince.addEventListener(
    "change",
    ()=>{

        updateDistrictLists();

    }
);



textDay.addEventListener(
    "change",
    ()=>{


        const province =
            textProvince.value;


        const day =
            textDay.value;



        loadTXT(
            province,
            day
        );


    }
);



textDistrict.addEventListener(
    "change",
    ()=>{


        const province =
            textProvince.value;


        const day =
            textDay.value;



        loadTXT(
            province,
            day
        );


    }
);


/* ==========================================================
   PARTE 5
   Inicialização final e abertura do PDF
   ========================================================== */


/* ==========================================================
   Carregar províncias a partir do manifesto
   ========================================================== */

function loadProvinceLists(){


    if(!manifest){

        console.warn(
            "Manifesto ainda não carregado."
        );

        return;

    }


    const provinces =
        Object.keys(
            manifest.locations
        );



    provinceSelect.innerHTML = "";

    textProvince.innerHTML = "";



    provinces.forEach(
        province=>{


            const option1 =
            document.createElement("option");


            option1.value =
                province;


            option1.textContent =
                province.replace(
                    "_",
                    " "
                ).toUpperCase();



            provinceSelect.appendChild(
                option1
            );



            const option2 =
            document.createElement("option");


            option2.value =
                province;


            option2.textContent =
                province.replace(
                    "_",
                    " "
                ).toUpperCase();



            textProvince.appendChild(
                option2
            );


        }

    );


    updateDistrictLists();


}



/* ==========================================================
   Abrir boletim PDF
   ========================================================== */

function openPDF(){


    if(

        manifest &&

        manifest.pdf

    ){


        window.open(

            PDF_DIR + manifest.pdf,

            "_blank"

        );


    }


    else{


        alert(
            "Boletim PDF não disponível."
        );


    }

}



/* ==========================================================
   Inicialização definitiva
   ========================================================== */

async function init(){


    await loadManifest();


    loadProvinceLists();


    updateMap();


}



