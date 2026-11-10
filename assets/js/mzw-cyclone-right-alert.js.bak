(() => {
  const card = document.getElementById('mz-cyclone-live-alert');
  if (!card) return;

  const siteBase = new URL('../../', document.currentScript.src);

  const add = (tag, text, className = '') => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    card.appendChild(element);
    return element;
  };

  const setLevel = (level) => {
    for (const name of ['yellow', 'orange', 'red', 'grey']) {
      card.classList.remove('mz-risk-' + name);
    }
    card.classList.add('mz-risk-' + level);
  };

  const showUnavailable = (message) => {
    setLevel('grey');
    card.replaceChildren();

    add('p', '🌪️ Monitorização de ciclones tropicais',
        'mz-cyclone-alert-title');

    add('p', '⚪ ' + message, 'mz-cyclone-alert-text');

    const link = add('a', 'Consultar monitorização detalhada →');
    link.href = new URL('cyclones/alertas.html', siteBase).href;

    card.hidden = false;
  };

  fetch(new URL('cyclones/status.json', siteBase), {
    cache: 'no-store'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    return response.json();
  })
  .then(data => {

    const issued = Date.parse(data.bulletin_issued_utc || '');

    const fresh =
      Number.isFinite(issued) &&
      issued <= Date.now() + 600000 &&
      Date.now() - issued <= 18 * 3600000;

    const systems = Array.isArray(data.systems)
      ? data.systems
      : [];


    // Observações marítimas complementares válidas.
    const maritime = Array.isArray(data.maritime_observations)
      ? data.maritime_observations.filter(obs => {
          const t = Date.parse(obs.issued_utc || '');
          return Number.isFinite(t) &&
                 t <= Date.now() + 600000 &&
                 Date.now() - t <= 18 * 3600000 &&
                 obs.confirmed_by_rsmc === false;
        })
      : [];

    // Quando não há confirmação operacional, apresentar
    // a informação marítima separadamente.
    if (data.status !== 'active_confirmed' && maritime.length) {
      setLevel('grey');
      card.replaceChildren();

      add('p',
          '🌪️ Monitorização de ciclones tropicais',
          'mz-cyclone-alert-title');

      add('p',
          '⚪ Informação operacional não confirmada pelo RSMC.',
          'mz-cyclone-alert-text');

      for (const obs of maritime) {
        const classification =
          obs.classification === 'tropical depression'
            ? 'Depressão tropical'
            : obs.classification === 'tropical disturbance'
              ? 'Perturbação tropical'
              : 'Sistema tropical';

        add('p',
            '🔵 Observação complementar: ' + classification,
            'mz-cyclone-alert-text');

        if (obs.position) {
          const lat = Number(obs.position.latitude);
          const lon = Number(obs.position.longitude);

          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            add('p',
                'Posição: ' +
                Math.abs(lat) + '° ' + (lat < 0 ? 'S' : 'N') +
                ' / ' +
                Math.abs(lon) + '° ' + (lon < 0 ? 'W' : 'E'),
                'mz-cyclone-alert-text');
          }
        }
      }

      add('small',
          'Fonte: Mauritius Meteorological Services. ' +
          'Não constitui aviso oficial para Moçambique.');

      const link = add('a', 'Consultar monitorização detalhada →');
      link.href = new URL('cyclones/alertas.html', siteBase).href;

      card.hidden = false;
      return;
    }


    // ==========================================================
    // MZW_JTWC_HOME_INTEGRATION_V1
    // JTWC: monitorização complementar na página inicial.
    // Não atribuir níveis de risco a Moçambique sem
    // confirmação e evidências oficiais verificáveis.
    // ==========================================================

    const validJtwcDate = value => {
      const t = Date.parse(value || '');

      return Number.isFinite(t) &&
             t <= Date.now() + 600000 &&
             Date.now() - t <= 18 * 3600000;
    };

    const jtwcWarnings = Array.isArray(data.jtwc_warnings)
      ? data.jtwc_warnings.filter(w =>
          w &&
          w.authority === 'JTWC' &&
          w.confirmed_by_rsmc === false &&
          validJtwcDate(w.issued_utc)
        )
      : [];

    const jtwcFormation = Array.isArray(data.formation_alerts)
      ? data.formation_alerts.filter(a =>
          a &&
          a.authority === 'JTWC' &&
          validJtwcDate(a.issued_utc)
        )
      : [];

    // Apresentar JTWC apenas quando não existe confirmação
    // operacional do RSMC e o estado exige revisão.
    if (data.status === 'review_required' &&
        (jtwcWarnings.length || jtwcFormation.length)) {

      setLevel('grey');
      card.replaceChildren();

      add(
        'p',
        '🌪️ Monitorização de ciclones tropicais',
        'mz-cyclone-alert-title'
      );

      if (jtwcWarnings.length) {

        add(
          'p',
          '🔵 Sistema tropical identificado pelo JTWC',
          'mz-cyclone-alert-text'
        );

        for (const w of jtwcWarnings) {

          add(
            'p',
            'Sistema: ' + (w.system_name || 'Não identificado'),
            'mz-cyclone-alert-text'
          );

          if (w.position) {
            const lat = Number(w.position.latitude);
            const lon = Number(w.position.longitude);

            if (Number.isFinite(lat) &&
                Number.isFinite(lon) &&
                Math.abs(lat) <= 90 &&
                Math.abs(lon) <= 180) {

              add(
                'p',
                'Posição: ' +
                Math.abs(lat) + '° ' + (lat < 0 ? 'S' : 'N') +
                ' / ' +
                Math.abs(lon) + '° ' + (lon < 0 ? 'W' : 'E'),
                'mz-cyclone-alert-text'
              );
            }
          }

          if (w.wind_kt != null &&
              Number.isFinite(Number(w.wind_kt))) {

            add(
              'p',
              'Vento máximo sustentado: ' +
              Number(w.wind_kt) + ' nós (média de 1 min)',
              'mz-cyclone-alert-text'
            );
          }

          const issued = new Date(w.issued_utc);

          add(
            'p',
            'Boletim: ' +
            issued.toLocaleString('pt-PT', {
              timeZone: 'Africa/Maputo'
            }) +
            ' (UTC+2)',
            'mz-cyclone-alert-text'
          );
        }
      }

      if (jtwcFormation.length) {

        add(
          'p',
          '🟡 Potencial formação tropical — JTWC',
          'mz-cyclone-alert-text'
        );

        for (const alert of jtwcFormation) {
          add(
            'p',
            (alert.system_name || 'Sistema sob investigação') +
            ' — potencial: ' +
            (alert.development_potential || 'não determinado'),
            'mz-cyclone-alert-text'
          );
        }
      }

      add(
        'small',
        'Fonte complementar: JTWC. ' +
        'Confirmação pelo RSMC La Réunion não estabelecida. ' +
        'Não constitui aviso oficial para Moçambique.'
      );

      const link = add(
        'a',
        'Consultar monitorização detalhada →'
      );

      link.href = new URL(
        'cyclones/alertas.html',
        siteBase
      ).href;

      card.hidden = false;
      return;
    }

    // ==========================================================
    // MZW_JTWC_FINAL_HOME_INTEGRATION_V2
    // Exibir aviso FINAL recente, sem interpretá-lo como alerta ativo.
    // ==========================================================
    const jtwcFinal = Array.isArray(data.jtwc_final_warnings)
      ? data.jtwc_final_warnings.filter(w => {
          if (!w || w.authority !== 'JTWC' ||
              w.advisory_status !== 'final' || w.active_warning !== false) {
            return false;
          }
          const t = Date.parse(w.issued_utc || '');
          return Number.isFinite(t) &&
                 t <= Date.now() + 600000 &&
                 Date.now() - t <= 48 * 3600000;
        })
      : [];

    if (data.status === 'review_required' && jtwcFinal.length) {
      setLevel('grey');
      card.replaceChildren();
      add('p', '🌪️ Monitorização de ciclones tropicais',
          'mz-cyclone-alert-title');
      for (const w of jtwcFinal) {
        add('p', '🔵 ' + (w.system_name || 'Sistema tropical') +
            ' — último aviso JTWC encerrado.', 'mz-cyclone-alert-text');
        const issueDate = new Date(w.issued_utc);
        add('p', 'Último boletim: ' + issueDate.toLocaleString('pt-PT', {
          timeZone: 'Africa/Maputo',
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }) + ' (hora de Moçambique)', 'mz-cyclone-alert-text');
        if (w.position && Number.isFinite(Number(w.position.latitude)) &&
            Number.isFinite(Number(w.position.longitude))) {
          const lat = Number(w.position.latitude);
          const lon = Number(w.position.longitude);
          if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
            add('p', 'Última posição: ' + Math.abs(lat) + '° ' +
                (lat < 0 ? 'S' : 'N') + ' / ' + Math.abs(lon) + '° ' +
                (lon < 0 ? 'W' : 'E'), 'mz-cyclone-alert-text');
          }
        }
        if (typeof w.source_url === 'string' &&
            /^https:\/\//i.test(w.source_url)) {
          const source = add('a', 'Consultar último aviso do JTWC →');
          source.href = w.source_url;
          source.target = '_blank';
          source.rel = 'noopener noreferrer';
        }
      }
      add('small', 'Avisos JTWC encerrados. Esta informação não confirma ' +
          'a ausência de outros sistemas tropicais e não constitui ' +
          'aviso oficial para Moçambique.');
      const link = add('a', 'Consultar monitorização detalhada →');
      link.href = new URL('cyclones/alertas.html', siteBase).href;
      card.hidden = false;
      return;
    }
    // FIM MZW_JTWC_FINAL_HOME_INTEGRATION_V2

    // FIM MZW_JTWC_HOME_INTEGRATION_V1

    const firstSystem = systems[0];

    const name =
      firstSystem?.system_name ||
      data.system_name ||
      '';

    if (
      data.status !== 'active_confirmed' ||
      !fresh ||
      !name
    ) {
      if (data.status === 'none_confirmed' && fresh) {
        showUnavailable(
          'Boletim atualizado: nenhum sistema tropical ativo confirmado.'
        );
      } else {
        showUnavailable(
          'Informação operacional indisponível ou desatualizada. ' +
          'Consulte os boletins oficiais.'
        );
      }
      return;
    }

    const risk = data.experimental_risk;

    let level = 'yellow';

    if (risk?.experimental === true) {
      if (
        risk.level === 'orange' &&
        risk.verified_coastal_impact_evidence === true &&
        risk.forecast_within_500km_72h === true
      ) {
        level = 'orange';
      }

      if (
        risk.level === 'red' &&
        risk.verified_official_warning === true &&
        typeof risk.official_warning_url === 'string' &&
        /^https:\/\//.test(risk.official_warning_url) &&
        risk.forecast_severe_impacts_within_48h === true &&
        risk.forecast_within_500km_48h === true
      ) {
        level = 'red';
      }
    }

    setLevel(level);
    card.replaceChildren();

    add('p', '⚠️ Ciclone em monitorização',
        'mz-cyclone-alert-title');

    add(
      'p',
      name + ' — boletim emitido em ' +
      new Date(issued).toLocaleString('pt-PT', {
        timeZone: 'Africa/Maputo'
      }) +
      ' (UTC+2).',
      'mz-cyclone-alert-text'
    );

    const link = add('a', 'Consultar informações detalhadas →');
    link.href = new URL('cyclones/alertas.html', siteBase).href;

    card.hidden = false;

  })
  .catch(error => {
    console.error('Erro na monitorização de ciclones:', error);

    showUnavailable(
      'Não foi possível carregar os dados de monitorização.'
    );
  });

})();
