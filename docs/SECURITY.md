# Securite

## Principes

Trading Pro est concue comme une **application locale**. Aucune donnee n'est envoyee sur un serveur tiers en dehors des APIs publiques de marche (CoinGecko, Yahoo Finance, etc.).

## Stockage local

- **Base SQLite** : dans le dossier `userData` de l'OS (chiffre selon les permissions OS standard).
- **Token JWT** : dans `localStorage` de la fenetre Electron.
- **Aucun mot de passe en clair** : tous hashes en `bcrypt` (10 rounds).

## Architecture securisee

| Couche | Mesure |
|---|---|
| Renderer | `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false` (requis pour preload safe) |
| Preload | Expose une API minimaliste via `contextBridge` |
| Main | Valide chaque IPC (JWT verification cote serveur) |
| CSP | `default-src 'self' 'unsafe-inline' data: blob:; connect-src 'self' https: wss:; ...` |
| External links | Forces vers `shell.openExternal()` |

## JWT

- Algorithme : HS256.
- Validite : 30 jours.
- Secret : variable d'env `JWT_SECRET` (a configurer en production).
- Stocke cote client dans localStorage : risque XSS theorique (mais l'app est mono-utilisateur sur un device).

## Verification email

- Code numerique 6 chiffres genere aleatoirement.
- Stocke en clair temporairement dans `users.verification_token` (efface apres validation).
- Recommandation : pour la production, switcher vers un token cryptographique 32 bytes hex et utiliser un canal SMTP authentifie.

## OAuth Google

- Flux **Authorization Code** (et non Implicit).
- Serveur HTTP local sur le port 53682 (configurable).
- State parameter pour eviter le CSRF.
- Token jamais transmis a un serveur tiers (echange code → access token cote main process).

## Recommandations utilisateur

1. **Change le `JWT_SECRET` par defaut** en production.
2. Active la verification 2FA chez tes brokers reels (pas dans l'app, elle est paper).
3. **Hardware wallet** pour toute crypto > quelques milliers d'euros.
4. Pour stocker un `.env` avec des cles sensibles : utilise le repertoire `userData`, ne l'embarque pas dans l'AppImage.

## Limitations connues

- Pas de chiffrement applicatif sur la base SQLite (compte sur les permissions OS).
- Pas de revocation centralisee des JWT (changer `JWT_SECRET` les invalide tous).
- Le code de verification 6 chiffres est faible (chiffres uniquement) : suffisant pour un usage local, a renforcer si exposition publique.

## Reporting

Si tu trouves une vulnerabilite, contacte-nous via une issue GitHub privee. Merci.
