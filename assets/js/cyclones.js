/* MZWXClimate Cyclones - dados externos são texto, nunca HTML */
(()=>{
const cyclonesBase = new URL('../../cyclones/', document.currentScript.src);
const host=document.getElementById('mzw-cyclone-monitor');
if(host){
 fetch(new URL('status.json',cyclonesBase),{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()})
 .then(d=>{
  host.replaceChildren();

  const add=(tag,value)=>{
   const e=document.createElement(tag);
   e.textContent=value;
   host.append(e);
  };

  add('h2','🌪️ Monitorização de Ciclones Tropicais');

  const issued=Date.parse(d.bulletin_issued_utc||'');
  const fresh=Number.isFinite(issued)&&
              issued<=Date.now()+600000&&
              Date.now()-issued<=18*3600000;

  if(d.status==='active_confirmed' && fresh &&
     Array.isArray(d.systems) && d.systems.length){

   add('h3','⚠️ Sistema tropical em monitorização');

   for(const s of d.systems){
    add('h3',s.system_name||'Sistema tropical');
    add('p','Classificação: '+(s.classification||'Não disponível'));

    if(s.position){
     const lat=Number(s.position.latitude);
     const lon=Number(s.position.longitude);
     if(Number.isFinite(lat)&&Number.isFinite(lon)){
      add('p','Posição: '+Math.abs(lat)+'° '+(lat<0?'S':'N')+
          ' / '+Math.abs(lon)+'° '+(lon<0?'W':'E'));
     }
    }

    if(s.pressure_hpa!=null)
     add('p','Pressão central: '+s.pressure_hpa+' hPa');

    if(s.movement)
     add('p','Movimento: '+(s.movement.direction||'Não disponível')+
         (s.movement.speed_kt!=null?
          ', '+s.movement.speed_kt+' nós':''));

    if(s.warning_number)
     add('p','Boletim: '+s.warning_number);
   }

   add('p','Emissão: '+new Date(issued).toLocaleString(
     'pt-PT',{timeZone:'UTC'})+' UTC');

  }else if(d.status==='none_confirmed' && fresh){
   add('p','O boletim recente confirma ausência de sistemas ativos.');

  }else if(d.status==='off_season'){
   add('p','Fora da época de monitorização regular.');

  }else if(d.status==='review_required'){
   add('p','Boletim disponível. Consulte a fonte oficial.');

  }else{
   add('p','⚠️ Informação operacional indisponível ou desatualizada.');
  }

  const p=document.createElement('p');
  const a=document.createElement('a');
  a.href=d.bulletin_source_url||'https://meteofrance.re/fr/cyclone';
  a.textContent='Consultar boletim meteorológico original ↗';
  a.target='_blank';
  a.rel='noopener noreferrer';
  p.append(a);
  host.append(p);

  add('small','Fonte: RSMC La Réunion / Météo-France. Informação não constitui aviso oficial para Moçambique.');

 }).catch(()=>{
  host.textContent='🌪️ Monitorização indisponível. Consulte o RSMC La Réunion.';
 });
}
const table=document.querySelector('[data-cyclone-history]');
if(table){const summary=document.getElementById('cy-summary'),q=document.getElementById('cy-search');fetch(new URL('history.json', cyclonesBase)).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{const storms=Array.isArray(d.storms)?d.storms:[];
function draw(){
 const term=(q.value||'').trim().toLowerCase();
 const wrapper=table.closest('.cy-table-wrap');

 table.replaceChildren();

 if(!term){
  wrapper.hidden=true;
  summary.textContent='Pesquise pelo nome, ano ou identificador (SID) de um ciclone.';
  return;
 }

 const found=storms.filter(s=>
  String((s.name||'')+' '+(s.season||'')+' '+(s.sid||''))
  .toLowerCase().includes(term)
 );

 wrapper.hidden=found.length===0;

 for(const s of found){
  const tr=document.createElement('tr');
  for(const val of [
   s.season,s.name,s.closest_time_utc,
   s.min_anchor_distance_km,s.wmo_wind_kt
  ]){
   const td=document.createElement('td');
   td.textContent=val==null?'—':String(val);
   tr.append(td);
  }
  table.append(tr);
 }

 summary.textContent=found.length
  ? `${found.length} trajetórias encontradas (proximidade geográfica; impactos não comprovados).`
  : 'Nenhum ciclone encontrado para esta pesquisa.';
}
q.addEventListener('input',draw);draw();}).catch(()=>summary.textContent='Histórico não disponível.');}
})();
