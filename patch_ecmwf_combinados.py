#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
PATCH NWP - ECMWF
Adiciona o produto combinado:
Satélite IR 10.8 µm + Pressão ao nível médio do mar

Não altera o JavaScript.
Preserva os produtos existentes.
"""

import json
import shutil
import sys
from pathlib import Path


# ============================================================
# CONFIGURAÇÕES
# ============================================================

ROOT = Path(
    sys.argv[1] if len(sys.argv) > 1
    else "mzwxclimate-site"
)

MANIFEST = ROOT / "assets/data/nwp/nwp.json"

IMAGE_RELATIVE_PATH = (
    "assets/images/nwp/ecmwf/"
    "ecmwf_ir108_msl_2026-10-25_12:00.png"
)

IMAGE = ROOT / IMAGE_RELATIVE_PATH

PRODUCT_ID = "ecmwf_ir108_msl_20261025_1200"

PRODUCT_NAME = (
    "Satélite IR 10.8 µm + "
    "Pressão ao nível médio do mar"
)

PRODUCT_DESCRIPTION = (
    "Imagem combinada de satélite no canal infravermelho "
    "de 10,8 µm com o campo de pressão atmosférica "
    "reduzida ao nível médio do mar do modelo ECMWF."
)

PRODUCT_DATETIME = "2026-10-25T12:00:00"


# ============================================================
# VERIFICAÇÕES
# ============================================================

if not ROOT.is_dir():
    raise SystemExit(
        f"ERRO: diretório do projeto não encontrado: {ROOT}"
    )

if not MANIFEST.is_file():
    raise SystemExit(
        f"ERRO: manifesto não encontrado: {MANIFEST}"
    )

if not IMAGE.is_file():
    raise SystemExit(
        f"ERRO: imagem não encontrada: {IMAGE}"
    )


# ============================================================
# CARREGAR JSON
# ============================================================

with MANIFEST.open("r", encoding="utf-8") as f:
    data = json.load(f)

models = data.get("models")

if not isinstance(models, dict):
    raise SystemExit(
        "ERRO: estrutura inválida. "
        "O JSON precisa conter um objeto 'models'."
    )


# ============================================================
# LOCALIZAR ECMWF
# ============================================================

ecmwf_key = None

for key, model in models.items():

    if not isinstance(model, dict):
        continue

    model_name = str(model.get("name", ""))

    if (
        "ecmwf" in key.lower()
        or "ecmwf" in model_name.lower()
    ):
        ecmwf_key = key
        break


if ecmwf_key is None:
    raise SystemExit(
        "ERRO: modelo ECMWF não encontrado no manifesto. "
        "Nenhuma alteração realizada."
    )


ecmwf = models[ecmwf_key]

products = ecmwf.get("products")

if not isinstance(products, list):
    raise SystemExit(
        "ERRO: a propriedade 'products' do ECMWF "
        "não é uma lista."
    )


# ============================================================
# NOVO PRODUTO
# ============================================================

new_product = {
    "id": PRODUCT_ID,
    "name": PRODUCT_NAME,
    "description": PRODUCT_DESCRIPTION,
    "datetime": PRODUCT_DATETIME,
    "path": IMAGE_RELATIVE_PATH
}


# ============================================================
# EVITAR DUPLICAÇÕES
# ============================================================

existing_index = None

for i, product in enumerate(products):

    if not isinstance(product, dict):
        continue

    if (
        product.get("path") == IMAGE_RELATIVE_PATH
        or product.get("id") == PRODUCT_ID
    ):
        existing_index = i
        break


if existing_index is not None:

    products[existing_index].update(new_product)

    print("Produto existente atualizado.")

else:

    products.append(new_product)

    print("Novo produto inserido com sucesso.")


# ============================================================
# BACKUP E GRAVAÇÃO SEGURA
# ============================================================

backup = MANIFEST.with_name(
    MANIFEST.name + ".bak"
)

shutil.copy2(MANIFEST, backup)

temporary = MANIFEST.with_name(
    MANIFEST.name + ".tmp"
)

try:
    with temporary.open("w", encoding="utf-8") as f:
        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=2
        )
        f.write("\n")

    # Preservar as permissões originais do manifesto.
    shutil.copymode(MANIFEST, temporary)

    temporary.replace(MANIFEST)

finally:
    if temporary.exists():
        temporary.unlink()


# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 60)
print("PATCH ECMWF CONCLUÍDO")
print("=" * 60)

print(f"Modelo: {ecmwf_key}")
print("Variável: Combinados")
print("Nível: Nível médio do mar")
print(f"Produto: {PRODUCT_NAME}")
print(f"Imagem: {IMAGE_RELATIVE_PATH}")
print(f"Data: {PRODUCT_DATETIME}")

print()
print(f"Manifesto atualizado: {MANIFEST}")
print(f"Backup: {backup}")
print(f"Total de produtos ECMWF: {len(products)}")

print()
print("Não foi necessário modificar o nwp.js.")
