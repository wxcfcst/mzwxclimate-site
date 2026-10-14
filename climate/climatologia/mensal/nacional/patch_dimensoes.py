#!/usr/bin/env python3
"""Patch reversível para testar dimensões das figuras da climatologia mensal.

Uso:
    python3 patch_dimensoes.py
    python3 patch_dimensoes.py --file /caminho/para/index.html
    python3 patch_dimensoes.py --restore /caminho/para/index.html.bak-dimensoes-AAAAMMDD-HHMMSS
"""
from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path
import re
import shutil

DEFAULT = Path('/home/alberto/mzwxclimate-site/climate/climatologia/mensal/nacional/index.html')
START = '<!-- INICIO TESTE DIMENSOES -->'
END = '<!-- FIM TESTE DIMENSOES -->'

BLOCK = r'''<!-- INICIO TESTE DIMENSOES -->
<style>
  .dimension-tester {max-width:1100px;margin:12px auto;padding:14px;background:#f7fafc;border:1px solid #cbd5e0;border-radius:12px;box-sizing:border-box}
  .dimension-tester h2 {font-size:1.05rem;margin:0 0 8px;color:#2d3748}
  .dimension-controls {display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  .dimension-controls button,.dimension-controls select {padding:9px;border:1px solid #a0aec0;border-radius:8px;background:white;color:#2d3748;font:inherit;cursor:pointer}
  .dimension-controls button:focus-visible,.dimension-controls select:focus-visible {outline:3px solid #667eea}
  .dimension-meta {margin:10px 0 0;color:#4a5568;font-size:.9rem}
  .dimension-tester .dimension-note {font-size:.84rem;color:#718096;margin:5px 0 0}
  .climate-map.dimension-testing {width:100%;max-width:var(--test-container-width,950px);padding:var(--test-padding,14px)}
  .climate-map.dimension-testing img {width:100%;max-width:100%;height:auto;max-height:var(--test-image-height,500px);object-fit:contain}
</style>
<section class="dimension-tester" aria-label="Comparador de dimensões">
  <h2>Teste de dimensões da figura</h2>
  <div class="dimension-controls">
    <button type="button" id="dim-prev">← Anterior</button>
    <select id="dim-choice" aria-label="Combinação de dimensões"></select>
    <button type="button" id="dim-next">Próxima →</button>
    <button type="button" id="dim-auto">▶ Automático</button>
    <button type="button" id="dim-reset">Restaurar</button>
  </div>
  <p class="dimension-meta" id="dim-meta" aria-live="polite"></p>
  <p class="dimension-note">Largura do quadro × altura máxima da imagem. As proporções da figura são preservadas; o tamanho visível depende também da largura da tela.</p>
</section>
<script>
(function () {
  'use strict';
  const figure = document.querySelector('.climate-map');
  const choices = document.getElementById('dim-choice');
  const status = document.getElementById('dim-meta');
  if (!figure || !choices) return;
  const widths = [500, 600, 700, 800, 900, 950, 1000, 1100];
  const heights = [250, 350, 450, 500, 600, 700, 800, 1000];
  const combinations = [];
  // FOR: percorre todas as combinações da grade de teste (8 × 8 = 64).
  for (const width of widths) {
    for (const height of heights) {
      combinations.push({ width, height });
    }
  }
  for (let i = 0; i < combinations.length; i++) {
    const { width, height } = combinations[i];
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${width}px × ${height}px`;
    choices.appendChild(option);
  }
  let index = combinations.findIndex(x => x.width === 950 && x.height === 500);
  let timer = null;
  const storageKey = 'climate-monthly-dimension-choice';
  try {
    const stored = Number(localStorage.getItem(storageKey));
    if (localStorage.getItem(storageKey) !== null && Number.isInteger(stored) && stored >= 0 && stored < combinations.length) index = stored;
  } catch (_) {}
  function show(i) {
    index = (i + combinations.length) % combinations.length;
    const { width, height } = combinations[index];
    figure.classList.add('dimension-testing');
    figure.style.setProperty('--test-container-width', width + 'px');
    figure.style.setProperty('--test-image-height', height + 'px');
    choices.value = String(index);
    status.textContent = `Teste ${index + 1} de ${combinations.length} — quadro: ${width}px; altura máxima: ${height}px`;
    try { localStorage.setItem(storageKey, String(index)); } catch (_) {}
  }
  function stop() {
    if (timer !== null) clearInterval(timer);
    timer = null;
    document.getElementById('dim-auto').textContent = '▶ Automático';
  }
  document.getElementById('dim-prev').addEventListener('click', () => { stop(); show(index - 1); });
  document.getElementById('dim-next').addEventListener('click', () => { stop(); show(index + 1); });
  choices.addEventListener('change', () => { stop(); show(Number(choices.value)); });
  document.getElementById('dim-auto').addEventListener('click', function () {
    if (timer !== null) { stop(); return; }
    this.textContent = '■ Parar';
    timer = setInterval(() => show(index + 1), 2000);
  });
  document.getElementById('dim-reset').addEventListener('click', () => {
    stop();
    figure.classList.remove('dimension-testing');
    figure.style.removeProperty('--test-container-width');
    figure.style.removeProperty('--test-image-height');
    status.textContent = 'Estilo original restaurado (950px / 500px).';
    choices.value = String(combinations.findIndex(x => x.width === 950 && x.height === 500));
    try { localStorage.removeItem(storageKey); } catch (_) {}
  });
  show(index);
})();
</script>
<!-- FIM TESTE DIMENSOES -->'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--file', type=Path, default=DEFAULT)
    parser.add_argument('--restore', type=Path, help='Arquivo de backup a restaurar')
    args = parser.parse_args()
    target = args.file.expanduser().resolve()
    if args.restore:
        backup = args.restore.expanduser().resolve()
        if not backup.is_file(): parser.error(f'Backup não encontrado: {backup}')
        if target.exists():
            safety = target.with_name(target.name + '.antes-restauracao-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
            shutil.copy2(target, safety)
            print(f'Cópia de segurança do estado atual: {safety}')
        shutil.copy2(backup, target)
        print(f'Restaurado: {target}')
        return
    if not target.is_file(): parser.error(f'Arquivo não encontrado: {target}')
    original = target.read_text(encoding='utf-8')
    if START in original or END in original:
        parser.error('O patch já está instalado. O arquivo não foi alterado.')
    if '</main>' not in original: parser.error('Tag </main> não encontrada; nada alterado.')
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup = target.with_name(target.name + '.bak-dimensoes-' + timestamp)
    shutil.copy2(target, backup)
    patched = original.replace('</main>', BLOCK + '\n</main>', 1)
    # gravação atômica: reduz risco de HTML truncado
    temporary = target.with_name('.' + target.name + '.dimensoes.tmp')
    try:
        temporary.write_text(patched, encoding='utf-8')
        temporary.chmod(target.stat().st_mode)
        temporary.replace(target)
    finally:
        if temporary.exists(): temporary.unlink()
    print(f'Patch instalado: {target}')
    print(f'Backup original: {backup}')
    print('64 configurações (8 larguras × 8 alturas), navegação e modo automático.')
    print(f'Para restaurar: python3 {Path(__file__).name} --file "{target}" --restore "{backup}"')


if __name__ == '__main__':
    main()
