(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const variable = $('ocean-variable'), region = $('ocean-region');
  const names = {
    sst: 'Temperatura da superfície do mar (TSM)',
    waves: 'Altura significativa das ondas (Hs) e vento',
    direction: 'Direção de propagação das ondas'
  };
  const regions = {global: 'Global', regional: 'África Austral / Moçambique'};
  let products = [];
  function render() {
    const card = document.querySelector('.ocean-product');
    // Nenhum mapa é mostrado antes de o visitante escolher ambas as opções.
    if (!variable.value || !region.value) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    const key = `${variable.value}_${region.value}`;
    const item = products.find(p => p.id === key);
    $('ocean-card-title').textContent = `${names[variable.value]} — ${regions[region.value]}`;
    $('ocean-date').textContent = item ? (item.valid_time_utc || item.date_utc || 'Data não disponível') + ' UTC' : '';
    const figure = $('ocean-figure');
    figure.replaceChildren();
    if (!item) {
      const missing = document.createElement('p');
      missing.className = 'ocean-empty';
      missing.textContent = 'Produto ainda não disponível para esta combinação. A última versão publicada é preservada quando uma atualização falha.';
      figure.append(missing);
      $('ocean-description').textContent = '';
      $('ocean-source').textContent = '';
      return;
    }
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = `${names[variable.value]} — ${regions[region.value]}`;
    img.loading = 'lazy';
    img.onerror = () => {figure.textContent = 'Imagem indisponível neste momento.';};
    figure.append(img);
    $('ocean-description').textContent = item.description || '';
    $('ocean-source').textContent = item.source ? `Fonte/produto: ${item.source}` : '';
  }
  async function load() {
    try {
      const r = await fetch(`../assets/data/ocean/products.json?t=${Date.now()}`, {cache:'no-store'});
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      products = Array.isArray(data.products) ? data.products : [];
      $('ocean-status').textContent = products.length
        ? `${products.length} produto(s) publicado(s) · Manifesto: ${data.generated_at_utc || 'sem data'}`
        : 'Nenhum produto publicado até ao momento.';
    } catch(e) {
      $('ocean-status').textContent = 'Não foi possível carregar o catálogo de produtos. Verifique o manifesto JSON.';
      console.error('[Oceanografia]', e);
    }
    render();
  }
  variable.addEventListener('change', render);
  region.addEventListener('change', render);
  load();
})();
