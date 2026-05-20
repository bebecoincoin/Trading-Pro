# APIs gratuites recommandees

Liste exhaustive des services gratuits que tu peux utiliser pour enrichir Trading Pro. **Aucun n'est obligatoire** — l'app fonctionne deja sans aucune cle. Mais ces services apportent des limites de requetes plus elevees, des donnees plus completes ou des fonctionnalites supplementaires.

> Pour chaque service, je donne le lien d'inscription, le nom de la variable a mettre dans `.env`, et ce que ca debloque.

## 🥇 Recommandes en priorite

### 1. CoinGecko (crypto — donnees de marche)

- **Site** : https://www.coingecko.com/en/api/pricing
- **Inscription** : https://www.coingecko.com/en/api/pricing → "Get Free API Key" (Demo plan)
- **Limite gratuite** : 30 req/min, 10 000 calls/mois
- **Sans cle** : ~10 req/min (deja suffisant pour l'app, mais fragile)
- **Variable .env** : `COINGECKO_DEMO_KEY=CG-xxxxxxxxxxxx`
- **Ce que ca debloque** : top 250 cryptos, historique 5 ans, sparklines, donnees DeFi.

### 2. CryptoCompare (crypto news + prix)

- **Site** : https://www.cryptocompare.com/cryptopian/api-keys
- **Inscription** : compte gratuit
- **Limite gratuite** : 100 000 calls/mois
- **Variable .env** : `CRYPTOCOMPARE_KEY=xxxxxxxxxxxx`
- **Ce que ca debloque** : news en temps reel, prix sur 300+ exchanges, donnees historiques minutes.

### 3. Finnhub (actions — temps reel)

- **Site** : https://finnhub.io/register
- **Limite gratuite** : 60 calls/min, marche US
- **Variable .env** (a ajouter si tu veux) : `FINNHUB_KEY=xxxxxxxxxxxx`
- **Ce que ca debloque** : actions, ETF, forex, fondamentaux, earnings, news financiere.

### 4. Alpha Vantage (actions, forex, fondamentaux)

- **Site** : https://www.alphavantage.co/support/#api-key
- **Limite gratuite** : 25 calls/jour, 5 calls/minute
- **Variable .env** : `ALPHAVANTAGE_KEY=xxxxxxxxxxxx`
- **Ce que ca debloque** : marches mondiaux, fondamentaux complets, indicateurs techniques pre-calcules.

## 📰 Pour les news

### 5. NewsAPI

- **Site** : https://newsapi.org/register
- **Limite gratuite** : 100 req/jour (dev only)
- **Variable .env** : `NEWS_API_KEY=xxxxxxxxxxxx`
- **Bonus** : 200+ sources internationales (Reuters, Bloomberg, FT…).

### 6. Marketaux (news financiere)

- **Site** : https://www.marketaux.com/account/register
- **Limite gratuite** : 100 req/jour
- **Bonus** : news taggees par ticker.

### 7. CryptoPanic

- **Site** : https://cryptopanic.com/developers/api/
- **Limite gratuite** : tres genereuse
- **Bonus** : sentiment vote par la communaute.

## 📈 Donnees actions plus profondes

### 8. Polygon.io

- **Site** : https://polygon.io/
- **Limite gratuite** : 5 calls/min, fin de journee
- **Bonus** : qualite institutionnelle, websockets, options chains.

### 9. Twelve Data

- **Site** : https://twelvedata.com/pricing
- **Limite gratuite** : 800 req/jour, 8 req/min
- **Bonus** : indices, forex, ETF, indicateurs techniques.

### 10. EOD Historical Data

- **Site** : https://eodhd.com/
- **Limite gratuite** : 20 calls/jour
- **Bonus** : EOD complet sur 30+ ans, 70 bourses.

## 🔐 Authentification & email

### 11. Mailtrap (SMTP de test)

- **Site** : https://mailtrap.io/
- **Limite gratuite** : 500 emails/mois (sandbox), parfait pour tester la verification.
- **Variables .env** :
  ```
  SMTP_HOST=sandbox.smtp.mailtrap.io
  SMTP_PORT=2525
  SMTP_USER=...
  SMTP_PASS=...
  ```

### 12. Resend (production)

- **Site** : https://resend.com/
- **Limite gratuite** : 3 000 emails/mois, 100/jour
- **Bonus** : API simple, bon deliverability.
- **Variables .env** :
  ```
  SMTP_HOST=smtp.resend.com
  SMTP_PORT=587
  SMTP_USER=resend
  SMTP_PASS=re_xxxxxxxxxxxxxxxx
  ```

### 13. Brevo (ex-Sendinblue)

- **Site** : https://www.brevo.com/free-smtp-server/
- **Limite gratuite** : 300 emails/jour gratuit a vie.

### 14. Gmail SMTP (perso)

- **Setup** : https://myaccount.google.com/apppasswords → genere un "App password"
- **Variables .env** :
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=ton-adresse@gmail.com
  SMTP_PASS=xxxx xxxx xxxx xxxx
  ```

### 15. Google OAuth (connexion Google)

- **Console** : https://console.cloud.google.com/
- **Procedure** :
  1. Cree un projet.
  2. Active "Google Identity" dans APIs & Services.
  3. OAuth consent screen → External + ajoute ton email en test user.
  4. Credentials → "Create OAuth Client ID" → Web application.
  5. Authorized redirect URI : `http://localhost:53682/oauth2callback`
- **Variables .env** :
  ```
  GOOGLE_CLIENT_ID=xxxxxxx.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
  ```

## 🌐 Macro & onchain (bonus)

### 16. FRED (donnees economiques)

- **Site** : https://fred.stlouisfed.org/docs/api/api_key.html
- **Limite gratuite** : illimite
- **Bonus** : PIB, inflation, chomage, taux Fed.

### 17. Etherscan / BscScan / Polygonscan (onchain)

- **Sites** :
  - https://etherscan.io/apis
  - https://bscscan.com/apis
  - https://polygonscan.com/apis
- **Limite gratuite** : 5 calls/sec
- **Bonus** : suivi des wallets, transactions, smart contracts.

### 18. Alchemy (RPC blockchain)

- **Site** : https://www.alchemy.com/
- **Limite gratuite** : 300M compute units/mois
- **Bonus** : Ethereum, Polygon, Arbitrum, Optimism, Base, Solana RPC + APIs avancees.

### 19. Helius (Solana onchain)

- **Site** : https://helius.dev/
- **Limite gratuite** : 100k req/mois
- **Bonus** : transactions Solana enrichies.

### 20. CoinMarketCap

- **Site** : https://coinmarketcap.com/api/
- **Limite gratuite** : 10 000 calls/mois (Basic plan)
- **Bonus** : alternative a CoinGecko, donnees parfois plus a jour.

## 🤖 Sentiment / IA

### 21. Alternative.me Fear & Greed

- Deja integre sans cle.

### 22. The Tie / LunarCrush (sentiment social crypto)

- **LunarCrush** : https://lunarcrush.com/developers (gratuit limite)

### 23. Hugging Face (modeles IA)

- **Site** : https://huggingface.co/
- **Limite gratuite** : Inference API limite
- **Bonus** : analyse de sentiment sur news, summary.

## 📝 Commandes recapitulatives

Si tu actives plusieurs APIs, voici un `.env` complet :

```bash
# JWT
JWT_SECRET=ChangeMoi_GenererAvec_openssl_rand_base64_48

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mon@gmail.com
SMTP_PASS=mot-de-passe-app

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Markets
COINGECKO_DEMO_KEY=CG-xxx
CRYPTOCOMPARE_KEY=xxx
ALPHAVANTAGE_KEY=xxx
FINNHUB_KEY=xxx
NEWS_API_KEY=xxx
```

Puis dans Trading Pro :
- Linux/AppImage : place le `.env` dans `~/.config/Trading Pro/.env`
- Windows : place le dans `%APPDATA%\Trading Pro\.env`

L'app rechargera ces variables au prochain demarrage.

## ❓ Que se passe-t-il si tu ne configures rien ?

L'app fonctionne. Voici ce que tu perds :

| Sans cle | Consequences |
|---|---|
| CoinGecko | Risque de rate-limit (429) toutes les 1-2 min en navigation soutenue. Le cache de 60s limite l'impact. |
| CryptoCompare | News fonctionnent quand meme (acces public). |
| SMTP | Le code de verification s'affiche dans la console Electron — visible en ouvrant `Aide > Outils developpeur`. |
| Google OAuth | Bouton "Continuer avec Google" indisponible. L'inscription email reste possible. |
| Yahoo Finance | Aucune cle requise (endpoint public, non officiel). |

**Conclusion : commence sans rien, ajoute des cles uniquement si tu rencontres des limites.**
