/* MZW_CYCLONE_MAP_V1 — mapa informativo das posições de boletins válidos. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = script && script.src ? new URL('../../', script.src) : new URL('./', location.href);
  const statusUrl = new URL('cyclones/status.json', base);
  const HOUR = 3600000;
  const valid = (stamp, hours) => {
    const t = Date.parse(stamp || '');
    return Number.isFinite(t) && t <= Date.now() + 600000 && Date.now() - t <= hours * HOUR;
  };
  const coordinates = item => {
    const p = item && item.position;
    if (!p || p.latitude == null || p.longitude == null) return null;
    const lat = Number(p.latitude), lon = Number(p.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return [lat, lon];
  };
  const formatPosition = ([lat, lon]) =>
    `${Math.abs(lat).toFixed(2)}°${lat < 0 ? 'S' : 'N'} / ${Math.abs(lon).toFixed(2)}°${lon < 0 ? 'W' : 'E'}`;
  const time = value => new Date(value).toLocaleString('pt-PT', {
    timeZone: 'Africa/Maputo', dateStyle: 'short', timeStyle: 'short'
  }) + ' (Moçambique)';

  function entries(data) {
    if (!data || !valid(data.checked_at_utc, 3)) return [];
    const items = [];
    if (data.status === 'active_confirmed' && valid(data.bulletin_issued_utc, 18)) {
      const systems = Array.isArray(data.systems) ? data.systems : [];
      for (const s of systems) {
        if (!valid(s.bulletin_issued_utc || data.bulletin_issued_utc, 18)) continue;
        const pos = coordinates(s);
        if (!pos) continue;
        const risk = data.experimental_risk || {};
        let level = 'yellow';
        if (risk.experimental === true && risk.level === 'red' &&
            risk.verified_official_warning === true && /^https:\/\//.test(risk.official_warning_url || '') &&
            risk.forecast_severe_impacts_within_48h === true && risk.forecast_within_500km_48h === true)
          level = 'red';
        else if (risk.experimental === true && risk.level === 'orange' &&
                 risk.verified_coastal_impact_evidence === true && risk.forecast_within_500km_72h === true)
          level = 'orange';
        items.push({pos, level, active: true, name: s.system_name || data.system_name || 'Sistema confirmado',
          kind: 'RSMC La Réunion — sistema confirmado', issued: s.bulletin_issued_utc || data.bulletin_issued_utc});
      }
      return items;
    }
    if (data.status !== 'review_required') return [];
    const warnings = Array.isArray(data.jtwc_warnings) ? data.jtwc_warnings : [];
    const formation = Array.isArray(data.formation_alerts) ? data.formation_alerts : [];
    for (const [arr, title] of [[warnings, 'JTWC — aviso operacional não confirmado pelo RSMC'],
                                 [formation, 'JTWC — potencial formação; não confirma ciclone ativo']]) {
      for (const s of arr) {
        if (!valid(s.issued_utc, 18)) continue;
        const pos = coordinates(s);
        if (pos) items.push({pos, level: 'blue', active: true,
          name: s.system_name || 'Sistema sob monitorização', kind: title, issued: s.issued_utc});
      }
    }
    // Um último aviso é histórico: nunca piscar e nunca ocultar avisos atuais.
    if (!items.length) {
      const finals = Array.isArray(data.jtwc_final_warnings) ? data.jtwc_final_warnings : [];
      for (const s of finals) {
        if (s.advisory_status !== 'final' || s.active_warning !== false || !valid(s.issued_utc, 48)) continue;
        const pos = coordinates(s);
        if (pos) items.push({pos, level: 'purple', active: false,
          name: s.system_name || 'Sistema encerrado', kind: 'JTWC — último aviso encerrado (posição histórica)', issued: s.issued_utc});
      }
    }
    return items;
  }
  // MZW_CYCLONE_MAP_TOGGLE_V1: só abre o mapa após clique explícito.
  const start = () => {
    const anchor = document.getElementById('mz-cyclone-detail-live');
    const main = document.querySelector('main');
    if (!main) return;
    fetch(statusUrl.href + '?v=' + Date.now(), {cache: 'no-store'})
      .then(res => {if (!res.ok) throw new Error('HTTP ' + res.status); return res.json();})
      .then(data => {
        const systems = entries(data);
        if (!systems.length) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mz-cyclone-map-toggle';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', 'mz-cyclone-position-map-section');
        button.textContent = '🗺️ Ver localização no mapa';

        const section = document.createElement('section');
        section.className = 'mz-cyclone-map-section';
        section.id = 'mz-cyclone-position-map-section';
        section.hidden = true;
        const h = document.createElement('h2');
        h.textContent = '🗺️ Localização dos sistemas tropicais';
        const note = document.createElement('p');
        note.className = 'mz-cyclone-map-note';
        note.textContent = 'Posições reportadas nos boletins; não constituem localização em tempo real nem trajetória prevista.';
        const mapEl = document.createElement('div');
        mapEl.id = 'mz-cyclone-position-map';
        mapEl.setAttribute('role', 'region');
        mapEl.setAttribute('aria-label', 'Mapa das posições reportadas dos sistemas tropicais');
        const summary = document.createElement('div');
        summary.className = 'mz-cyclone-map-summary';
        section.append(h, note, mapEl, summary);
        if (anchor) anchor.after(button, section);
        else main.append(button, section);

        let map = null;
        function createMap() {
          if (!window.L) {
            mapEl.textContent = 'O mapa não pôde ser carregado. As posições estão indicadas abaixo.';
          } else {
            map = L.map(mapEl, {scrollWheelZoom: false}).setView([-18, 48], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors', maxZoom: 12
            }).addTo(map);
            const bounds = [];
            for (const item of systems) {
              const icon = L.divIcon({
                className: 'mz-cyclone-map-icon', iconSize: [26, 26], iconAnchor: [13, 13],
                html: `<span class="mz-cyclone-map-dot mz-map-${item.level}${item.active ? ' mz-map-flash' : ''}" aria-hidden="true"></span>`
              });
              const marker = L.marker(item.pos, {icon}).addTo(map);
              const content = document.createElement('div');
              const name = document.createElement('strong'); name.textContent = item.name;
              const type = document.createElement('div'); type.textContent = item.kind;
              const point = document.createElement('div'); point.textContent = formatPosition(item.pos);
              const dated = document.createElement('div'); dated.textContent = 'Boletim: ' + time(item.issued);
              content.append(name, type, point, dated);
              marker.bindPopup(content);
              bounds.push(item.pos);
            }
            if (bounds.length > 1) map.fitBounds(bounds, {padding: [40, 40], maxZoom: 7});
            else map.setView(bounds[0], 6);
          }
          for (const item of systems) {
            const p = document.createElement('p');
            p.textContent = `${item.name} — ${item.kind}. Posição: ${formatPosition(item.pos)}. Boletim: ${time(item.issued)}.`;
            summary.appendChild(p);
          }
        }
        button.addEventListener('click', () => {
          const opening = section.hidden;
          section.hidden = !opening;
          button.setAttribute('aria-expanded', String(opening));
          button.textContent = opening ? '🗺️ Ocultar mapa' : '🗺️ Ver localização no mapa';
          button.classList.toggle('mz-cyclone-map-toggle-open', opening);
          if (opening) {
            if (!map && !summary.childElementCount) createMap();
            if (map) requestAnimationFrame(() => map.invalidateSize());
          }
        });
      })
      .catch(err => console.warn('MZ Cyclone mapa: dados indisponíveis', err));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
