#!/usr/bin/env python3
"""Insere opção inicial obrigatória no seletor de mosaicos, com backup.
Não executa deploy nem altera produtos meteorológicos.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

PAGE = Path.home() / 'mzwxclimate-site/nwp/mosaics.html'
MARKER = '<!-- NWP_MOSAIC_SELECT_PLACEHOLDER_V1 -->'

def main():
    if not PAGE.is_file():
        raise FileNotFoundError(PAGE)
    original = PAGE.read_text(encoding='utf-8')
    if MARKER in original:
        print('O seletor já foi atualizado. Nenhuma alteração realizada.')
        return
    old = '<select id="choice"></select>'
    new = (MARKER + '\n'
           '<select id="choice" required>\n'
           '  <option value="" selected disabled>Selecione o mosaico</option>\n'
           '</select>')
    if original.count(old) != 1:
        raise ValueError('Não foi possível identificar unicamente o seletor; nenhuma alteração.')
    updated = original.replace(old, new, 1)
    old_status = "if(!item){status.textContent='Nenhum mosaico completo disponível.';valid.textContent='';return;}"
    new_status = "if(!item){status.textContent=items.length ? 'Selecione um mosaico para visualizar as cartas.' : 'Nenhum mosaico completo disponível.';valid.textContent='';return;}"
    if updated.count(old_status) != 1:
        raise ValueError('Trecho de estado inicial inesperado; nenhuma alteração.')
    updated = updated.replace(old_status, new_status, 1)
    assert '<option value="" selected disabled>Selecione o mosaico</option>' in updated
    assert 'choice.addEventListener(\'change\',render);' in updated
    stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup = PAGE.with_name(PAGE.name + f'.bak-{stamp}-selector')
    shutil.copy2(PAGE, backup)
    temp = PAGE.with_name(PAGE.name + f'.tmp-{stamp}')
    try:
        temp.write_text(updated, encoding='utf-8')
        temp.replace(PAGE)
    finally:
        temp.unlink(missing_ok=True)
    print(f'Backup: {backup}')
    print(f'Atualizado: {PAGE}')
    print('Seleção inicial vazia: nenhum mapa aparece até o visitante escolher um mosaico.')
    print('Nenhum deploy foi executado.')

if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'ERRO: {exc}', file=sys.stderr)
        sys.exit(1)
