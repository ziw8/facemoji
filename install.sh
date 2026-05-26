#!/usr/bin/env zsh
set -euo pipefail

python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip wheel "setuptools<81"
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m pip install face_recognition --no-deps
