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
     'pt-PT',{timeZone:'Africa/Maputo'})+' (UTC+2)');

  }else if(d.status==='none_confirmed' && fresh){
   add('p','O boletim recente confirma ausência de sistemas ativos.');

  }else if(d.status==='off_season'){
   add('p','Fora da época de monitorização regular.');

  }else if(d.status==='review_required'){
   const hasRecentJtwc = ['jtwc_warnings','formation_alerts']
     .some(key =>
       Array.isArray(d[key]) &&
       d[key].some(item => {
         const issued = Date.parse(item?.issued_utc || '');
         return Number.isFinite(issued) &&
                issued <= Date.now() + 600000 &&
                Date.now() - issued <= 18 * 3600000;
       })
     );

   add('p', hasRecentJtwc
     ? 'Informação complementar do JTWC disponível abaixo. ' +
       'Confirmação pelo RSMC La Réunion não estabelecida.'
     : 'Informação operacional não confirmada ou desatualizada. ' +
       'Consulte os centros meteorológicos oficiais.');

  }else{
   add('p','⚠️ Informação operacional indisponível ou desatualizada.');
  }



  // ==========================================================
  // JTWC — AVISOS OPERACIONAIS E ALERTAS DE FORMAÇÃO
  // Fonte complementar; não constitui confirmação do RSMC.
  // ==========================================================

  const validJtwcDate = value => {
    const timestamp = Date.parse(value || '');

    return Number.isFinite(timestamp) &&
           timestamp <= Date.now() + 600000 &&
           Date.now() - timestamp <= 18 * 3600000;
  };

  const formatJtwcDate = value =>
    new Date(value).toLocaleString('pt-PT', {
      timeZone: 'Africa/Maputo'
    }) + ' (UTC+2)';

  const formatJtwcPosition = position => {
    if (!position) return null;

    const lat = Number(position.latitude);
    const lon = Number(position.longitude);

    if (!Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180) {
      return null;
    }

    return Math.abs(lat).toLocaleString('pt-PT') +
           '° ' + (lat < 0 ? 'S' : 'N') +
           ' / ' +
           Math.abs(lon).toLocaleString('pt-PT') +
           '° ' + (lon < 0 ? 'W' : 'E');
  };

  const addJtwcLink = url => {
    if (!url) return;

    try {
      const parsed = new URL(url);

      if (parsed.protocol !== 'https:' ||
          parsed.hostname !== 'www.metoc.navy.mil' ||
          !parsed.pathname.startsWith('/jtwc/')) {
        return;
      }

      const p = document.createElement('p');
      const a = document.createElement('a');

      a.href = parsed.href;
      a.textContent = 'Consultar boletim original do JTWC ↗';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      p.append(a);
      host.append(p);

    } catch (_) {
      // Endereço inválido: não criar link.
    }
  };

  // ----------------------------------------------------------
  // 2.1 AVISOS OPERACIONAIS DE CICLONES ATIVOS
  // ----------------------------------------------------------

  if (Array.isArray(d.jtwc_warnings)) {

    const warnings = d.jtwc_warnings.filter(w =>
      w &&
      w.authority === 'JTWC' &&
      validJtwcDate(w.issued_utc)
    );

    if (warnings.length) {

      add('h3', '🌪️ Sistemas tropicais em acompanhamento — JTWC');

      add(
        'p',
        'Foram identificados avisos operacionais recentes ' +
        'emitidos pelo Joint Typhoon Warning Center (JTWC).'
      );

      for (const w of warnings) {

        add(
          'h3',
          '🌀 ' + (w.system_name || 'Sistema tropical')
        );

        add(
          'p',
          'Classificação: ' +
          (w.classification || 'Não disponível')
        );

        const position = formatJtwcPosition(w.position);

        if (position) {
          add('p', 'Posição: ' + position);
        }

        if (w.wind_kt != null &&
            Number.isFinite(Number(w.wind_kt))) {

          add(
            'p',
            'Vento máximo sustentado (JTWC, média de 1 minuto): ' +
            Number(w.wind_kt) + ' nós'
          );
        }

        if (w.pressure_hpa != null &&
            Number.isFinite(Number(w.pressure_hpa))) {

          add(
            'p',
            'Pressão central: ' +
            Number(w.pressure_hpa) + ' hPa'
          );
        }

        if (w.movement) {

          const direction = Number(w.movement.direction_degrees);
          const speed = Number(w.movement.speed_kt);

          if (Number.isFinite(direction) &&
              Number.isFinite(speed) &&
              direction >= 0 &&
              direction <= 360 &&
              speed >= 0) {

            add(
              'p',
              'Deslocamento: ' +
              direction + '°, a ' +
              speed + ' nós'
            );
          }
        }

        if (w.warning_number) {
          add(
            'p',
            'Número do aviso JTWC: ' + w.warning_number
          );
        }

        add(
          'p',
          'Emissão: ' + formatJtwcDate(w.issued_utc)
        );

        add(
          'p',
          'Fonte: Joint Typhoon Warning Center (JTWC).'
        );

        add(
          'small',
          'Informação operacional complementar. ' +
          'Não constitui confirmação pelo RSMC La Réunion ' +
          'nem aviso meteorológico oficial para Moçambique.'
        );

        addJtwcLink(w.source_url);
      }
    }
  }

  // ----------------------------------------------------------
  // 2.2 ALERTAS DE POTENCIAL FORMAÇÃO (TCFA)
  // ----------------------------------------------------------

  if (Array.isArray(d.formation_alerts)) {

    const alerts = d.formation_alerts.filter(a =>
      a &&
      a.authority === 'JTWC' &&
      validJtwcDate(a.issued_utc)
    );

    if (alerts.length) {

      add(
        'h3',
        '🟡 Alertas de potencial formação tropical — JTWC'
      );

      for (const a of alerts) {

        add(
          'h3',
          a.system_name || 'Sistema sob investigação'
        );

        add(
          'p',
          'Potencial de desenvolvimento: ' +
          (a.development_potential || 'Não determinado')
        );

        const position = formatJtwcPosition(a.position);

        if (position) {
          add('p', 'Posição: ' + position);
        }

        if (Array.isArray(a.wind_kt_range) &&
            a.wind_kt_range.length === 2) {

          const min = Number(a.wind_kt_range[0]);
          const max = Number(a.wind_kt_range[1]);

          if (Number.isFinite(min) &&
              Number.isFinite(max) &&
              min >= 0 &&
              max >= min) {

            add(
              'p',
              'Vento estimado: ' +
              min + '–' + max + ' nós'
            );
          }
        }

        add(
          'p',
          'Emissão: ' + formatJtwcDate(a.issued_utc)
        );

        add(
          'small',
          'TCFA indica potencial formação. ' +
          'Não confirma a existência de um ciclone tropical ativo. ' +
          'Não constitui aviso oficial para Moçambique.'
        );

        addJtwcLink(a.source_url);
      }
    }
  }

  // ==========================================================
  // FIM DA INTEGRAÇÃO JTWC
  // ==========================================================

  // Observações meteorológicas complementares.
  // Não constituem confirmação operacional do RSMC.
  if (Array.isArray(d.maritime_observations)) {
    for (const observation of d.maritime_observations) {

      const issued = Date.parse(observation.issued_utc || '');
      const valid = Number.isFinite(issued) &&
                    issued <= Date.now() + 600000 &&
                    Date.now() - issued <= 18 * 3600000;

      if (!valid) continue;

      add('h3', '🔵 Observação meteorológica complementar');

      const classification = observation.classification || 'Sistema tropical';
      add('p', 'Classificação: ' + classification);

      if (observation.position) {
        const lat = Number(observation.position.latitude);
        const lon = Number(observation.position.longitude);

        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          add('p', 'Posição: ' +
              Math.abs(lat) + '° ' + (lat < 0 ? 'S' : 'N') +
              ' / ' +
              Math.abs(lon) + '° ' + (lon < 0 ? 'W' : 'E'));
        }
      }

      if (observation.pressure_hpa != null) {
        add('p', 'Pressão: ' + observation.pressure_hpa + ' hPa');
      }

      if (observation.movement) {
        add('p', 'Movimento: ' +
            (observation.movement.direction || 'Não disponível') +
            (observation.movement.speed_kt != null
              ? ', ' + observation.movement.speed_kt + ' nós'
              : ''));
      }

      add('p', 'Boletim: ' +
          new Date(issued).toLocaleString('pt-PT', {
            timeZone: 'Africa/Maputo'
          }) + ' (UTC+2)');

      add('small',
          'Fonte: Mauritius Meteorological Services. ' +
          'Informação complementar, sem confirmação de alerta pelo RSMC. ' +
          'Não constitui aviso oficial para Moçambique.');
    }
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
