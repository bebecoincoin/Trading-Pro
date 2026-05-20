# Installation, build et packaging

## Pre-requis

- **Node.js 18+** (20 LTS recommande).
- **npm 9+** (ou pnpm / yarn).
- Pour le build natif `better-sqlite3` :
  - **Linux** : `build-essential python3` (`sudo dnf groupinstall "Development Tools"` ou `apt install build-essential`).
  - **Windows** : `windows-build-tools` ou Visual Studio Build Tools.
  - **macOS** : Xcode CLI tools (`xcode-select --install`).
- Pour packager un `.exe` depuis Linux : **Wine** installe (`sudo dnf install wine` / `apt install wine`).

## Installation

```bash
git clone <repo> trading-pro-app
cd trading-pro-app
npm install
```

`postinstall` recompile automatiquement `better-sqlite3` pour Electron.

## Developpement

```bash
npm run dev
```

Cela lance :
- Vite sur `http://localhost:5173` (hot reload front).
- Compilation TypeScript du processus main (`electron/`) vers `dist-electron/`.
- Electron pointant sur Vite.

DevTools ouvert automatiquement.

## Build production

```bash
npm run build
```

Produit :
- `dist/` : bundle React optimise (Vite).
- `dist-electron/` : main + preload compiles.

Tu peux ensuite tester via :

```bash
npm run start
```

## Packaging

### AppImage (Linux)

```bash
npm run package:linux
```

Sortie : `release/Trading Pro-1.0.0.AppImage`

Pour l'executer :
```bash
chmod +x "release/Trading Pro-1.0.0.AppImage"
"./release/Trading Pro-1.0.0.AppImage"
```

### Windows (.exe)

Sur Linux, **Wine** est requis :

```bash
sudo dnf install wine     # Fedora
sudo apt install wine     # Debian/Ubuntu

npm run package:win
```

Sorties :
- `release/Trading Pro Setup 1.0.0.exe` (installateur NSIS)
- `release/Trading Pro 1.0.0.exe` (portable)

### Tout d'un coup

```bash
npm run package:all
```

Genere AppImage + Windows + macOS (selon disponibilite des outils).

## Configuration des icones

Place tes icones dans `build/` :
- `build/icon.png` (512x512 minimum) — utilise pour AppImage et Windows.
- `build/icon.icns` — macOS (optionnel).

Le projet inclut un PNG par defaut.

## Variables d'environnement embarquees

Pour preconfigurer des cles dans le build :

1. Cree un fichier `.env` a la racine.
2. Le processus main le charge automatiquement (`electron/services/env.ts`).
3. Note : un `.env` embarque dans une AppImage **est lisible** par l'utilisateur final. Pour des cles sensibles, fournir un fichier `.env` separe ou demander a l'utilisateur de configurer dans Reglages.

## Troubleshooting

### `better-sqlite3` ne se compile pas

```bash
npm rebuild better-sqlite3 --runtime=electron --target=33 --dist-url=https://electronjs.org/headers
```

### L'app blanche au lancement

Lance avec les devtools :
```bash
ELECTRON_ENABLE_LOGGING=1 npm run start
```

### Wine ne packagera pas le .exe

Verifie ta version : Wine 8+ recommande. Sinon :
```bash
# Alternative : packager dans une VM Windows ou via GitHub Actions.
```

### CoinGecko renvoie 429

CoinGecko gratuit limite a ~10-30 req/min. Solutions :
- Augmente le TTL du cache dans `electron/services/markets.ts`.
- Cree une cle demo gratuite sur coingecko.com → `.env` `COINGECKO_DEMO_KEY=...`.
