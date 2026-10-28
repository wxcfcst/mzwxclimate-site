(() => {
  const card = document.getElementById('mz-cyclone-live-alert');
  if (!card) return;
  const siteBase = new URL('../../', document.currentScript.src);
  // Exibição estrita: só com estado explicitamente confirmado e boletim datado.
  fetch(new URL('cyclones/status.json', siteBase), {cache:'no-store'})
    .then(r => {if(!r.ok) throw Error('HTTP '+r.status); return r.json();})
    .then(data => {
      const active = data?.status === 'active_confirmed';
      const name = typeof data?.system_name === 'string' ? data.system_name.trim() : '';
      const issued = typeof data?.bulletin_issued_utc === 'string' ? Date.parse(data.bulletin_issued_utc) : NaN;
      const fresh = Number.isFinite(issued) && issued <= Date.now() + 600000 && Date.now()-issued <= 18*3600000;
      if (!active || !name || !fresh) return;
      const title=document.createElement('p');title.className='mz-cyclone-alert-title';
      const badge=document.createElement('span');badge.className='mz-cyclone-alert-badge';badge.textContent='⚠️';
      title.append(badge, document.createTextNode(' Ciclone em monitorização'));
      const message=document.createElement('p');message.className='mz-cyclone-alert-text';
      message.textContent=`${name} — informação meteorológica de acompanhamento. Boletim: ${new Date(issued).toLocaleString('pt-PT',{timeZone:'UTC'})} UTC.`;
      const link=document.createElement('a');link.href=new URL('cyclones/alertas.html',siteBase).href;
      link.textContent='Consultar informações detalhadas →';
      card.replaceChildren(title,message,link);card.hidden=false;
    }).catch(() => { card.hidden=true; });
})();
