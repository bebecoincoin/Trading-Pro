#!/usr/bin/env bash
# Publie AppImage + ZIP Windows sur GitHub Releases
# Usage: GITHUB_TOKEN=ghp_xxx ./scripts/publish-github-release.sh v1.0.0
set -euo pipefail

REPO="bebecoincoin/Trading-Pro"
TAG="${1:-v1.0.0}"
VERSION="${TAG#v}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Cherche les binaires (release/ ou delivery/binaries/)
for APPIMAGE in \
  "$ROOT/release/Trading-Pro-${VERSION}.AppImage" \
  "$ROOT/release/Trading Pro-${VERSION}.AppImage" \
  "$ROOT/delivery/binaries/Trading-Pro-${VERSION}.AppImage" \
  "$ROOT/delivery/binaries/Trading Pro-${VERSION}.AppImage"; do
  [ -f "$APPIMAGE" ] && break
done

WIN_ZIP="${WIN_ZIP:-$ROOT/release/Trading-Pro-Windows-${VERSION}.zip}"
[ -f "$WIN_ZIP" ] || WIN_ZIP="$ROOT/delivery/binaries/Trading-Pro-Windows-${VERSION}.zip"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Erreur : export GITHUB_TOKEN (scope repo)"
  exit 1
fi

if [ ! -f "${APPIMAGE:-}" ] || [ ! -f "$WIN_ZIP" ]; then
  echo "Binaires introuvables. Build d'abord :"
  echo "  npm run build && npx electron-builder --linux AppImage"
  echo "  npx electron-builder --win portable"
  exit 1
fi

api() {
  curl -fsSL -X "$1" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${@:2}"
}

echo "==> Release ${TAG} sur ${REPO}"
api POST "https://api.github.com/repos/${REPO}/releases" \
  -d "{\"tag_name\":\"${TAG}\",\"name\":\"Trading Pro ${VERSION}\",\"body\":\"AppImage Linux + ZIP Windows portable.\",\"draft\":false}" \
  2>/dev/null || true

RELEASE_JSON="$(api GET "https://api.github.com/repos/${REPO}/releases/tags/${TAG}")"
UPLOAD_URL="$(echo "$RELEASE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['upload_url'].split('{')[0])")"

upload() {
  local file="$1" name="$2"
  echo "==> Upload ${name}"
  curl -fsSL -X POST \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @"$file" \
    "${UPLOAD_URL}?name=${name}"
  echo ""
}

upload "$APPIMAGE" "Trading-Pro-${VERSION}.AppImage"
upload "$WIN_ZIP" "Trading-Pro-Windows-${VERSION}.zip"

echo "OK — https://github.com/${REPO}/releases/tag/${TAG}"
