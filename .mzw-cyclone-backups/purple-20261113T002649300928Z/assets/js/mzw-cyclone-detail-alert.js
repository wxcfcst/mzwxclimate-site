(() => {
  'use strict';
  const script = document.currentScript;
  const base = script && script.src ? new URL('../../', script.src) : new URL('./', location.href);
  const statusUrl = new URL('cyclones/status.json', base);
  const evaluate = data => {
    const parse = v => Date.parse(v || '');
    const valid = (v, hours) => {
      const t = parse(v);
      return Number.isFinite(t) && t <= Date.now() + 600000 && Date.now() - t <= hours * 3600000;
    };
    if (!data || !valid(data.checked_at_utc, 3))
      return ['grey', '⚪ Informação operacional desatualizada', 'Não há atualização recente do gerador.'];
    if (data.status === 'active_confirmed' && valid(data.bulletin_issued_utc, 18) &&
        (data.system_name || (data.systems || []).length)) {
      const name = (data.systems || [])[0]?.system_name || data.system_name;
      const risk = data.experimental_risk || {};
      if (risk.experimental === true && risk.level === 'red' && risk.verified_official_warning === true &&
          /^https:\/\//.test(risk.official_warning_url || '') &&
          risk.forecast_severe_impacts_within_48h === true && risk.forecast_within_500km_48h === true)
        return ['red', '🔴 Alerta elevado — ' + name, 'Alerta experimental com aviso oficial verificável.'];
      if (risk.experimental === true && risk.level === 'orange' && risk.verified_coastal_impact_evidence === true &&
          risk.forecast_within_500km_72h === true)
        return ['orange', '🟠 Atenção elevada — ' + name, 'Evidência de impactos costeiros verificada.'];
      return ['yellow', '🟡 Sistema confirmado — ' + name, 'Consulte o boletim atualizado do RSMC.'];
    }
    if (data.status === 'review_required' &&
        ((data.jtwc_warnings || []).some(w => valid(w.issued_utc, 18)) ||
         (data.formation_alerts || []).some(w => valid(w.issued_utc, 18))))
      return ['blue', '🔵 Informação complementar do JTWC',
        'Aviso recente ou potencial formação sem confirmação pelo RSMC.'];
    if (['no_warnings_confirmed', 'none_confirmed'].includes(data.status) &&
        valid(data.bulletin_issued_utc, 18))
      return ['green', data.evidence_scope === 'metarea_8s_maritime_warnings'
        ? '🟢 Sem avisos marítimos ativos — METAREA VIII(S)'
        : '🟢 Sem sistemas tropicais ativos confirmados',
        'Informação de boletim recente; não exclui sistemas fora da área ou sem aviso.'];
    if (data.status === 'review_required' && (data.jtwc_final_warnings || []).some(
      w => w.active_warning === false && valid(w.issued_utc, 48)))
      return ['grey', '⚪ Aviso JTWC encerrado', 'O aviso final é histórico e não confirma a situação atual.'];
    return ['grey', '⚪ Informação operacional indisponível ou desatualizada',
      'Consulte os boletins meteorológicos originais.'];
  };
  const start = () => {
    // Preserva a página e substitui SOMENTE o pequeno painel com o título indicado.
    const title = [...document.querySelectorAll('h1,h2,h3,h4,strong')].find(el =>
      /Monitorização de Ciclones Tropicais/i.test(el.textContent || ''));
    if (!title) {
      console.warn('MZ Cyclone: título de painel não encontrado; nenhuma alteração no DOM.');
      return;
    }
    let oldPanel = title.parentElement;
    // Escolher o ancestral local, sem ocultar as seções "Fontes" e "Critérios".
    for (let i = 0, el = title.parentElement; i < 3 && el; i++, el = el.parentElement) {
      const body = el.textContent || '';
      if (body.length < 850 && /Informação operacional|boletim meteorológico original/i.test(body)) {
        oldPanel = el;
      }
    }
    const panel = document.createElement('section');
    panel.id = 'mz-cyclone-detail-live';
    panel.style.cssText = 'background:#f4fbff;border-left:5px solid #8798a8;border-radius:10px;padding:18px 20px;margin:16px 0;color:#132e4b';
    const heading = document.createElement('h2');
    heading.textContent = '🌪️ Monitorização de Ciclones Tropicais';
    heading.style.margin = '0 0 10px';
    const state = document.createElement('p');
    const desc = document.createElement('p');
    const when = document.createElement('small');
    const link = document.createElement('a');
    link.href = 'https://wwmiws.wmo.int/index.php/metareas/bulletinset/8S/html';
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'Consultar boletim meteorológico original ↗';
    panel.append(heading, state, desc, when, document.createElement('br'), link);
    oldPanel.before(panel);
    oldPanel.hidden = true;
    oldPanel.style.display = 'none';
    const colors = { green:'#269651', blue:'#2576bd', yellow:'#e3b323', orange:'#ed841c', red:'#d63e3e', grey:'#8798a8' };
    fetch(statusUrl.href + '?v=' + Date.now(), { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => {
        const [level, message, details] = evaluate(data);
        panel.style.borderLeftColor = colors[level];
        state.textContent = message; state.style.fontWeight = '700';
        desc.textContent = details;
        const stamp = Date.parse(data.bulletin_issued_utc || '');
        if (Number.isFinite(stamp) && stamp <= Date.now() + 600000 && Date.now() - stamp <= 18 * 3600000)
          when.textContent = 'Boletim: ' + new Date(stamp).toLocaleString('pt-PT', {
            timeZone: 'Africa/Maputo', dateStyle: 'short', timeStyle: 'short'
          }) + ' (Moçambique). ';
        if (typeof data.bulletin_source_url === 'string') {
          try {
            const target = new URL(data.bulletin_source_url);
            if (target.protocol === 'https:') link.href = target.href;
          } catch (_) { /* manter link oficial predefinido */ }
        }
      })
      .catch(error => {
        console.error('MZ Cyclone detalhe:', error);
        state.textContent = '⚪ Não foi possível carregar o boletim atualizado.';
        desc.textContent = 'Consulte as fontes oficiais.';
      });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
