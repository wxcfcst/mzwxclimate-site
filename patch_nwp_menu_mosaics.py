#!/usr/bin/env python3
"""Integra Mosaicos NWP no menu e corrige URLs e horário da página.

Não executa NWP, deploy, git ou downloads. Faz backup e valida antes de gravar.
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

SITE = Path.home() / 'mzwxclimate-site'
NAV = SITE / 'assets/js/navigation.js'
PAGE = SITE / 'nwp/mosaics.html'


def replace_once(content, old, new, label):
    count = content.count(old)
    if count == 0 and new in content:
        print(f'[OK] {label} já está atualizado.')
        return content
    if count != 1:
        raise ValueError(f'{label}: correspondência inesperada ({count}); alteração cancelada.')
    return content.replace(old, new, 1)


def main():
    if not NAV.is_file() or not PAGE.is_file():
        raise FileNotFoundError(f'Arquivos necessários: {NAV} e {PAGE}')
    nav = NAV.read_text(encoding='utf-8')
    page = PAGE.read_text(encoding='utf-8')
    nav2 = replace_once(
        nav,
        '["Análises Atmosféricas", "nwp/index.html"]',
        '["Análises Atmosféricas", [["Cartas NWP", "nwp/index.html"], ["Mosaicos Sinóticos", "nwp/mosaics.html"]]]',
        'submenu Análises Atmosféricas'
    )
    page2 = replace_once(
        page,
        "const siteRoot = '../../'; // página: /nwp/mosaics.html -> raiz do site",
        "const siteRoot = '../'; // /nwp/mosaics.html -> raiz do site",
        'URL base das imagens e do manifesto'
    )
    js_date = """function formatUTC(value){
 const dt = new Date(value.endsWith('Z') ? value : value + 'Z');
 if (Number.isNaN(dt.getTime())) return value;
 return new Intl.DateTimeFormat('pt-BR', {
   day:'2-digit',month:'2-digit',year:'numeric',
   hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'UTC'
 }).format(dt).replace(',', ' às ') + ' UTC';
}
"""
    page2 = replace_once(
        page2,
        "let items=[];\nfunction render(){",
        "let items=[];\n" + js_date + "function render(){",
        'função de formatação UTC'
    )
    page2 = replace_once(
        page2,
        "valid.textContent='Horário indicado nos produtos: '+item.datetime;",
        "valid.textContent='Horário indicado nos produtos: '+formatUTC(item.datetime);",
        'horário de composição legível'
    )
    page2 = replace_once(
        page2,
        "sm.textContent=p.model+' · '+p.datetime;",
        "sm.textContent=p.model+' · '+formatUTC(p.datetime);",
        'horário dos painéis'
    )
    page2 = replace_once(
        page2,
        '<p><a href="../">← Voltar</a></p>',
        '<p><a href="index.html">← Cartas NWP individuais</a></p>',
        'link de retorno'
    )
    # Validação simples para garantir que os destinos existem e os caminhos estão corretos.
    assert (SITE / 'nwp/index.html').is_file(), 'nwp/index.html não encontrado'
    assert (SITE / 'assets/data/nwp/mosaics.json').is_file(), 'mosaics.json não encontrado'
    if nav2 == nav and page2 == page:
        print('Nenhuma alteração necessária.'); return
    stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    for path, original, updated in ((NAV, nav, nav2),(PAGE, page, page2)):
        if original == updated: continue
        backup = path.with_name(path.name + f'.bak-{stamp}-mosaics-menu')
        if backup.exists(): raise FileExistsError(backup)
        shutil.copy2(path, backup)
        print(f'Backup: {backup}')
        tmp = path.with_name(path.name + f'.tmp-{stamp}')
        tmp.write_text(updated, encoding='utf-8')
        tmp.replace(path)
        print(f'Atualizado: {path}')
    print('Concluído. Nenhum deploy foi executado.')
    print('Confira a página em um servidor local e depois publique pelo procedimento habitual.')

if __name__ == '__main__':
    try: main()
    except Exception as error:
        print(f'ERRO: {error}',file=sys.stderr)
        raise SystemExit(1)
