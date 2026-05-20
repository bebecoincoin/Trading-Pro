<div align="center">

<img src="src/assets/logo.png" width="120" alt="Trading Pro" />

# Trading Pro

**Plateforme desktop de trading educatif, simulation et communaute**

Cross-platform — Linux · Windows · macOS (build manuel)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![GitHub release](https://img.shields.io/github/v/release/bebecoincoin/Trading-Pro)](https://github.com/bebecoincoin/Trading-Pro/releases)

**Depot officiel :** [github.com/bebecoincoin/Trading-Pro](https://github.com/bebecoincoin/Trading-Pro)

[Telecharger](#-telechargement) · [Site vitrine](website/) · [Installation Linux](#-installation-linux) · [Documentation](docs/) · [Images & captures](#-ou-placer-les-images)

</div>

---

## Table des matieres

1. [Presentation](#-presentation)
2. [Telechargement](#-telechargement)
3. [Installation Linux](#-installation-linux)
4. [Installation Windows](#-installation-windows)
5. [Demarrage developpeur](#-demarrage-developpeur)
6. [Structure du projet](#-structure-du-projet)
7. [Ou placer les images](#-ou-placer-les-images)
8. [Site vitrine (`website/`)](#-site-vitrine-website)
9. [Publier une release GitHub](#-publier-une-release-github)
10. [Configuration (`.env`)](#-configuration-env)
11. [Supabase (forum + DMs)](#-supabase-forum--dms)
12. [Build & packaging](#-build--packaging)
13. [Stack technique](#-stack-technique)
14. [Documentation detaillee](#-documentation-detaillee)
15. [Contribuer](#-contribuer)
16. [Disclaimer & licence](#-disclaimer--licence)

---

## Presentation

**Trading Pro** est une application **Electron** (bureau) qui combine :

- des **marches en temps reel** (crypto, actions US, indicateurs) ;
- un **simulateur de trading** avec solde virtuel tres eleve (jusqu'a ~999 milliards $) et reset configurable ;
- des **cours** pedagogiques integres ;
- un **forum** et des **messages prives** (via Supabase, optionnel) ;
- **5 themes** visuels et interface **FR / EN**.

L'application est **open source (MIT)**, sans publicite. Les donnees sensibles (comptes locaux, portefeuille simule) restent sur ta machine (**SQLite**). Le cloud ne sert qu'au social (forum/DMs) si tu configures Supabase.

**Createur :** Athena — page dediee dans l'app (gif `athena.gif`).

---

## Telechargement

Les binaires pre-compiles sont sur **GitHub Releases** :

| Plateforme | Fichier | Lien direct (v1.0.0) |
|------------|---------|----------------------|
| **Linux** | `Trading-Pro-1.0.0.AppImage` | [Telecharger](https://github.com/bebecoincoin/Trading-Pro/releases/download/v1.0.0/Trading-Pro-1.0.0.AppImage) |
| **Windows** | `Trading-Pro-Windows-1.0.0.zip` (contient `Trading Pro.exe`) | [Telecharger](https://github.com/bebecoincoin/Trading-Pro/releases/download/v1.0.0/Trading-Pro-Windows-1.0.0.zip) |
| **Code source** | Archive ZIP du tag | [Source v1.0.0](https://github.com/bebecoincoin/Trading-Pro/archive/refs/tags/v1.0.0.zip) |

Page releases : **https://github.com/bebecoincoin/Trading-Pro/releases**

> Si les liens renvoient **404**, la release n'est pas encore publiee : voir [Publier une release GitHub](#-publier-une-release-github).

---

## Installation Linux

### Methode 1 — AppImage direct (rapide)

```bash
wget -O Trading-Pro-1.0.0.AppImage \
  https://github.com/bebecoincoin/Trading-Pro/releases/download/v1.0.0/Trading-Pro-1.0.0.AppImage
chmod +x Trading-Pro-1.0.0.AppImage
./Trading-Pro-1.0.0.AppImage
```

Tu peux lancer l'AppImage depuis n'importe quel dossier (Downloads, Bureau, etc.).

### Methode 2 — Menu Activites (recommande, sans garder l'AppImage dans Downloads)

Installe l'icone dans GNOME/KDE, copie l'AppImage dans `~/.local/bin`, cree un fichier `.desktop` :

```bash
wget -O Trading-Pro-1.0.0.AppImage \
  https://github.com/bebecoincoin/Trading-Pro/releases/download/v1.0.0/Trading-Pro-1.0.0.AppImage
chmod +x Trading-Pro-1.0.0.AppImage

# Script d'installation (depuis le depot clone ou via curl)
git clone https://github.com/bebecoincoin/Trading-Pro.git
cd Trading-Pro
./scripts/install-linux.sh ./Trading-Pro-1.0.0.AppImage
```

**Sans cloner le depot** (une seule commande curl) :

```bash
curl -fsSL https://raw.githubusercontent.com/bebecoincoin/Trading-Pro/main/scripts/install-linux.sh \
  -o install-trading-pro.sh
chmod +x install-trading-pro.sh
./install-trading-pro.sh ./Trading-Pro-1.0.0.AppImage
```

Apres installation : cherche **« Trading Pro »** dans le menu Activites (touche Super).

**Desinstallation :**

```bash
rm -f ~/.local/bin/trading-pro.AppImage
rm -f ~/.local/share/applications/trading-pro.desktop
rm -f ~/.local/share/icons/hicolor/*/apps/trading-pro.png
```

### Methode 3 — Depuis le code source

Voir [Demarrage developpeur](#-demarrage-developpeur).

---

## Installation Windows

1. Telecharge `Trading-Pro-Windows-1.0.0.zip` depuis [Releases](https://github.com/bebecoincoin/Trading-Pro/releases).
2. Clic droit → **Extraire tout**.
3. Ouvre le dossier extrait → double-clic sur **`Trading Pro.exe`**.

**SmartScreen** peut afficher un avertissement (build non signe) : **Informations supplementaires** → **Executer quand meme**.

Le ZIP est un build **portable** : pas d'installateur MSI. Tu peux deplacer le dossier ou tu veux.

---

## Demarrage developpeur

### Prerequis

- **Node.js 20+** et **npm**
- Linux : paquets pour `better-sqlite3` (`python3`, `make`, `gcc`) si compilation native necessaire
- Pour packager Windows depuis Linux : **Wine** (voir `docs/BUILD.md`)

### Installation

```bash
git clone https://github.com/bebecoincoin/Trading-Pro.git
cd Trading-Pro
npm install
cp .env.example .env   # optionnel : SMTP, Google OAuth, Supabase, cles API
npm run dev
```

L'app demarre avec **Vite** (renderer) + **Electron** (main process), hot reload inclus.

### Scripts npm utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Mode developpement |
| `npm run build` | Compile renderer + process principal |
| `npm run preview` | Preview du build |
| `npx electron-builder --linux AppImage` | AppImage Linux dans `release/` |

Script tout-en-un : `./scripts/build-all.sh linux` (ou `win`, `all`).

---

## Structure du projet

```
Trading-Pro/
├── electron/              # Process principal Electron (main)
├── src/                   # Application React (renderer)
│   ├── assets/            # logo.png, athena.gif — assets IN-APP
│   ├── components/
│   ├── pages/
│   ├── stores/
│   ├── i18n/              # Traductions FR / EN
│   └── ...
├── supabase/
│   └── schema.sql         # Tables forum, profils, messages
├── docs/                  # Documentation technique
├── website/               # Site vitrine statique (telechargements)
│   ├── index.html
│   ├── style.css
│   ├── config.js          # URLs GitHub Releases
│   ├── assets/            # Captures + logo pour le SITE
│   └── downloads/         # Binaires locaux (gitignore, ~240 Mo)
├── scripts/
│   ├── install-linux.sh
│   ├── prepare-website.sh
│   ├── publish-github-release.sh
│   ├── serve-website.sh
│   └── build-all.sh
├── .github/workflows/     # CI, release auto, GitHub Pages
├── .env.example
├── package.json
└── README.md              # Ce fichier
```

Dossiers **ignores par Git** (voir `.gitignore`) : `node_modules/`, `dist/`, `release/`, `delivery/`, `*.AppImage`, `*.zip`, `.env`.

---

## Ou placer les images

### 1. Logo et media dans l'application

| Fichier | Chemin | Usage |
|---------|--------|--------|
| Logo sidebar / fenetre | `src/assets/logo.png` | Icone app Electron + UI |
| Avatar createur (gif) | `src/assets/athena.gif` | Page « Createur » dans l'app |

Apres remplacement : relance `npm run dev` ou rebuild (`npm run build`).

### 2. Captures pour le site vitrine

Place les PNG dans **`website/assets/`** :

| Fichier recommande | Contenu |
|--------------------|---------|
| `screenshot-dashboard.png` | Tableau de bord / marches |
| `screenshot-simulator.png` | Simulateur |
| `screenshot-forum.png` | Forum ou communaute |
| `screenshot-courses.png` | Page cours |
| `logo.png` | Copie du logo (favicon + header site) |
| `athena.gif` | Optionnel — section createur du site |

Reference dans `website/index.html` :

```html
<img src="assets/screenshot-dashboard.png" alt="Dashboard Trading Pro" />
```

**Conseils :** resolution 1920×1080 ou 1600×900, PNG, fond coherent avec le theme sombre du site.

### 3. Icone Electron (build)

Configuree dans `package.json` / `electron-builder` (souvent `build/icon.png` ou chemin defini dans la config builder). Si tu changes le logo app, regenere aussi l'icone du builder pour l'AppImage et le menu Linux.

### 4. README GitHub

Le README affiche `src/assets/logo.png` en haut. Pour une banniere large, tu peux ajouter `docs/banner.png` et l'inclure en markdown :

```markdown
![Banniere](docs/banner.png)
```

### 5. Releases GitHub

Les **releases** n'hebergent **pas** les screenshots : uniquement les binaires :

- `Trading-Pro-x.y.z.AppImage`
- `Trading-Pro-Windows-x.y.z.zip`

Les images marketing restent dans le repo (`website/assets/`) ou sur GitHub Pages.

---

## Site vitrine (`website/`)

Site statique (HTML/CSS/JS) : presentation, galerie, **telechargements directs** vers GitHub Releases, commandes d'installation.

### Fichiers importants

- **`website/config.js`** — URLs des assets release (a mettre a jour a chaque version) :

```javascript
window.TP_RELEASE = {
  version: 'v1.0.0',
  repo: 'https://github.com/bebecoincoin/Trading-Pro',
  assets: {
    appimage: 'https://github.com/.../Trading-Pro-1.0.0.AppImage',
    windowsZip: 'https://github.com/.../Trading-Pro-Windows-1.0.0.zip',
  },
};
```

- **`website/index.html`** — boutons avec `id="dl-appimage"`, `id="dl-windows"` ; le script en bas injecte les URLs + blocs `wget` / `install-linux.sh`.
- **Icones** — sprites SVG inline (pas d'emojis) : chart, linux, windows, github, etc.

### Tester en local

```bash
./scripts/prepare-website.sh   # copie AppImage + ZIP dans website/downloads/
./scripts/serve-website.sh     # http://localhost:8080
```

Les boutons utilisent les URLs GitHub ; `website/downloads/` sert de secours si tu modifies `config.js` pour pointer en local.

### GitHub Pages

Workflow : `.github/workflows/pages.yml` — deploie le dossier `website/` (sans les gros fichiers dans `downloads/`, voir `website/.gitignore`).

Active **Pages** dans les parametres du repo : Source = **GitHub Actions**.

---

## Publier une release GitHub

### Option A — Script local (recommande pour v1.0.0)

```bash
export GITHUB_TOKEN="ghp_..."   # scope repo
./scripts/prepare-website.sh
./scripts/publish-github-release.sh v1.0.0
```

Le script :

1. cree la release `v1.0.0` si elle n'existe pas ;
2. upload `Trading-Pro-1.0.0.AppImage` (~118 Mo) ;
3. upload `Trading-Pro-Windows-1.0.0.zip` (~125 Mo).

Binaires attendus dans `website/downloads/` (generes par `prepare-website.sh` depuis `delivery/binaries/` ou `release/`).

### Option B — Interface GitHub

1. Va sur **Releases** → **Draft a new release**
2. Tag : `v1.0.0`, titre : `Trading Pro 1.0.0`
3. Glisse les deux fichiers ci-dessus
4. **Publish release**

### Option C — CI automatique

Push un tag `v*` declenche `.github/workflows/release.yml` (build sur Ubuntu, Windows, macOS). Les noms de fichiers peuvent differer selon `electron-builder` — verifie les artifacts avant de promouvoir une release.

### Premier push du code source

```bash
cd Trading-Pro
git init
git add .
git commit -m "feat: Trading Pro v1.0.0 — app, site, docs"
git branch -M main
git remote add origin https://github.com/bebecoincoin/Trading-Pro.git
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
```

Puis publie les binaires (option A ou B).

---

## Configuration (`.env`)

Copie `.env.example` vers `.env` a la racine, ou configure :

`~/.config/trading-pro-app/.env` (Linux, apres installation packagée)

| Variable | Role |
|----------|------|
| `JWT_SECRET` | Sessions locales (genere auto si absent) |
| `SMTP_*` | Verification email |
| `GOOGLE_CLIENT_ID` / `SECRET` | Connexion Google |
| `COINGECKO_DEMO_KEY`, etc. | APIs marche (optionnel) |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Forum + DMs |

Sans cles, l'app fonctionne en **mode degrade** (pas de forum cloud, certaines APIs limitees).

Details : [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)

---

## Supabase (forum + DMs)

1. Projet sur [supabase.com](https://supabase.com)
2. **SQL Editor** → execute [`supabase/schema.sql`](supabase/schema.sql)
3. **Settings → API** : copie `URL` + `anon` key dans `.env`
4. Relance l'app

Au premier message forum, l'app cree ton profil (`ensureMyProfile`) pour respecter les cles etrangeres.

Guide complet : [`docs/SUPABASE.md`](docs/SUPABASE.md)

---

## Build & packaging

```bash
npm run build
npx electron-builder --linux AppImage    # → release/*.AppImage
npx electron-builder --win portable        # → release/ (ZIP ou dossier)
```

Renomme pour les releases (convention du site) :

- `Trading-Pro-1.0.0.AppImage`
- Zip le dossier Windows portable → `Trading-Pro-Windows-1.0.0.zip`

Voir [`docs/BUILD.md`](docs/BUILD.md).

---

## Stack technique

**Frontend :** React 18, TypeScript, Vite, Tailwind, Zustand, React Router (HashRouter), i18next, lightweight-charts, Recharts, Lucide Icons.

**Desktop :** Electron 33, better-sqlite3, bcryptjs, JWT, Nodemailer.

**Cloud (optionnel) :** Supabase (PostgreSQL, Realtime, RLS).

---

## Documentation detaillee

| Document | Sujet |
|----------|--------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Main/renderer, IPC |
| [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) | Guide utilisateur |
| [`docs/BUILD.md`](docs/BUILD.md) | Builds multi-OS |
| [`docs/API.md`](docs/API.md) | Sources de donnees |
| [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) | Variables d'environnement |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Securite & privacy |
| [`docs/SUPABASE.md`](docs/SUPABASE.md) | Backend social |
| [`website/README.md`](website/README.md) | Site vitrine |

---

## Contribuer

1. Fork [bebecoincoin/Trading-Pro](https://github.com/bebecoincoin/Trading-Pro)
2. Branche : `git checkout -b feat/ma-feature`
3. `npm run dev`, tests manuels
4. Pull Request avec description claire

Idees : nouvelles langues, indicateurs (MACD, Ichimoku), actions EU, tests Playwright.

---

## Disclaimer & licence

**Trading Pro est educatif.** Rien ne constitue un conseil en investissement. Le trading reel comporte un risque de perte. Le simulateur utilise un capital **virtuel**.

Licence **[MIT](LICENSE)** © 2026 **Athena**

---

<div align="center">

**Trading Pro** — [Releases](https://github.com/bebecoincoin/Trading-Pro/releases) · [Issues](https://github.com/bebecoincoin/Trading-Pro/issues) · [Site](website/)

Developpe par **Athena**

</div>
