#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Atualiza títulos dos mosaicos e adiciona o mosaico Satélite.

Execução, a partir da raiz do repositório:
    python3 patch_mosaicos_satelite.py .

Operação idempotente: se os dados já estiverem corretos, não grava ficheiros.
"""

import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
MANIFEST = ROOT / "assets/data/nwp/mosaics.json"
DATETIME = "2026-10-26T16:00:00"
BASE = "assets/images/satellite/custom"

RENAMES = {
    "synoptic": "Grande escala",
    "moisture": "Termodinâmica",
    "low_levels": "Dinâmica",
}

PANELS = [
    {"model": "MSG", "id": "wv_062", "name": "Vapor de água — níveis superiores (6,2 µm)",
     "path": f"{BASE}/cu_msg45_WV_062_2026-10-26_16:00.png", "datetime": DATETIME},
    {"model": "MSG", "id": "wv_073", "name": "Vapor de água — níveis médios (7,3 µm)",
     "path": f"{BASE}/cu_msg45_WV_073_2026-10-26_16:00.png", "datetime": DATETIME},
    {"model": "MSG", "id": "airmass", "name": "RGB Massas de Ar (Airmass)",
     "path": f"{BASE}/cu_msg45_airmass_2026-10-26_16:00.png", "datetime": DATETIME},
    {"model": "MSG", "id": "ir_108", "name": "Infravermelho térmico (10,8 µm)",
     "path": f"{BASE}/cu_msg45_IR_108_2026-10-26_16:00.png", "datetime": DATETIME},
]


def fail(message):
    raise SystemExit(f"ERRO: {message}\nNenhum ficheiro foi alterado.")


if not MANIFEST.is_file():
    fail(f"manifesto não encontrado: {MANIFEST}")
missing = [p["path"] for p in PANELS if not (ROOT / p["path"]).is_file()]
if missing:
    fail("imagens em falta:\n  " + "\n  ".join(missing))

try:
    original = MANIFEST.read_text(encoding="utf-8")
    data = json.loads(original)
except (OSError, UnicodeError, json.JSONDecodeError) as exc:
    fail(f"não foi possível ler o manifesto: {exc}")

if not isinstance(data, dict) or not isinstance(data.get("mosaics"), list):
    fail("estrutura inválida: campo 'mosaics' deve ser uma lista")
mosaics = data["mosaics"]
if any(not isinstance(m, dict) or not isinstance(m.get("id"), str) for m in mosaics):
    fail("há mosaicos sem objeto/id válido")
ids = [m["id"] for m in mosaics]
if len(ids) != len(set(ids)):
    fail("existem IDs duplicados no manifesto; corrija antes de continuar")
missing_sections = [m for m in RENAMES if m not in ids]
if missing_sections:
    fail("mosaicos esperados em falta: " + ", ".join(missing_sections))

changes = []
for mosaic in mosaics:
    if mosaic["id"] in RENAMES and mosaic.get("title") != RENAMES[mosaic["id"]]:
        changes.append(f"Título: {mosaic.get('title')} → {RENAMES[mosaic['id']]}")
        mosaic["title"] = RENAMES[mosaic["id"]]

satellite = {"id": "satellite_synoptic", "title": "Satélite", "datetime": DATETIME, "panels": PANELS}
if "satellite_synoptic" in ids:
    current = next(m for m in mosaics if m["id"] == "satellite_synoptic")
    if current != satellite:
        changes.append("Atualização do mosaico Satélite")
        current.clear()
        current.update(satellite)
else:
    mosaics.append(satellite)
    changes.append("Inclusão do mosaico Satélite (4 painéis)")

if not changes:
    print("Nenhuma alteração necessária: mosaicos já estão atualizados.")
    sys.exit(0)

updated = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
backup = MANIFEST.with_name(MANIFEST.name + ".bak")
# Nunca substituir um backup anterior: cria uma cópia apenas se ainda não existir.
if not backup.exists():
    shutil.copy2(MANIFEST, backup)

fd, temp_name = tempfile.mkstemp(prefix=".mosaics-", suffix=".tmp", dir=MANIFEST.parent)
try:
    with os.fdopen(fd, "w", encoding="utf-8") as fp:
        fp.write(updated)
        fp.flush()
        os.fsync(fp.fileno())
    shutil.copymode(MANIFEST, temp_name)
    os.replace(temp_name, MANIFEST)
finally:
    if os.path.exists(temp_name):
        os.unlink(temp_name)

print("PATCH APLICADO COM SUCESSO")
for change in changes:
    print(" -", change)
print("Total de mosaicos:", len(mosaics))
print("Manifesto:", MANIFEST)
print("Backup:", backup)
print("Nota: o gerador automático do mosaics.json, se houver, deve ser ajustado para manter estas alterações.")
