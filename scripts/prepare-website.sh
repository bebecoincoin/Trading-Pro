#!/usr/bin/env bash
# Copie AppImage + ZIP Windows dans website/downloads/ pour le site vitrine
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p website/downloads
cp -f "delivery/binaries/Trading Pro-1.0.0.AppImage" "website/downloads/Trading-Pro-1.0.0.AppImage"
chmod +x "website/downloads/Trading-Pro-1.0.0.AppImage"
if [ ! -f "website/downloads/Trading-Pro-Windows-1.0.0.zip" ]; then
  echo "Creation du ZIP Windows (peut prendre 1 min)..."
  cd delivery/binaries
  zip -r -q "../../website/downloads/Trading-Pro-Windows-1.0.0.zip" "Trading Pro - Windows"
fi
echo "OK — website/downloads pret:"
ls -lh website/downloads/
