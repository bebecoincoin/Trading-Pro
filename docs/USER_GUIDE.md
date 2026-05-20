# Guide utilisateur

## Premier lancement

1. Ouvre **Trading Pro** (AppImage ou .exe).
2. Sur la page d'accueil, clique sur **Creer un compte**.
3. Remplis ton pseudo, email et un mot de passe d'au moins 8 caracteres.
4. Tu recois un code de verification a 6 chiffres :
   - Si SMTP est configure : par email.
   - Sinon : il s'affiche dans la console du processus principal d'Electron.
5. Entre le code sur la page **Verifier**.

> Tu peux aussi cliquer sur **Continuer avec Google** si l'OAuth Google est configure (voir [CONFIGURATION.md](CONFIGURATION.md)).

## Dashboard

A l'ouverture, tu vois :

- **4 KPIs** : market cap totale crypto, volume 24h, dominance BTC, indice Fear & Greed.
- **Bitcoin chart 30j** : courbe interactive.
- **Top gagnants / perdants 24h**.
- **Top capitalisations** avec mini-sparkline 7 jours par actif.

Tu peux cliquer sur chaque actif pour acceder a sa fiche detaillee.

## Marches

3 onglets :

- **Crypto** : top 100 (CoinGecko). Filtre par nom ou symbole. L'etoile permet d'ajouter en watchlist.
- **Actions** : ~12 valeurs majeures (AAPL, NVDA, TSLA, MSFT, SPY, QQQ…) via Yahoo Finance.
- **Watchlist** : ta selection.

Cliquer sur une ligne ouvre la fiche actif.

## Fiche actif

- Graphique chandelier interactif (zoom, hover, curseur).
- 5 fenetres de temps : 24h, 7j, 30j, 90j, 1 an.
- Bouton **Calculer la prevision** pour generer une projection 14 jours avec bornes 95%.
- Panneau **Donnees cles** : market cap, supply, ATH/ATL, etc.

## Simulateur 1 000 000 $

C'est ICI que tu peux **trader** comme si tu avais 1 million de dollars.

### Comment ca marche

- Au premier acces, l'app te credite automatiquement de **1 000 000 $** virtuels.
- Les prix sont les **vrais prix marche** (CoinGecko pour les crypto, Yahoo Finance pour les actions).
- Frais simules : **0.1%** par ordre (taux Binance taker).
- **Long only** : pas de short, pas d'effet de levier.

### Acheter

1. Page **Simulateur 1M $** (icone eclair dans la sidebar).
2. Section "Achat rapide" : clique sur un actif populaire (Bitcoin, Ethereum, Apple…) ou **+ Ordre personnalise**.
3. Choisis la quantite OU le montant en dollars (les deux se mettent a jour automatiquement).
4. Le sous-total, les frais et le cout total s'affichent.
5. Clique **Confirmer l'achat**.

### Vendre

Dans le tableau des positions ouvertes, clique **Vendre** sur la ligne concernee. Le P&L realise s'affiche immediatement.

### Suivre la performance

- KPIs en haut : Valeur totale, Cash disponible, Positions, P&L total.
- Tableau "Positions ouvertes" : valeur live, P&L latent par ligne.
- Onglet "Historique" : tous tes ordres avec date, prix, frais, P&L realise.

### Reset

Bouton **Reinitialiser a 1M $** : efface tout et te redonne 1 million pour recommencer.

## Portefeuille (suivi manuel)

Le simulateur est pour pratiquer. Si tu veux par contre **tracker des positions reelles que tu detiens ailleurs** (sur Binance, Coinbase, ton broker…), utilise la page **Portefeuille** :

- Bouton **Nouvelle position** : ajouter une ligne (crypto ou action).
- Champs : symbole, quantite, prix moyen, notes.
- Calcul de PnL temps reel.

> **Important** : aucun ordre n'est jamais envoye a un broker reel. Tout est local.

## APIs gratuites

Page **APIs gratuites** (icone cle dans la sidebar) : la liste complete de tous les services gratuits que tu peux brancher (CoinGecko, Finnhub, Resend, Google OAuth…). Pour chaque service :

- Description et tier gratuit.
- Bouton **S'inscrire** qui ouvre directement la page d'inscription.
- Format exact a copier-coller dans ton `.env` (un bouton "copier" est inclus).

## Pro Traders

8 profils de **traders / fonds publics** :

- Fonds (Bridgewater, Berkshire, ARK Invest, Pershing Square…).
- Whales on-chain et publiques.
- Filtres par categorie.
- Liens directs vers SEC 13F, Etherscan, Arkham…

## Previsions

- Tape un symbole (id CoinGecko pour crypto, ticker pour action).
- L'app charge 60 jours d'historique et calcule :
  - Tendance lineaire (regression).
  - Volatilite log-normale.
  - RSI 14.
  - Projection 14 jours avec intervalle de confiance 95%.

> **Disclaimer** : c'est un outil pedagogique. Aucune garantie d'aucune sorte. Le marche n'est pas predictible.

## Cours

4 cursus :

1. **Les bases du trading** (3 lecons).
2. **Analyse technique** (3 lecons).
3. **Crypto & blockchain** (3 lecons).
4. **Psychologie du trader** (2 lecons).

Cliquer un cours, choisir une lecon. Chaque lecon contient :
- Resume.
- Texte detaille.
- Liste de **points cles** a retenir.

## Brokers

Comparatif des 10 plateformes principales :
- Interactive Brokers, Saxo Bank, Trade Republic, eToro
- Binance, Coinbase, Kraken, Alpaca, Bitget
- Bourse Direct

Pour chacun : reglementation, frais, depot minimum, API publique, avantages / inconvenients.

## Blockchain

10 blockchains documentees (BTC, ETH, SOL, Arbitrum, Base, Polygon, BNB, Avalanche, Cosmos, Sui).
Donnees : consensus, layer, TPS, frais, ecosystemes, liens.

## Glossaire

30+ termes essentiels organises par categorie (Trading / Crypto / Macro / Risk). Recherche instantanee.

## News

Actualites crypto agregees par CryptoCompare. Filtre par mot cle. Clic = ouverture dans le navigateur systeme.

## Reglages

- Modifier le pseudo et l'avatar.
- Verifier le statut de l'email.
- Se deconnecter (les donnees restent locales).
