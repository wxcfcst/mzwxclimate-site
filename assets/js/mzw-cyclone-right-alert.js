(() => {
  'use strict';
  const card = document.getElementById('mz-cyclone-live-alert');
  if (!card) return;
  const script = document.currentScript;
  const base = script && script.src ? new URL('../../', script.src) : new URL('./', location.href);
  const url = new URL('cyclones/status.json', base);
  const details = new URL('cyclones/alertas.html', base);
  const HOUR = 3600000;
  // Cores adicionais sem depender de regras CSS preexistentes.
  if (!document.getElementById('mz-cyclone-patch-colors')) {
    const style = document.createElement('style');
    style.id = 'mz-cyclone-patch-colors';
    style.textContent = '#mz-cyclone-live-alert.mz-risk-green{border:2px solid #299653!important;background:#e9f8ee!important;color:#164c2c!important}' +
      '#mz-cyclone-live-alert.mz-risk-blue{border:2px solid #247bb9!important;background:#edf6ff!important;color:#184c75!important}' +
      /* MZW_CYCLONE_FINAL_PURPLE_V1 */
      '#mz-cyclone-live-alert.mz-risk-purple{border:2px solid #8053b8!important;background:#f3ebfb!important;color:#44236f!important}';
    document.head.appendChild(style);
  }

  const validTime = (value, maxHours) => {
    const t = Date.parse(value || '');
    return Number.isFinite(t) && t <= Date.now() + 600000 && Date.now() - t <= maxHours * HOUR;
  };
  const add = (tag, content, cls = '') => {
    const el = document.createElement(tag);
    el.textContent = content;
    if (cls) el.className = cls;
    card.appendChild(el);
    return el;
  };
  const display = (level, headline, description, stamp) => {
    for (const levelName of ['green', 'blue', 'yellow', 'orange', 'red', 'grey', 'purple']) {
      card.classList.remove('mz-risk-' + levelName);
    }
    card.classList.add('mz-risk-' + level);
    card.replaceChildren();
    add('p', '🌪️ Monitorização de ciclones tropicais', 'mz-cyclone-alert-title');
    add('p', headline, 'mz-cyclone-alert-text');
    if (description) add('p', description, 'mz-cyclone-alert-text');
    if (stamp && validTime(stamp, 18)) {
      add('small', 'Boletim: ' + new Date(stamp).toLocaleString('pt-PT', {
        timeZone: 'Africa/Maputo', dateStyle: 'short', timeStyle: 'short'
      }) + ' (Moçambique).');
    }
    const link = add('a', 'Consultar monitorização detalhada →');
    link.href = details.href;
    card.hidden = false;
  };
  const evaluate = (data) => {
    // "checked_at" é a data de execução do gerador, NÃO do boletim.
    if (!data || !validTime(data.checked_at_utc, 3)) {
      return ['grey', '⚪ Informação não atualizada', 'O gerador não publicou dados recentes. Consulte os boletins oficiais.'];
    }
    const hasBulletin = validTime(data.bulletin_issued_utc, 18);
    const s = data.status;
    const system = Array.isArray(data.systems) && data.systems.length
      ? data.systems[0] : null;
    const currentJtwc = Array.isArray(data.jtwc_warnings) && data.jtwc_warnings.some(
      w => w && validTime(w.issued_utc, 18));
    const currentFormation = Array.isArray(data.formation_alerts) && data.formation_alerts.some(
      w => w && validTime(w.issued_utc, 18));

    if (s === 'active_confirmed' && hasBulletin && (system || data.system_name)) {
      const name = (system && system.system_name) || data.system_name;
      const risk = data.experimental_risk || {};
      if (risk.experimental === true && risk.level === 'red' &&
          risk.verified_official_warning === true &&
          /^https:\/\//.test(risk.official_warning_url || '') &&
          risk.forecast_severe_impacts_within_48h === true &&
          risk.forecast_within_500km_48h === true) {
        return ['red', '🔴 Alerta elevado — ' + name, 'Aviso oficial e previsão de impactos severos verificados.', data.bulletin_issued_utc];
      }
      if (risk.experimental === true && risk.level === 'orange' &&
          risk.verified_coastal_impact_evidence === true &&
          risk.forecast_within_500km_72h === true) {
        return ['orange', '🟠 Atenção elevada — ' + name, 'Possibilidade de impactos costeiros verificada.', data.bulletin_issued_utc];
      }
      return ['yellow', '🟡 Sistema tropical confirmado: ' + name,
        'Acompanhe as atualizações do RSMC La Réunion.', data.bulletin_issued_utc];
    }
    if (s === 'review_required' && (currentJtwc || currentFormation)) {
      return ['blue', '🔵 Monitorização complementar — JTWC',
        currentJtwc ? 'Aviso operacional recente, ainda sem confirmação pelo RSMC.' :
                      'Alerta de potencial formação; não confirma ciclone ativo.'];
    }
    if ((s === 'no_warnings_confirmed' || s === 'none_confirmed') && hasBulletin) {
      const scoped = data.evidence_scope === 'metarea_8s_maritime_warnings';
      return ['green', '🟢 ' + (scoped ? 'Sem avisos marítimos ativos — METAREA VIII(S)' :
          'Sem sistemas tropicais ativos confirmados'),
        scoped ? 'Boletim oficial recente. Não exclui sistemas fora da área ou sem aviso.' :
                 'Conforme declaração explícita de fonte meteorológica recente.', data.bulletin_issued_utc];
    }
    const finals = Array.isArray(data.jtwc_final_warnings) ? data.jtwc_final_warnings.filter(
      w => w && w.active_warning === false && w.advisory_status === 'final' &&
           validTime(w.issued_utc, 48)) : [];
    if (s === 'review_required' && finals.length) {
      return ['purple', '🟣 Último aviso JTWC encerrado',
        (finals[0].system_name || 'Sistema') + ': este aviso não está ativo. Situação atual não confirmada.'];
    }
    if (s === 'off_season') {
      return ['grey', '⚪ Fora do período de monitorização automática',
        'A ausência de monitorização não significa ausência de sistemas.'];
    }
    return ['grey', '⚪ Informação operacional indisponível ou desatualizada',
      'Não há confirmação suficiente para classificar a situação atual.'];
  };
  // API compartilhada com a página detalhada para evitar duas interpretações.
  window.MZCycloneEvaluate = evaluate;
  fetch(url.href + '?v=' + Date.now(), { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => display(...evaluate(data)))
    .catch(err => {
      console.error('MZ Cyclone: falha de leitura', err);
      display('grey', '⚪ Informação temporariamente indisponível',
        'Não foi possível obter a atualização. Consulte fontes oficiais.');
    });
})();
