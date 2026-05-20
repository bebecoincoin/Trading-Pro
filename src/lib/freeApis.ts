export interface FreeApi {
  name: string;
  category: 'Marche' | 'Crypto' | 'Actions' | 'News' | 'Auth/Email' | 'Onchain' | 'Macro' | 'IA';
  url: string;
  signupUrl: string;
  freeTier: string;
  envVar?: string;
  envFormat?: string;
  description: string;
  recommended?: boolean;
  required?: boolean;
}

export const FREE_APIS: FreeApi[] = [
  // ===== MARCHE / CRYPTO =====
  {
    name: 'CoinGecko',
    category: 'Crypto',
    url: 'https://www.coingecko.com/en/api',
    signupUrl: 'https://www.coingecko.com/en/api/pricing',
    freeTier: '30 req/min · 10 000 calls/mois',
    envVar: 'COINGECKO_DEMO_KEY',
    envFormat: 'CG-xxxxxxxxxxxxxxxx',
    description:
      'Top 250 cryptos, prix temps reel, historique 5 ans, sparklines, donnees DeFi. Deja utilise par l\'app sans cle, mais les rate limits sont fragiles.',
    recommended: true,
  },
  {
    name: 'CryptoCompare',
    category: 'Crypto',
    url: 'https://www.cryptocompare.com',
    signupUrl: 'https://www.cryptocompare.com/cryptopian/api-keys',
    freeTier: '100 000 calls/mois',
    envVar: 'CRYPTOCOMPARE_KEY',
    description:
      'News crypto temps reel + prix sur 300+ exchanges. Deja utilise pour les news sans cle.',
    recommended: true,
  },
  {
    name: 'CoinMarketCap',
    category: 'Crypto',
    url: 'https://coinmarketcap.com/api/',
    signupUrl: 'https://pro.coinmarketcap.com/signup',
    freeTier: '10 000 calls/mois (Basic plan)',
    envVar: 'CMC_KEY',
    description: 'Alternative a CoinGecko. Donnees parfois plus a jour.',
  },
  // ===== ACTIONS =====
  {
    name: 'Finnhub',
    category: 'Actions',
    url: 'https://finnhub.io',
    signupUrl: 'https://finnhub.io/register',
    freeTier: '60 calls/min',
    envVar: 'FINNHUB_KEY',
    description: 'Actions US, ETF, forex, fondamentaux, earnings, news financiere. Excellent free tier.',
    recommended: true,
  },
  {
    name: 'Alpha Vantage',
    category: 'Actions',
    url: 'https://www.alphavantage.co',
    signupUrl: 'https://www.alphavantage.co/support/#api-key',
    freeTier: '25 calls/jour · 5 calls/min',
    envVar: 'ALPHAVANTAGE_KEY',
    description: 'Marches mondiaux, indicateurs techniques pre-calcules, fondamentaux.',
  },
  {
    name: 'Twelve Data',
    category: 'Actions',
    url: 'https://twelvedata.com',
    signupUrl: 'https://twelvedata.com/pricing',
    freeTier: '800 req/jour · 8 req/min',
    envVar: 'TWELVEDATA_KEY',
    description: 'Indices, forex, ETF + indicateurs techniques.',
  },
  {
    name: 'Polygon.io',
    category: 'Actions',
    url: 'https://polygon.io',
    signupUrl: 'https://polygon.io/dashboard/signup',
    freeTier: '5 calls/min · fin de journee',
    envVar: 'POLYGON_KEY',
    description: 'Qualite institutionnelle, websockets, options chains.',
  },
  // ===== NEWS =====
  {
    name: 'NewsAPI',
    category: 'News',
    url: 'https://newsapi.org',
    signupUrl: 'https://newsapi.org/register',
    freeTier: '100 req/jour (dev only)',
    envVar: 'NEWS_API_KEY',
    description: 'Plus de 200 sources mondiales (Reuters, FT, Bloomberg…).',
  },
  {
    name: 'Marketaux',
    category: 'News',
    url: 'https://www.marketaux.com',
    signupUrl: 'https://www.marketaux.com/account/register',
    freeTier: '100 req/jour',
    envVar: 'MARKETAUX_KEY',
    description: 'News financiere taggee par ticker, sentiment.',
  },
  {
    name: 'CryptoPanic',
    category: 'News',
    url: 'https://cryptopanic.com',
    signupUrl: 'https://cryptopanic.com/developers/api/',
    freeTier: 'Genereuse',
    envVar: 'CRYPTOPANIC_KEY',
    description: 'News crypto avec sentiment vote par la communaute.',
  },
  // ===== EMAIL / AUTH =====
  {
    name: 'Mailtrap (sandbox)',
    category: 'Auth/Email',
    url: 'https://mailtrap.io',
    signupUrl: 'https://mailtrap.io/register/signup',
    freeTier: '500 emails/mois (sandbox)',
    envVar: 'SMTP_HOST',
    envFormat: 'SMTP_HOST=sandbox.smtp.mailtrap.io\nSMTP_PORT=2525\nSMTP_USER=...\nSMTP_PASS=...',
    description: 'PARFAIT pour tester la verification d\'email en dev sans envoyer de vrais mails.',
    recommended: true,
  },
  {
    name: 'Resend',
    category: 'Auth/Email',
    url: 'https://resend.com',
    signupUrl: 'https://resend.com/signup',
    freeTier: '3 000 emails/mois · 100/jour',
    envVar: 'SMTP_HOST',
    envFormat: 'SMTP_HOST=smtp.resend.com\nSMTP_PORT=587\nSMTP_USER=resend\nSMTP_PASS=re_xxxxxxxxxxxx',
    description: 'Production grade, deliverability excellent. API simple.',
    recommended: true,
  },
  {
    name: 'Brevo (ex-Sendinblue)',
    category: 'Auth/Email',
    url: 'https://www.brevo.com',
    signupUrl: 'https://www.brevo.com/free-smtp-server/',
    freeTier: '300 emails/jour gratuit a vie',
    description: 'Solide pour la production. SMTP standard.',
  },
  {
    name: 'Gmail SMTP',
    category: 'Auth/Email',
    url: 'https://myaccount.google.com/apppasswords',
    signupUrl: 'https://myaccount.google.com/apppasswords',
    freeTier: 'Ton compte Gmail · ~500/jour',
    envFormat:
      'SMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=ton-adresse@gmail.com\nSMTP_PASS=xxxx xxxx xxxx xxxx',
    description: 'Necessite la verification 2 etapes + un App Password.',
  },
  {
    name: 'Google OAuth',
    category: 'Auth/Email',
    url: 'https://console.cloud.google.com',
    signupUrl: 'https://console.cloud.google.com',
    freeTier: 'Gratuit illimite',
    envVar: 'GOOGLE_CLIENT_ID',
    envFormat:
      'GOOGLE_CLIENT_ID=xxxxxxx.apps.googleusercontent.com\nGOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx\nGOOGLE_REDIRECT_URI=http://localhost:53682/oauth2callback',
    description:
      'Active le bouton "Continuer avec Google". Procedure : creer un projet, OAuth consent screen (External), Credentials > Web application.',
    recommended: true,
  },
  // ===== ONCHAIN =====
  {
    name: 'Etherscan',
    category: 'Onchain',
    url: 'https://etherscan.io',
    signupUrl: 'https://etherscan.io/apis',
    freeTier: '5 calls/sec',
    envVar: 'ETHERSCAN_KEY',
    description: 'Transactions Ethereum, wallets, smart contracts, NFT.',
  },
  {
    name: 'BscScan',
    category: 'Onchain',
    url: 'https://bscscan.com',
    signupUrl: 'https://bscscan.com/apis',
    freeTier: '5 calls/sec',
    envVar: 'BSCSCAN_KEY',
    description: 'Equivalent Etherscan pour BNB Chain.',
  },
  {
    name: 'Polygonscan',
    category: 'Onchain',
    url: 'https://polygonscan.com',
    signupUrl: 'https://polygonscan.com/apis',
    freeTier: '5 calls/sec',
    envVar: 'POLYGONSCAN_KEY',
    description: 'Equivalent Etherscan pour Polygon.',
  },
  {
    name: 'Alchemy',
    category: 'Onchain',
    url: 'https://www.alchemy.com',
    signupUrl: 'https://dashboard.alchemy.com/signup',
    freeTier: '300M compute units/mois',
    envVar: 'ALCHEMY_KEY',
    description: 'RPC + APIs avancees pour Ethereum, Polygon, Arbitrum, Base, Optimism, Solana.',
  },
  {
    name: 'Helius (Solana)',
    category: 'Onchain',
    url: 'https://helius.dev',
    signupUrl: 'https://helius.dev',
    freeTier: '100k req/mois',
    envVar: 'HELIUS_KEY',
    description: 'RPC Solana + transactions enrichies.',
  },
  // ===== MACRO =====
  {
    name: 'FRED (St. Louis Fed)',
    category: 'Macro',
    url: 'https://fred.stlouisfed.org',
    signupUrl: 'https://fred.stlouisfed.org/docs/api/api_key.html',
    freeTier: 'Illimite',
    envVar: 'FRED_KEY',
    description: 'PIB, inflation, chomage, taux Fed. Donnees officielles US.',
  },
  // ===== IA =====
  {
    name: 'Hugging Face',
    category: 'IA',
    url: 'https://huggingface.co',
    signupUrl: 'https://huggingface.co/join',
    freeTier: 'Inference API limite',
    envVar: 'HUGGINGFACE_TOKEN',
    description: 'Analyse de sentiment sur news, summary automatique.',
  },
  {
    name: 'LunarCrush (social crypto)',
    category: 'IA',
    url: 'https://lunarcrush.com',
    signupUrl: 'https://lunarcrush.com/developers',
    freeTier: 'Gratuit limite',
    envVar: 'LUNARCRUSH_KEY',
    description: 'Sentiment social autour des cryptos (Twitter, Reddit).',
  },
];
