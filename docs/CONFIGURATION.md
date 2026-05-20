# Configuration

## Fichier `.env`

Tout est optionnel : l'application demarre meme sans `.env`. Renseigne uniquement ce dont tu as besoin.

```bash
cp .env.example .env
```

### Localisation du fichier

Trading Pro lit le `.env` dans l'ordre suivant (premier trouve gagne) :

1. `app.getPath('userData')/.env`
   - Linux : `~/.config/Trading Pro/.env`
   - Windows : `%APPDATA%\Trading Pro\.env`
   - macOS : `~/Library/Application Support/Trading Pro/.env`
2. Repertoire courant (`process.cwd()/.env`)
3. Repertoire de l'app (utile en dev)

> **Recommande** : pour l'app packagee, mets ton `.env` dans le repertoire `userData` afin qu'il ne soit pas embarque dans l'AppImage.

## Configuration de l'email (SMTP)

Pour activer la verification d'email reelle (au lieu de la console) :

### Option 1 : Gmail

1. Active la verification en 2 etapes sur ton compte Google.
2. Genere un **mot de passe d'application** sur https://myaccount.google.com/apppasswords.
3. Dans `.env` :
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=ton-adresse@gmail.com
   SMTP_PASS=xxxxxxxxxxxxxxxx
   SMTP_FROM="Trading Pro <ton-adresse@gmail.com>"
   ```

### Option 2 : Mailtrap (recommande pour le dev)

1. Cree un compte gratuit sur https://mailtrap.io.
2. Recupere les identifiants SMTP de ta sandbox.
3. Dans `.env` :
   ```
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=...
   SMTP_PASS=...
   ```

### Option 3 : Brevo / Resend / Postmark

Tous fonctionnent avec les memes parametres SMTP standard.

### Sans SMTP

Si tu ne configures rien, les codes de verification s'affichent dans la **console du processus principal d'Electron**. C'est l'idee pour les tests locaux.

## Configuration de Google OAuth

1. Va sur https://console.cloud.google.com.
2. Cree un projet, active **OAuth consent screen** (External, mode test possible).
3. **Credentials** → **Create credentials** → **OAuth client ID** :
   - Type : `Web application`
   - Authorized redirect URIs : `http://localhost:53682/oauth2callback`
4. Recupere le client ID et secret, puis :
   ```
   GOOGLE_CLIENT_ID=xxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxx
   GOOGLE_REDIRECT_URI=http://localhost:53682/oauth2callback
   ```

L'app ouvrira automatiquement le navigateur quand tu clique sur **Continuer avec Google**.

## APIs externes

### CoinGecko

- Gratuit, ~10-30 req/min.
- Pour des limites plus elevees : cle Demo gratuite a https://www.coingecko.com/en/api/pricing
  ```
  COINGECKO_DEMO_KEY=CG-xxxxxxxxxxxxxxx
  ```

### CryptoCompare

- Optionnel, sans cle l'app fonctionne deja.
- Pour augmenter les limits : cle gratuite sur https://www.cryptocompare.com/cryptopian/api-keys

### Alpha Vantage (actions plus profondes)

- Non utilise par defaut.
- Si tu veux ajouter dans une evolution :
  ```
  ALPHAVANTAGE_KEY=xxxxxxxxx
  ```

## JWT Secret

```
JWT_SECRET=une-longue-chaine-aleatoire-au-moins-32-caracteres
```

Genere une cle robuste :
```bash
openssl rand -base64 48
```

> Si tu changes le `JWT_SECRET`, **toutes les sessions actives sont invalidees**.

## Reinitialisation totale

Pour vider la base et repartir de zero :

```bash
# Linux
rm -rf "~/.config/Trading Pro"

# macOS
rm -rf "~/Library/Application Support/Trading Pro"

# Windows
rmdir /s /q "%APPDATA%\Trading Pro"
```
