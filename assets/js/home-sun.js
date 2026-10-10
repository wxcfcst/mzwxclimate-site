
(() => {
  const obter = id => document.getElementById(id);
  const hora = zona => new Intl.DateTimeFormat('pt-PT', {
    timeZone: zona, hour: '2-digit', minute: '2-digit',
    second: '2-digit', hourCycle: 'h23'
  });
  const horaUTC = hora('UTC');
  const horaMZ = hora('Africa/Maputo');
  const dataMZ = new Intl.DateTimeFormat('pt-PT', {
    timeZone: 'Africa/Maputo',
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const partesData = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Maputo',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  function hojeMZ() {
    const partes = Object.fromEntries(
      partesData.formatToParts(new Date())
        .filter(p => p.type !== 'literal')
        .map(p => [p.type, p.value])
    );
    const amanha = new Date(Date.UTC(
      Number(partes.year),
      Number(partes.month) - 1,
      Number(partes.day) + 1
    ));
    return {
      ano: amanha.getUTCFullYear(),
      mes: amanha.getUTCMonth() + 1,
      dia: amanha.getUTCDate(),
      chave: amanha.toISOString().slice(0, 10)
    };
  }

  let localidades = [];
  let indice = 0;
  let dataExibida = '';

  function mostrarLocalidade(piscar = true) {
    if (!localidades.length) return;
    const local = localidades[indice];
    const data = hojeMZ();

    // Utiliza exatamente o cálculo já usado em astronomy/sun.html.
    const sol = calculateSunTimes(
      Number(local.lat), Number(local.lon),
      data.ano, data.mes, data.dia
    );
    if (!sol || !sol.sunrise || !sol.sunset) {
      throw new Error('O cálculo solar não retornou os horários esperados.');
    }

    obter('mz-sun-date').textContent =
      'Amanhã · ' + new Intl.DateTimeFormat('pt-PT', {
        timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric'
      }).format(new Date(Date.UTC(data.ano, data.mes - 1, data.dia)));
    obter('mz-sun-province').textContent = local.province;
    obter('mz-sun-location').textContent = local.district;
    obter('mz-sun-rise').textContent = sol.sunrise;
    obter('mz-sun-set').textContent = sol.sunset;
    dataExibida = data.chave;

    // A piscada acontece apenas ao trocar a localidade.
    const amostra = obter('mz-sun-sample');
    amostra.classList.remove('mz-sun-change');
    if (piscar) {
      void amostra.offsetWidth;
      amostra.classList.add('mz-sun-change');
    }
  }

  function atualizarRelogios() {
    const agora = new Date();
    obter('mz-clock-utc').textContent = horaUTC.format(agora);
    obter('mz-clock-local').textContent = horaMZ.format(agora);
    obter('mz-clock-date').textContent = dataMZ.format(agora);
    if (localidades.length && hojeMZ().chave !== dataExibida) {
      mostrarLocalidade(false);
    }
  }

  function erroSolar(erro) {
    localidades = [];
    obter('mz-sun-location').textContent =
      'Informações solares indisponíveis';
    obter('mz-sun-province').textContent = '';
    obter('mz-sun-rise').textContent = '--:--';
    obter('mz-sun-set').textContent = '--:--';
    console.error('Não foi possível apresentar os horários solares:', erro);
  }

  atualizarRelogios();
  setInterval(atualizarRelogios, 1000);

  fetch('data/locations.json')
    .then(resposta => {
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return resposta.json();
    })
    .then(dados => {
      if (typeof calculateSunTimes !== 'function') {
        throw new Error('calculateSunTimes não está disponível.');
      }
      const unicas = new Map();
      for (const local of dados) {
        if (
          !local.province || !local.district ||
          local.lat == null || local.lon == null ||
          !Number.isFinite(Number(local.lat)) ||
          !Number.isFinite(Number(local.lon))
        ) continue;
        const chave = `${local.province}|${local.district}`;
        if (!unicas.has(chave)) unicas.set(chave, local);
      }
      localidades = [...unicas.values()].sort((a, b) =>
        String(a.province).localeCompare(String(b.province), 'pt') ||
        String(a.district).localeCompare(String(b.district), 'pt')
      );
      if (!localidades.length) throw new Error('Nenhuma localidade válida.');
      mostrarLocalidade(false);
      setInterval(() => {
        if (!localidades.length || document.hidden) return;
        indice = (indice + 1) % localidades.length;
        try { mostrarLocalidade(); } catch (erro) { erroSolar(erro); }
      }, 5000);
    })
    .catch(erroSolar);
})();
