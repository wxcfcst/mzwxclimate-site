(() => {
'use strict';
const select=document.getElementById('cy-season');
const grid=document.getElementById('cy-names-grid');
const summary=document.getElementById('cy-names-summary');
if(!select||!grid||!summary)return;
const base=new URL('../../cyclones/',document.currentScript.src);
const STATES={used:'Já utilizado',active:'Sistema ativo confirmado',available:'Disponível',neutral:'Não utilizado'};
const cleanName=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
const seasonForUTC=(date)=>{const year=date.getUTCFullYear();const start=date.getUTCMonth()>=6?year:year-1;return `${start}-${start+1}`;};
function activeNames(status, season){
  if(status?.status!=='active_confirmed'||!Array.isArray(status.systems))return new Set();
  const issued=Date.parse(status.bulletin_issued_utc||'');
  if(!Number.isFinite(issued)||issued>Date.now()+600000||Date.now()-issued>18*3600000)return new Set();
  if(season!==seasonForUTC(new Date(issued)))return new Set();
  const names=new Set();
  for(const system of status.systems){
    // Não deduzir nome a partir de 'Depressão tropical 2' ou 'Ciclone tropical'.
    const raw=String(system.system_name||'').trim();
    for(const word of raw.split(/\s+/)){
      const candidate=cleanName(word.replace(/[^\p{L}-]/gu,''));
      if(candidate.length>=3)names.add(candidate);
    }
  }
  return names;
}
function draw(db,status){
 const season=select.value;
 const entries=db.seasons[season]||[];
 const nowYearSeason=seasonForUTC(new Date());
 const active=activeNames(status,season);
 const currentOrFuture=Number(season.slice(0,4))>=Number(nowYearSeason.slice(0,4));
 grid.replaceChildren();
 let nUsed=0,nActive=0,nAvailable=0;
 for(const item of entries){
   const key=cleanName(item.name);
   const state=active.has(key)?'active':item.used?'used':currentOrFuture?'available':'neutral';
   if(state==='used')nUsed++;
   else if(state==='active')nActive++;
   else if(state==='available')nAvailable++;
   const card=document.createElement('div');card.className='cy-name-item';card.dataset.state=state;
   const name=document.createElement('strong');name.textContent=item.name;
   const country=document.createElement('small');country.textContent='Proposto por: '+item.country;
   const badge=document.createElement('small');badge.textContent=STATES[state];
   card.append(name,country,badge);grid.append(card);
 }
 summary.textContent=`Época ${season} • ${entries.length} nomes • ${nUsed} utilizados • ${nActive} ativos confirmados • ${nAvailable} disponíveis. Os estados referem-se aos nomes, não ao risco para Moçambique.`;
}
Promise.all([
 fetch(new URL('names.json',base),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Nomes HTTP '+r.status);return r.json()}),
 fetch(new URL('status.json',base),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
]).then(([db,status])=>{
 if(!db||!db.seasons)throw Error('Base de nomes inválida');
 const seasons=Object.keys(db.seasons).sort().reverse();
 const placeholder=document.createElement('option');
 placeholder.value='';
 placeholder.textContent='Escolha uma época ciclónica...';
 placeholder.disabled=true;
 select.append(placeholder);

 for(const season of seasons){
   const option=document.createElement('option');
   option.value=season;
   option.textContent=season;
   select.append(option);
 }

 // Nenhuma época selecionada inicialmente.
 select.value='';

 summary.textContent='Selecione uma época ciclónica para consultar os nomes.';
 grid.hidden=true;

 const legend=document.querySelector('.cy-names-legend');
 if(legend)legend.hidden=true;

 select.addEventListener('change',()=>{
   if(!select.value){
     grid.replaceChildren();
     grid.hidden=true;
     if(legend)legend.hidden=true;
     summary.textContent='Selecione uma época ciclónica para consultar os nomes.';
     return;
   }

   grid.hidden=false;
   if(legend)legend.hidden=false;
   draw(db,status);
 });
}).catch(err=>{console.error(err);summary.textContent='Não foi possível carregar a base de nomes. Tente novamente mais tarde.'});
})();
