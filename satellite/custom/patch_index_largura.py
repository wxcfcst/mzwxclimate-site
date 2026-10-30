#!/usr/bin/env python3
"""Aplica/remover ajuste de largura visual no index.html dos produtos de satélite.

Uso:
  python3 patch_index_largura.py
  python3 patch_index_largura.py --fator 1.45
  python3 patch_index_largura.py --arquivo /caminho/para/index.html --fator 1.35
  python3 patch_index_largura.py --remover

Observação: scaleX expande somente horizontalmente (pode distorcer a imagem).
"""
from pathlib import Path
import argparse
import re
import shutil
import sys

DEFAULT = Path('mzwxclimate-site/satellite/custom/index.html')
BEGIN = '/* INICIO PATCH: LARGURA VISUAL DOS SATELITES */'
END = '/* FIM PATCH: LARGURA VISUAL DOS SATELITES */'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--arquivo', type=Path, default=DEFAULT)
    parser.add_argument('--fator', type=float, default=1.45,
                        help='Multiplicador horizontal no desktop (padrão: 1.45)')
    parser.add_argument('--remover', action='store_true', help='Remove o ajuste')
    args = parser.parse_args()
    if not args.remover and not (1.0 <= args.fator <= 2.0):
        parser.error('Use um fator de 1.0 a 2.0')
    path = args.arquivo
    if not path.is_file():
        sys.exit(f'Arquivo não encontrado: {path}\nExecute na pasta que contém mzwxclimate-site ou informe --arquivo.')
    original = path.read_text(encoding='utf-8')
    # Retira versão anterior para permitir reaplicar sem duplicação.
    pattern = r'\n?\s*' + re.escape(BEGIN) + r'.*?' + re.escape(END) + r'\s*\n?'
    updated = re.sub(pattern, '\n', original, flags=re.DOTALL)
    if not args.remover:
        if '</style>' not in updated:
            sys.exit('Tag </style> não encontrada. Nenhuma alteração realizada.')
        block = f'''\n{BEGIN}
/* Apenas imagem: não modifica coordenadas, PNG nem figsize.
   Atenção: expansão horizontal pode distorcer as proporções geográficas. */
@media (min-width: 901px) {{
    #product-view .satellite-map {{
        overflow: visible;
    }}
    #product-view .satellite-map img:not([src*="toabt_ir108_"]) {{
        transform: scaleX({args.fator:g});
        transform-origin: center center;
    }}
}}
@media (max-width: 900px) {{
    #product-view .satellite-map img {{
        transform: none;
    }}
}}
{END}
'''
        updated = updated.replace('</style>', block + '\n</style>', 1)
    if updated == original:
        print('Sem alterações necessárias.')
        return
    backup = path.with_suffix(path.suffix + '.bak')
    shutil.copy2(path, backup)
    path.write_text(updated, encoding='utf-8')
    print(f"{'Removido' if args.remover else 'Aplicado'}: {path}")
    print(f'Backup: {backup}')
    if not args.remover:
        print(f'Fator horizontal: {args.fator:g}x (desktop); altura visual preservada.')
        print('Atualize a página com Ctrl+Shift+R para evitar cache.')


if __name__ == '__main__':
    main()
