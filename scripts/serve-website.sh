#!/usr/bin/env bash
# Lance le site vitrine en local (http://localhost:8080)
set -euo pipefail
cd "$(dirname "$0")/../website"
if [ ! -f "downloads/Trading-Pro-1.0.0.AppImage" ]; then
  echo "Binaires manquants — lance d'abord: ./scripts/prepare-website.sh"
  ../scripts/prepare-website.sh
fi
echo "Site disponible sur http://localhost:8080"
echo "Ctrl+C pour arreter"
python3 -m http.server 8080
