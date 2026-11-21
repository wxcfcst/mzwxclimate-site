(() => {
  'use strict';
  const siteRoot = new URL('../../', document.currentScript.src);
  const manifestURL = new URL('assets/data/indices/instability/manifest.json', siteRoot).href;
  const $ = (id) => document.getElementById(id);
  const runSelect = $('inst-run');
  const productSelect = $('inst-product');
  const img = $('inst-map');
  const status = $('inst-status');
  const details = $('inst-details');
  const download = $('inst-download');
  const placeholder = $('inst-placeholder');
  let manifest;

  function setStatus(message, kind = '') {
    status.textContent = message;
    status.dataset.kind = kind;
  }
  function makeOption(value, label) {
    const item = document.createElement('option');
    item.value = value;
    item.textContent = label;
    return item;
  }
  function updateProductOptions() {
    const run = manifest.runs.find((item) => item.id === runSelect.value);
    const previous = productSelect.value;
    productSelect.replaceChildren();
    for (const p of (run?.products || []).slice().sort((a,b) => a.name.localeCompare(b.name, 'pt'))) {
      productSelect.add(makeOption(p.id, p.name + (p.unit ? ` (${p.unit})` : '')));
    }
    if ([...productSelect.options].some(o => o.value === previous)) productSelect.value = previous;
    showImage();
  }
  function showImage() {
    const run = manifest.runs.find((item) => item.id === runSelect.value);
    const p = run?.products.find((item) => item.id === productSelect.value);
    img.hidden = true;
    img.removeAttribute('src');
    download.hidden = true;
    placeholder.hidden = false;
    if (!run || !p) {
      setStatus('Nenhum mapa disponível.', 'warning');
      details.textContent = '';
      return;
    }
    const valid = run.valid_time_utc ? `Validade: ${run.valid_time_utc}` : 'Validade: não identificada no nome do ficheiro';
    details.textContent = `Modelo GFS · Ciclo ${run.cycle_utc} UTC · +${String(run.lead_hours).padStart(3, '0')} h · ${valid}`;
    setStatus('A carregar imagem…');
    img.alt = `Mapa meteorológico: ${p.name}; ${run.id}`;
    img.onload = () => {
      placeholder.hidden = true;
      img.hidden = false;
      download.href = new URL(p.image.replace(/^\/+/, ''), siteRoot).href;
      download.download = p.image.split('/').pop();
      download.hidden = false;
      setStatus('Mapa disponível.', 'ok');
    };
    img.onerror = () => {
      img.hidden = true;
      placeholder.hidden = false;
      setStatus('O mapa consta no catálogo, mas ainda não foi publicado em assets/images.', 'warning');
    };
    img.src = new URL(p.image.replace(/^\/+/, ''), siteRoot).href;
  }
  async function init() {
    setStatus('A carregar catálogo…');
    try {
      const response = await fetch(manifestURL + '?v=' + Date.now(), {cache: 'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      manifest = await response.json();
      if (!Array.isArray(manifest.runs) || !manifest.runs.length) throw new Error('catálogo sem execuções');
      runSelect.replaceChildren();
      for (const run of manifest.runs) {
        const runLabel = `${run.id} · ciclo ${run.cycle_utc} UTC · +${String(run.lead_hours).padStart(3,'0')} h`;
        runSelect.add(makeOption(run.id, runLabel));
      }
      runSelect.disabled = false;
      productSelect.disabled = false;
      runSelect.addEventListener('change', updateProductOptions);
      productSelect.addEventListener('change', showImage);
      updateProductOptions();
      $('inst-generated').textContent = manifest.generated_at_utc ? `Catálogo gerado: ${manifest.generated_at_utc}` : '';
    } catch (error) {
      setStatus('Catálogo indisponível. Gere o manifesto e publique-o no repositório do site.', 'warning');
      details.textContent = error.message;
    }
  }
  init();
})();
