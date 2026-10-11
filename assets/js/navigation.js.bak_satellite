(() => {
const base = new URL('../../', document.currentScript.src);
const items = [["Início", "index.html"], ["Clima", "climate/index.html"], ["Previsão", [["Tempo", null], ["Climática", "climate/index.html", [["Sazonal", "climate/seasonal.html"], ["Subsazonal", "climate/subseasonal.html"]]]]], ["Astronomia", [["☀️ Sol", [["Ângulo Solar Zenital", "astronomy/solar_zenith.html"], ["Nascer & Pôr do Sol | Distância: Terra - Sol", "astronomy/sun.html"], ["Ângulo Solar Zenital Anual", "astronomy/solar_zenith_annual.html"], ["Irradiância Solar no TOA", "astronomy/solar_irradiance_toa.html"], ["Irradiação Solar: ERA5-Land", "astronomy/solar_radiation_era5land.html"]]], ["🌙 Lua", null]]], ["Contacto", null], ["Sobre", "about/index.html"], ["Observações", [["Estação", null], ["Radar", null], ["Sondagem", [["uwyo", "https://weather.arcc.uwyo.edu/upperair/sounding.shtml"]]], ["Códigos", [["METAR", "weather/metar.html"]]], ["Satélite", [["Produtos", "satellite/index.html"]]], ["NWP", "nwp/index.html"]]], ["Modelos", [["Dinâmicos", null], ["Estatísticos", null]]]];
// Cabeçalhos reservados para conteúdos futuros.
items.push(['Guia do Site', 'guia/index.html'], ['Aprender', null]);

// Posiciona o Guia imediatamente após Início.
const posicaoGuia = items.findIndex(item => item[0] === 'Guia do Site');
if (posicaoGuia >= 0) {
  const [guia] = items.splice(posicaoGuia, 1);
  const posicaoInicio = items.findIndex(item => item[0] === 'Início');
  items.splice(posicaoInicio >= 0 ? posicaoInicio + 1 : 0, 0, guia);
}

function render(rows){const ul=document.createElement('ul');for(const [label,target,children] of rows){const li=document.createElement('li');if(Array.isArray(target)||children){const d=document.createElement('details'),s=document.createElement('summary');s.textContent=label;d.append(s);let entries=children||target;if(children) entries=children;d.append(render(entries));li.append(d);}else if(target){const a=document.createElement('a');a.textContent=label;a.href=new URL(target,base);li.append(a);}else{const s=document.createElement('span');s.className='mz-disabled';s.setAttribute('aria-disabled','true');s.textContent=label;li.append(s);}ul.append(li);}return ul;}
function mount(){document.querySelectorAll('header.site-header,header.mz-header,#mz-main-header').forEach(e=>e.remove());const header=document.createElement('header');header.className='mz-header';const brand=document.createElement('a');brand.className='mz-brand';brand.href=new URL('index.html',base);brand.textContent='MZ WX & Climate';
const animacao=document.createElement('img');
animacao.className='mz-brand-animation';
animacao.src=new URL('assets/images/home/lightningstorm.gif',base).href;
animacao.alt='';
animacao.width=48;
animacao.height=40;
brand.prepend(animacao);const nav=document.createElement('nav');nav.setAttribute('aria-label','Navegação principal');const list=render(items);list.className='mz-menu';nav.append(list);header.append(brand,nav);document.body.prepend(header);document.addEventListener('click',e=>{if(!header.contains(e.target))header.querySelectorAll('details[open]').forEach(d=>d.open=false)});document.addEventListener('keydown',e=>{if(e.key==='Escape')header.querySelectorAll('details[open]').forEach(d=>d.open=false)});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
