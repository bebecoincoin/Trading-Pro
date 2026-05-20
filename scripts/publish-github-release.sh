#!/usr/bin/env bash
# ============================================================
# Trading Pro — Publier une release GitHub (AppImage + ZIP Windows)
# Depot : https://github.com/bebecoincoin/Trading-Pro
# ============================================================
set -euo pipefail

REPO="bebecoincoin/Trading-Pro"
TAG="${1:-v1.0.0}"
VERSION="${TAG#v}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

APPIMAGE="${APPIMAGE:-$ROOT/website/downloads/Trading-Pro-${VERSION}.AppImage}"
WIN_ZIP="${WIN_ZIP:-$ROOT/website/downloads/Trading-Pro-Windows-${VERSION}.zip}"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Erreur : exporte GITHUB_TOKEN (Personal Access Token avec scope repo)."
  echo "  https://github.com/settings/tokens"
  exit 1
fi

for f in "$APPIMAGE" "$WIN_ZIP"; do
  if [ ! -f "$f" ]; then
    echo "Fichier manquant : $f"
    echo "Lance d'abord : ./scripts/prepare-website.sh"
    exit 1
  fi
done

api() {
  curl -fsSL -X "$1" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${@:2}"
}

echo "==> Creation de la release ${TAG} sur ${REPO} (si absente)"
api POST "https://api.github.com/repos/${REPO}/releases" \
  -d "{\"tag_name\":\"${TAG}\",\"name\":\"Trading Pro ${VERSION}\",\"body\":\"Release ${VERSION} — AppImage Linux + ZIP Windows portable.\",\"draft\":false,\"prerelease\":false}" \
  2>/dev/null || true

RELEASE_JSON="$(api GET "https://api.github.com/repos/${REPO}/releases/tags/${TAG}")"
RELEASE_ID="$(echo "$RELEASE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")"
UPLOAD_URL="$(echo "$RELEASE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['upload_url'].split('{')[0])")"

upload_asset() {
  local file="$1"
  local name="$2"
  echo "==> Upload ${name} ($(du -h "$file" | cut -f1))"
  curl -fsSL -X POST \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @"${file}" \
    "${UPLOAD_URL}?name=${name}"
  echo ""
}

# Supprimer les anciens assets du meme nom (re-upload propre)
for asset_name in "Trading-Pro-${VERSION}.AppImage" "Trading-Pro-Windows-${VERSION}.zip"; do
  ASSET_ID="$(echo "$RELEASE_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for a in data.get('assets', []):
    if a['name'] == '${asset_name}':
        print(a['id'])
        break
" 2>/dev/null || true)"
  if [ -n "${ASSET_ID:-}" ]; then
    echo "==> Suppression ancien asset ${asset_name}"
    api DELETE "https://api.github.com/repos/${REPO}/releases/assets/${ASSET_ID}" >/dev/null || true
  fi
done

upload_asset "$APPIMAGE" "Trading-Pro-${VERSION}.AppImage"
upload_asset "$WIN_ZIP" "Trading-Pro-Windows-${VERSION}.zip"

echo ""
echo "============================================================"
echo "  Release publiee : https://github.com/${REPO}/releases/tag/${TAG}"
echo "  AppImage : https://github.com/${REPO}/releases/download/${TAG}/Trading-Pro-${VERSION}.AppImage"
echo "  Windows  : https://github.com/${REPO}/releases/download/${TAG}/Trading-Pro-Windows-${VERSION}.zip"
echo "============================================================"
