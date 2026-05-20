#!/usr/bin/env bash
# Script de build complet pour Trading Pro
# Usage: ./scripts/build-all.sh [linux|win|all]

set -euo pipefail

cd "$(dirname "$0")/.."
TARGET="${1:-linux}"

echo "==> Trading Pro · Build script"
echo "==> Target: ${TARGET}"

if [ ! -d "node_modules" ]; then
  echo "==> Installation des dependances…"
  npm install
else
  echo "==> Dependances deja installees, on continue."
fi

echo "==> Compilation du processus principal Electron…"
npx tsc -p electron/tsconfig.json

echo "==> Build du frontend (Vite)…"
npx vite build

echo "==> Packaging Electron…"
case "$TARGET" in
  linux)
    npx electron-builder --linux AppImage
    ;;
  win)
    npx electron-builder --win nsis
    ;;
  all)
    npx electron-builder -mwl
    ;;
  *)
    echo "Cible inconnue: $TARGET (linux | win | all)"
    exit 1
    ;;
esac

echo ""
echo "==> Termine. Sorties dans ./release/"
ls -lh release/ 2>/dev/null || true
