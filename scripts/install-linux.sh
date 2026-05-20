#!/usr/bin/env bash
# ============================================================
# Trading Pro - Installation Linux
# Integre l'AppImage dans le menu du systeme avec icone + nom
# ============================================================

set -euo pipefail

APP_NAME="Trading Pro"
APP_ID="trading-pro"
APPIMAGE_SRC="${1:-}"

# Recherche auto si pas d'argument
if [ -z "$APPIMAGE_SRC" ]; then
  for candidate in \
    "$(dirname "$0")/../delivery/binaries/Trading Pro-1.0.0.AppImage" \
    "$(dirname "$0")/../delivery/binaries/Trading-Pro-1.0.0.AppImage" \
    "$(dirname "$0")/../release/Trading Pro-1.0.0.AppImage" \
    "$(dirname "$0")/../release/Trading-Pro-1.0.0.AppImage" \
    "./Trading-Pro-1.0.0.AppImage" \
    "./Trading Pro-1.0.0.AppImage" \
    "$HOME/Downloads/Trading-Pro-1.0.0.AppImage" \
    "$HOME/Downloads/Trading Pro-1.0.0.AppImage"; do
    if [ -f "$candidate" ]; then
      APPIMAGE_SRC="$candidate"
      break
    fi
  done
fi

if [ -z "$APPIMAGE_SRC" ] || [ ! -f "$APPIMAGE_SRC" ]; then
  echo "Erreur : AppImage introuvable."
  echo "Usage : $0 /chemin/vers/Trading\\ Pro-1.0.0.AppImage"
  exit 1
fi

echo "==> Installation de '${APP_NAME}'"
echo "    Source AppImage : $APPIMAGE_SRC"

# Repertoires cibles (utilisateur, pas root)
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
ICON_BASE="$HOME/.local/share/icons/hicolor"

mkdir -p "$BIN_DIR" "$APP_DIR"

# 1. Copier l'AppImage et la rendre executable
DEST_APPIMAGE="$BIN_DIR/${APP_ID}.AppImage"
echo "==> Copie AppImage -> $DEST_APPIMAGE"
cp -f "$APPIMAGE_SRC" "$DEST_APPIMAGE"
chmod +x "$DEST_APPIMAGE"

# 2. Extraire l'icone depuis l'AppImage (electron-builder l'embarque)
TMP_EXTRACT=$(mktemp -d)
trap 'rm -rf "$TMP_EXTRACT"' EXIT
echo "==> Extraction de l'icone..."
(
  cd "$TMP_EXTRACT"
  "$DEST_APPIMAGE" --appimage-extract '*.png' >/dev/null 2>&1 || \
    "$DEST_APPIMAGE" --appimage-extract >/dev/null 2>&1
)

ICON_SRC=""
for size in 1024 512 256 128 96 64 48 32 16; do
  found=$(find "$TMP_EXTRACT" -type f -name "${size}x${size}.png" 2>/dev/null | head -1)
  if [ -z "$found" ]; then
    found=$(find "$TMP_EXTRACT" -type f -name "${APP_ID}.png" 2>/dev/null | head -1)
  fi
  if [ -n "$found" ]; then
    target_dir="$ICON_BASE/${size}x${size}/apps"
    mkdir -p "$target_dir"
    cp -f "$found" "$target_dir/${APP_ID}.png"
    if [ -z "$ICON_SRC" ]; then ICON_SRC="$target_dir/${APP_ID}.png"; fi
    echo "    -> icone ${size}x${size} installee"
  fi
done

# Fallback : si rien n'a ete extrait, prend le premier icon.png trouve
if [ -z "$ICON_SRC" ]; then
  ANY_ICON=$(find "$TMP_EXTRACT" -type f -name "icon.png" 2>/dev/null | head -1)
  if [ -n "$ANY_ICON" ]; then
    target_dir="$ICON_BASE/512x512/apps"
    mkdir -p "$target_dir"
    cp -f "$ANY_ICON" "$target_dir/${APP_ID}.png"
    ICON_SRC="$target_dir/${APP_ID}.png"
    echo "    -> icone fallback installee (512x512)"
  fi
fi

# 3. Creer le fichier .desktop
DESKTOP_FILE="$APP_DIR/${APP_ID}.desktop"
echo "==> Creation du .desktop -> $DESKTOP_FILE"
cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=${APP_NAME}
Comment=Markets, education, paper trading & social forum
Exec="${DEST_APPIMAGE}" %U
Icon=${APP_ID}
Terminal=false
Categories=Finance;Office;Network;
StartupWMClass=trading-pro-app
StartupNotify=true
Keywords=trading;crypto;stocks;markets;forex;paper-trading;
EOF
chmod 644 "$DESKTOP_FILE"

# 4. Rafraichir les caches
echo "==> Rafraichissement des caches..."
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APP_DIR" 2>/dev/null || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -f -t "$ICON_BASE" 2>/dev/null || true
fi

# 5. S'assurer que ~/.local/bin est dans le PATH (info)
if ! echo "$PATH" | tr ':' '\n' | grep -qx "$BIN_DIR"; then
  echo ""
  echo "Note : '$BIN_DIR' n'est pas dans ton PATH."
  echo "       Tu peux quand meme lancer l'app depuis le menu Activites."
fi

echo ""
echo "============================================================"
echo "  Installation terminee"
echo "============================================================"
echo "  - Cherche 'Trading Pro' dans le menu Activites (Super)"
echo "  - Ou lance depuis le terminal : ${DEST_APPIMAGE}"
echo "  - L'icone et le nom devraient apparaitre correctement."
echo ""
echo "  Pour desinstaller :"
echo "    rm '$DEST_APPIMAGE' '$DESKTOP_FILE'"
echo "    rm -f $ICON_BASE/*/apps/${APP_ID}.png"
echo "============================================================"
