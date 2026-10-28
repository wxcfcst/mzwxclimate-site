(() => {
 const target=document.getElementById('mzwx-cyclone-monitor'); if(!target)return;
 const url=target.dataset.json || '/cyclones/status.json';
 const link='https://meteofrance.re/fr/cyclone';
 const box=(title,description,cls)=>{target.className='mzwx-cyclone '+cls;target.replaceChildren();
   const h=document.createElement('strong');h.textContent=title;
   const p=document.createElement('p');p.textContent=description;
   const a=document.createElement('a');a.href=link;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Consultar RSMC La Réunion ↗';
   target.append(h,p,a);
 };
 fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{
   const checked=new Date(d.checked_at_utc);
   if(!Number.isFinite(checked.getTime()) || Date.now()-checked.getTime()>12*3600*1000){box('🌀 Monitorização sem atualização recente','Os dados não estão atualizados. Confirme diretamente no RSMC La Réunion.','unknown');return;}
   const when=' Atualização: '+checked.toLocaleString('pt-PT',{timeZone:'UTC'})+' UTC.';
   if(d.status==='none_confirmed')box('🌀 Monitorização do Sudoeste do Índico','O último boletim consultado não indica sistemas ativos.'+when,'clear');
   else if(d.status==='review_required')box('⚠️ Consultar boletim ciclónico','Existe informação que requer verificação no RSMC La Réunion.'+when,'attention');
   else box('🌀 Informação ciclónica indisponível','Não foi possível interpretar o boletim internacional.'+when,'unknown');
 }).catch(()=>box('🌀 Informação ciclónica indisponível','Não foi possível carregar o estado ciclónico. Consulte a fonte internacional.','unknown'));
})();
