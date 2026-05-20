<div align="center">

<img src="src/assets/logo.png" width="100" alt="Trading Pro" />

# Trading Pro

Application desktop de trading educatif — simulation, marches, forum, cours.

[![License: MIT](LICENSE)](LICENSE)
[![Release](https://img.shields.io/github/v/release/bebecoincoin/Trading-Pro)](https://github.com/bebecoincoin/Trading-Pro/releases)
[![Site web](https://img.shields.io/badge/Site-trading--pro.pages.dev-orange)](https://trading-pro-e3u.pages.dev/)

**Site officiel :** [https://trading-pro-e3u.pages.dev/](https://trading-pro-e3u.pages.dev/)

[Site web](https://trading-pro-e3u.pages.dev/) · [Telecharger](#telechargement) · [Installation](#installation) · [Code source](#code-source)

</div>

---

## Telechargement

Page de telechargement : **[trading-pro-e3u.pages.dev](https://trading-pro-e3u.pages.dev/)**

Binaires sur **[GitHub Releases](https://github.com/bebecoincoin/Trading-Pro/releases)** (v1.0.0) :

| Plateforme | Fichier |
|------------|---------|
| **Linux** | [Trading-Pro-1.0.0.AppImage](https://github.com/bebecoincoin/Trading-Pro/releases/download/v1.0.0/Trading-Pro-1.0.0.AppImage) |
| **Windows** | [Trading-Pro-Windows-1.0.0.zip](https://github.com/bebecoincoin/Trading-Pro/releases/download/v1.0.0/Trading-Pro-Windows-1.0.0.zip) → lancer `Trading Pro.exe` |
| **Source** | [Code ZIP](https://github.com/bebecoincoin/Trading-Pro/archive/refs/tags/v1.0.0.zip) ou `git clone` |

---

## Installation

### Linux — AppImage

```bash
wget -O Trading-Pro-1.0.0.AppImage \
  https://github.com/bebecoincoin/Trading-Pro/releases/download/v1.0.0/Trading-Pro-1.0.0.AppImage
chmod +x Trading-Pro-1.0.0.AppImage
./Trading-Pro-1.0.0.AppImage
```

**Menu Activites** (icone dans le lanceur) :

```bash
git clone https://github.com/bebecoincoin/Trading-Pro.git
cd Trading-Pro
# apres avoir telecharge l'AppImage dans ce dossier :
./scripts/install-linux.sh ./Trading-Pro-1.0.0.AppImage
```

### Windows

1. Telecharger le ZIP depuis [Releases](https://github.com/bebecoincoin/Trading-Pro/releases)
2. Extraire → double-clic sur **Trading Pro.exe**
3. Si SmartScreen bloque : *Informations supplementaires* → *Executer quand meme*

---

## Code source

```bash
git clone https://github.com/bebecoincoin/Trading-Pro.git
cd Trading-Pro
npm install
cp .env.example .env   # optionnel
npm run dev
```

### Build des binaires

```bash
npm run build
npx electron-builder --linux AppImage
npx electron-builder --win portable
```

Fichiers generes dans `release/`. Pour publier sur GitHub :

```bash
export GITHUB_TOKEN="ghp_..."
./scripts/publish-github-release.sh v1.0.0
```

---

## Fonctionnalites

- Marches temps reel (crypto, actions US)
- Simulateur paper trading (solde virtuel eleve, reset)
- Cours integres, regles, 5 themes, FR / EN
- Forum + messages (Supabase, optionnel)
- Auth locale + email / Google OAuth (`.env`)

---

## Configuration

Copier `.env.example` → `.env` ou `~/.config/trading-pro-app/.env` :

```ini
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SMTP_HOST=...
GOOGLE_CLIENT_ID=...
```

Forum : executer `supabase/schema.sql` dans ton projet Supabase.

---

## Structure

```
src/          # Interface React
electron/     # Process principal
scripts/      # install-linux.sh, build, publish release
build/        # Icones application
supabase/     # Schema SQL forum
```

Assets in-app : `src/assets/logo.png`, `src/assets/athena.gif`

---

## Licence

[MIT](LICENSE) — Athena, 2026

**Disclaimer :** application educative, pas un conseil financier.

---

<div align="center">

[Site](https://trading-pro-e3u.pages.dev/) · [Releases](https://github.com/bebecoincoin/Trading-Pro/releases) · [Code](https://github.com/bebecoincoin/Trading-Pro)

</div>
