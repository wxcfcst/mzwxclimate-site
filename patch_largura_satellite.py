#!/usr/bin/env python3
"""Aumenta APENAS a largura do figsize de um script Matplotlib/Cartopy.

Uso:
    python3 patch_largura_satellite.py caminho/do/plot.py --largura 16

Cria backup .bak antes de gravar. Não altera coordenadas, altura ou HTML.
"""
from pathlib import Path
import argparse
import re
import shutil

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('script', type=Path, help='Script Python que gera o PNG')
parser.add_argument('--largura', type=float, default=16.0, help='Nova largura em polegadas (padrão 16)')
args = parser.parse_args()
path = args.script
if not path.is_file():
    parser.error(f'Arquivo não encontrado: {path}')
if args.largura <= 0:
    parser.error('A largura deve ser positiva')
original = path.read_text(encoding='utf-8')
# Encontra figuras com figsize=(largura, altura), inclusive fig = plt.figure(...) ou plt.subplots(...).
# Preserva exatamente o segundo valor (altura) e todo o código restante.
pattern = re.compile(r'(\bfigsize\s*=\s*\(\s*)(\d+(?:\.\d+)?)(\s*,\s*)(\d+(?:\.\d+)?)(\s*\))')
count = 0

def change(m):
    global count
    count += 1
    print(f'figsize: ({m.group(2)}, {m.group(4)}) -> ({args.largura:g}, {m.group(4)})')
    return f'{m.group(1)}{args.largura:g}{m.group(3)}{m.group(4)}{m.group(5)}'

updated = pattern.sub(change, original)
if not count:
    print('Nenhum figsize=(largura, altura) numérico encontrado. Arquivo não alterado.')
    print('Se seu script usa variáveis ou set_size_inches(), envie esse trecho para ajuste específico.')
    raise SystemExit(1)
backup = path.with_name(path.name + '.bak')
shutil.copy2(path, backup)
path.write_text(updated, encoding='utf-8')
print(f'OK: {count} ocorrência(s) alterada(s). Backup: {backup}')
print('Execute novamente o script original para regenerar as imagens.')
print('OBS: Cartopy pode manter a mesma largura do mapa dentro de uma figura mais larga, devido à proporção geográfica.')
