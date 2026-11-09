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
