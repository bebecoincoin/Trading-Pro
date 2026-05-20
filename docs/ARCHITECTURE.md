# Architecture

## Vue d'ensemble

Trading Pro est une application **Electron** decoupee en deux processus :

```
┌────────────────────────────────────────────────────────────┐
│                       Electron Main                        │
│                                                            │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  services  │  │   SQLite   │  │  HTTP fetch (APIs)   │  │
│  │ auth.ts    │  │ better-sql │  │ Axios               │  │
│  │ markets.ts │  └────────────┘  └──────────────────────┘  │
│  │ portfolio  │                                            │
│  └─────┬──────┘                                            │
│        │ IPC handlers                                      │
│        ▼                                                   │
└────────│────────────────────────────────────────────────────┘
         │ contextBridge (preload.ts)
         ▼
┌────────────────────────────────────────────────────────────┐
│                    Electron Renderer                       │
│                                                            │
│   React + TypeScript + Tailwind + Vite                     │
│   - pages : Dashboard, Markets, Portfolio, ...             │
│   - components : Sidebar, TopBar, PriceChart, ...          │
│   - lib : store (Zustand), format, courses, brokers, ...   │
└────────────────────────────────────────────────────────────┘
```

## Processus Main (`electron/`)

| Fichier | Role |
|---|---|
| `main.ts` | Bootstrap, fenetre, IPC dispatch |
| `preload.ts` | Expose un objet `window.tradingPro` via `contextBridge` (safe) |
| `services/db.ts` | Initialisation SQLite + schema |
| `services/env.ts` | Lecteur `.env` zero-dep |
| `services/auth.ts` | Register, login, JWT, OAuth Google, mailer |
| `services/mailer.ts` | Verification email via nodemailer (fallback console) |
| `services/markets.ts` | Endpoints crypto/stocks/news/forecast + cache |
| `services/portfolio.ts` | Positions + watchlist (lies a `users`) |

## Renderer (`src/`)

### Routing

```
/           → Landing
/login      → Connexion
/register   → Inscription
/verify     → Verification email
/app        → AppLayout (Sidebar + TopBar + Ticker)
  /        → Dashboard
  /markets → Marches (Crypto/Stocks/Watchlist)
  /markets/:kind/:id → Fiche actif (chart + forecast)
  /portfolio → Portefeuille
  /traders   → Pro traders
  /forecasts → Previsions
  /news      → Actualites
  /learn     → Cours
  /brokers   → Brokers
  /blockchain → Blockchains
  /glossary  → Glossaire
  /settings  → Reglages
```

### State

- `lib/store/auth.ts` : session utilisateur (Zustand). Token persiste via `localStorage`.
- Donnees marche : recuperees directement via IPC (`window.tradingPro.markets.*`), pas de cache cote renderer (cache cote main).

## Securite

| Mesure | Implementation |
|---|---|
| Context isolation | `webPreferences.contextIsolation: true` |
| Node integration | `webPreferences.nodeIntegration: false` |
| CSP | meta tag dans `index.html` |
| Mots de passe | bcryptjs (10 rounds) |
| Sessions | JWT HS256 (30 jours) |
| External links | `setWindowOpenHandler` → `shell.openExternal` |
| Communication | IPC valide cote main (auth via JWT) |

## Base de donnees

SQLite local, stocke dans `app.getPath('userData')` :
- Linux : `~/.config/Trading Pro/trading-pro.db`
- Windows : `%APPDATA%\Trading Pro\trading-pro.db`
- macOS : `~/Library/Application Support/Trading Pro/trading-pro.db`

Voir [`electron/services/db.ts`](../electron/services/db.ts) pour le schema.

## Flux d'authentification

```
[Register] → bcrypt hash + insert users + generate 6-digit code
         → sendVerificationEmail (SMTP ou console)
         → return JWT (compte non verifie)

[VerifyEmail] → match code → update users.verified=1

[Login] → bcrypt compare → return JWT

[Google OAuth] → ouvre auth URL dans navigateur
              → serveur HTTP local sur 53682 ecoute callback
              → echange code → fetch userinfo → upsert + JWT

[me] → verify JWT → SELECT users WHERE id=sub
```

## Flux de donnees de marche

```
Renderer:
  await window.tradingPro.markets.cryptoTop(50)
                        │
                        ▼ IPC
Main:
  ipcMain.handle('markets:crypto-top')
    → cache check (60s)
    → axios.get(CoinGecko /coins/markets)
    → cache.set + return data
```

Cache : `Map<string, { at, ttl, value }>` en memoire, par cle.

## Build et packaging

1. `npm run build:renderer` → Vite produit `dist/`.
2. `npm run build:electron` → tsc compile `electron/*.ts` vers `dist-electron/`.
3. `electron-builder` lit `package.json#build`, embarque `dist/` + `dist-electron/` dans une AppImage / NSIS installer.

Voir [BUILD.md](BUILD.md) pour les pre-requis (Wine pour les exe sur Linux).
