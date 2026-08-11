


document.addEventListener("DOMContentLoaded", function(){


let products=[];


const select =
document.getElementById("product-select");


const view =
document.getElementById("product-view");



fetch("../assets/data/lsasaf/products.json")

.then(response => response.json())

.then(data=>{


products=data;


data.forEach(product=>{


if(product.available){


let option =
document.createElement("option");


option.value=product.id;

option.textContent=product.name;


select.appendChild(option);


}


});


});




select.addEventListener("change",function(){


let id=this.value;


let product =
products.find(p=>p.id===id);



if(!product){

view.innerHTML="";

return;

}



let html=`


<h2>
${product.name}
</h2>


<img 
src="../${product.latest}"
class="map-image">


<h3>
Histórico
</h3>


<div class="gallery">

`;



product.images.forEach(img=>{


html += `

<a href="../${img}" target="_blank">

<img src="../${img}">

</a>

`;


});



html +=`

</div>

`;



view.innerHTML=html;



});


});



