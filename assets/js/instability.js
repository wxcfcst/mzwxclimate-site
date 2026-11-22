(() => {
  'use strict';
  const siteRoot = new URL('../../', document.currentScript.src);
  const manifestURL = new URL('assets/data/indices/instability/manifest.json', siteRoot).href;
  const $ = id => document.getElementById(id);
  const runSelect = $('inst-run');
  const productSelect = $('inst-product');
  const showButton = $('inst-show');
  const img = $('inst-map');
  const status = $('inst-status');
  const details = $('inst-details');
  const download = $('inst-download');
  const placeholder = $('inst-placeholder');
  const initialHint = '🌩️ Escolha a análise e o índice nos campos acima e clique em «Visualizar análise».';
  let runs = [];

  function setStatus(message, kind = '') {
    status.textContent = message;
    status.dataset.kind = kind;
  }
  function option(value, label) {
    const el = document.createElement('option');
    el.value = value;
    el.textContent = label;
    return el;
  }
  function dateLabel(value) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat('pt-MZ', {
      timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).format(d).replace(',', ' —') + ' UTC';
  }
  function runLabel(run) {
    const time = dateLabel(run.valid_time_utc || run.initialization_utc);
    return time || `Análise GFS — ${run.cycle_utc || 'horário desconhecido'} UTC (data indisponível)`;
  }
  function assetURL(path) {
    if (typeof path !== 'string' || !path.startsWith('/assets/images/nwp/indices/')) {
      throw new Error('Caminho de imagem inválido no catálogo');
    }
    return new URL(path.replace(/^\/+/, ''), siteRoot).href;
  }
  function resetMap(message = initialHint) {
    img.hidden = true;
    img.removeAttribute('src');
    img.onload = null;
    img.onerror = null;
    download.hidden = true;
    download.removeAttribute('href');
    placeholder.hidden = false;
    placeholder.textContent = message;
    setStatus('');
  }
  function selectedRun() { return runs.find(r => r.id === runSelect.value); }
  function selectedProduct() {
    return selectedRun()?.products?.find(p => p.id === productSelect.value);
  }
  function updateButton() {
    showButton.disabled = !(selectedRun() && selectedProduct());
  }
  function updateProducts() {
    const run = selectedRun();
    productSelect.replaceChildren(option('', 'Selecione um índice atmosférico…'));
    for (const p of (run?.products || []).slice().sort((a, b) => a.name.localeCompare(b.name, 'pt'))) {
      productSelect.add(option(p.id, p.name + (p.unit ? ` (${p.unit})` : '')));
    }
    productSelect.value = '';
    productSelect.disabled = !run;
    details.textContent = '';
    resetMap();
    updateButton();
  }
  function showImage() {
    const run = selectedRun();
    const product = selectedProduct();
    if (!run || !product) return;
    resetMap('A carregar o mapa da análise selecionada…');
    details.textContent = `Modelo GFS · ${runLabel(run)} · ${product.name}`;
    setStatus('A carregar imagem…');
    img.alt = `Mapa da análise atmosférica: ${product.name}; ${runLabel(run)}`;
    img.onload = () => {
      placeholder.hidden = true;
      img.hidden = false;
      download.href = assetURL(product.image);
      download.download = product.image.split('/').pop();
      download.hidden = false;
      setStatus('Análise disponível.', 'ok');
    };
    img.onerror = () => {
      resetMap('Não foi possível carregar o mapa selecionado.');
      setStatus('O mapa consta no catálogo, mas a imagem não está disponível.', 'warning');
    };
    img.src = assetURL(product.image);
  }
  async function init() {
    resetMap();
    runSelect.disabled = true;
    productSelect.disabled = true;
    showButton.disabled = true;
    runSelect.replaceChildren(option('', 'A carregar análises…'));
    setStatus('A carregar catálogo…');
    try {
      const response = await fetch(manifestURL + '?v=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const manifest = await response.json();
      if (!Array.isArray(manifest.runs)) throw new Error('Catálogo inválido');
      // f000 é a análise do ciclo. Excluir prazos positivos (previsões).
      runs = manifest.runs.filter(r => Number(r.lead_hours) === 0);
      runSelect.replaceChildren(option('', 'Selecione uma análise disponível…'));
      runs.forEach(run => runSelect.add(option(run.id, runLabel(run))));
      runSelect.disabled = runs.length === 0;
      productSelect.replaceChildren(option('', 'Escolha primeiro uma análise'));
      $('inst-generated').textContent = manifest.generated_at_utc
        ? `Catálogo gerado: ${manifest.generated_at_utc}` : '';
      setStatus(runs.length ? '' : 'Não existem análises disponíveis no catálogo.', runs.length ? '' : 'warning');
    } catch (error) {
      runSelect.replaceChildren(option('', 'Catálogo indisponível'));
      setStatus('Não foi possível carregar o catálogo de análises.', 'warning');
      details.textContent = error.message;
    }
  }
  runSelect.addEventListener('change', updateProducts);
  productSelect.addEventListener('change', () => {
    resetMap();
    details.textContent = '';
    updateButton();
  });
  showButton.addEventListener('click', showImage);
  init();
})();
