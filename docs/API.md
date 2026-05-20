# Reference API

Toutes les communications entre le front (renderer) et le main passent par `window.tradingPro`.

## `tradingPro.app`

| Methode | Retour | Description |
|---|---|---|
| `version()` | `Promise<string>` | Renvoie la version de l'application. |
| `openExternal(url)` | `Promise<void>` | Ouvre l'URL dans le navigateur systeme. |

## `tradingPro.auth`

| Methode | Body | Retour |
|---|---|---|
| `register({ email, password, username })` | — | `{ ok, token?, user?, error? }` |
| `login({ email, password })` | — | `{ ok, token?, user?, error? }` |
| `verifyEmail(token)` | code 6 chiffres | `{ ok, error? }` |
| `resendVerification(email)` | — | `{ ok, error? }` |
| `googleSignIn()` | — | `{ ok, token?, user?, error? }` |
| `me(token)` | — | `{ ok, user? }` |
| `logout(token)` | — | `{ ok }` |
| `updateProfile(token, { username?, avatarUrl? })` | — | `{ ok, user? }` |

### Format de `user`

```ts
{
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
  provider: 'local' | 'google';
  verified: boolean;
  createdAt: number; // epoch ms
}
```

## `tradingPro.markets`

Sources : CoinGecko (crypto), Yahoo Finance (actions), CryptoCompare (news), Alternative.me (Fear & Greed).

| Methode | Description | Cache TTL |
|---|---|---|
| `cryptoTop(limit)` | Top crypto par market cap, avec sparkline 7j | 60s |
| `cryptoHistory(id, days)` | Prices historiques d'une crypto (id CoinGecko) | 5 min |
| `globalCrypto()` | Statistiques globales du marche crypto | 60s |
| `fearGreed()` | Indice Fear & Greed (alternative.me) | 5 min |
| `stockQuote(symbol)` | Cotation Yahoo Finance | 30s |
| `stockHistory(symbol, range)` | Historique action (`1d`, `5d`, `1mo`, `3mo`, `1y`) | 5 min |
| `news(query)` | Articles CryptoCompare, filtres optionnels | 5 min |
| `forecast(symbol, kind)` | Projection 14j (regression + volatilite + RSI) | — |

### Format de `forecast`

```ts
{
  horizonDays: number;
  expectedChangePct: number;
  bias: 'bullish' | 'bearish' | 'neutral';
  rsi: number;        // 0-100
  volatility: number; // ecart-type des log-rendements
  points: [{ day, mid, lower, upper }];
  last: number;
  disclaimer: string;
}
```

## `tradingPro.portfolio`

Toutes les methodes prennent le token JWT en premier argument.

| Methode | Body | Description |
|---|---|---|
| `list(token)` | — | Toutes les positions de l'utilisateur |
| `add(token, position)` | `{ symbol, name, kind, quantity, avgPrice, notes? }` | Ajouter une ligne |
| `update(token, position)` | `{ id, quantity?, avgPrice?, notes? }` | Mettre a jour |
| `remove(token, id)` | — | Supprimer |

## `tradingPro.portfolio.watchlist`

| Methode | Body | Description |
|---|---|---|
| `list(token)` | — | Toute la watchlist |
| `add(token, { symbol, name, kind })` | — | Ajouter |
| `remove(token, id)` | — | Retirer |

## Sources externes utilisees

| Service | Endpoint | Documentation |
|---|---|---|
| CoinGecko | `https://api.coingecko.com/api/v3` | https://docs.coingecko.com |
| Yahoo Finance | `https://query1.finance.yahoo.com/v7/finance/quote` | non officiel |
| Yahoo Finance | `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}` | non officiel |
| CryptoCompare | `https://min-api.cryptocompare.com/data/v2/news/` | https://min-api.cryptocompare.com/documentation |
| Alternative.me | `https://api.alternative.me/fng/` | publique, sans cle |

## Codes d'erreur courants

| Cas | `error` |
|---|---|
| Mauvais identifiants | `Identifiants invalides.` |
| Email deja utilise | `Cet email est deja utilise.` |
| Mot de passe trop court | `Mot de passe trop court (min. 8).` |
| Token JWT invalide / expire | `Non authentifie.` |
| Rate limit CoinGecko (429) | Le cache amortit, mais les erreurs Axios remontent. |
| Donnees insuffisantes pour forecast | `Donnees insuffisantes.` |
