#!/usr/bin/env bash
set -euo pipefail

if [[ "${VERCEL:-}" == "1" ]]; then
  python3 -m pip install --upgrade pip wheel "setuptools<81"
  python3 -m pip install -r requirements.txt
  python3 -m pip install face_recognition --no-deps
  python3 - <<'PY'
import pathlib
import shutil
import sysconfig

site_packages = pathlib.Path(sysconfig.get_paths()["purelib"])
patterns = (
    "pip",
    "pip-*.dist-info",
    "wheel",
    "wheel-*.dist-info",
    "setuptools",
    "setuptools-*.dist-info",
    "_distutils_hack",
)

for pattern in patterns:
    for path in site_packages.glob(pattern):
        shutil.rmtree(path, ignore_errors=True)
PY
else
  python3 -m venv .venv
  .venv/bin/python -m pip install --upgrade pip wheel "setuptools<81"
  .venv/bin/python -m pip install -r requirements.txt
  .venv/bin/python -m pip install face_recognition --no-deps
fi
