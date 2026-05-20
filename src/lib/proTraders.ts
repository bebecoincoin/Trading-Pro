export interface ProTrader {
  slug: string;
  name: string;
  role: string;
  category: 'whale' | 'fund' | 'public' | 'on-chain';
  description: string;
  followers: string;
  primaryAssets: string[];
  publicLinks: { label: string; url: string }[];
  notableTrades: { date: string; asset: string; action: string; notes: string }[];
}

/**
 * Liste curee de traders/investisseurs dont les portefeuilles ou positions sont
 * documentes publiquement (rapports 13F, on-chain, declarations CFTC, presse).
 * NE PAS reproduire aveuglement — la copy-trade comporte un risque maximal.
 */
export const PRO_TRADERS: ProTrader[] = [
  {
    slug: 'warren-buffett',
    name: 'Warren Buffett',
    role: 'Berkshire Hathaway · CEO',
    category: 'fund',
    description:
      "Investisseur value historique. Portefeuille Berkshire publie chaque trimestre via les declarations 13F (SEC). Concentration sur Apple, banques, energie, conso.",
    followers: '7.5M+',
    primaryAssets: ['AAPL', 'BAC', 'KO', 'CVX', 'AXP'],
    publicLinks: [
      { label: 'Holdings 13F', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001067983&type=13F' },
      { label: 'Lettres annuelles', url: 'https://www.berkshirehathaway.com/letters/letters.html' },
    ],
    notableTrades: [
      { date: '2024 Q3', asset: 'AAPL', action: 'reduction', notes: 'Allegement progressif depuis 2024' },
      { date: '2024', asset: 'OXY', action: 'achat', notes: 'Accumulation longue terme sur petroliere' },
    ],
  },
  {
    slug: 'bill-ackman',
    name: 'Bill Ackman',
    role: 'Pershing Square · Founder',
    category: 'fund',
    description:
      "Hedge fund concentre (8-12 positions). Style activist long-only. Performance publique via Pershing Square Holdings.",
    followers: '1.6M+',
    primaryAssets: ['CMG', 'HLT', 'CP', 'BN', 'GOOGL'],
    publicLinks: [
      { label: 'Lettres trimestrielles', url: 'https://pershingsquareholdings.com/financials/' },
      { label: 'X / Twitter', url: 'https://twitter.com/BillAckman' },
    ],
    notableTrades: [
      { date: '2023', asset: 'Treasuries', action: 'short', notes: 'Pari sur la hausse des taux' },
      { date: '2024', asset: 'NKE', action: 'achat', notes: 'Position annoncee publiquement' },
    ],
  },
  {
    slug: 'cathie-wood',
    name: 'Cathie Wood',
    role: 'ARK Invest · CEO',
    category: 'fund',
    description:
      "Fonds disruptive innovation (ARKK). Transparence quotidienne des trades. Forte volatilite.",
    followers: '1.5M+',
    primaryAssets: ['TSLA', 'COIN', 'ROKU', 'PATH', 'TDOC'],
    publicLinks: [
      { label: 'Trades quotidiens', url: 'https://ark-funds.com/trade-notifications/' },
      { label: 'Research', url: 'https://research.ark-invest.com/' },
    ],
    notableTrades: [
      { date: '2024', asset: 'COIN', action: 'achat', notes: 'Renforcement Coinbase' },
      { date: '2024', asset: 'NVDA', action: 'vente', notes: 'Allegement sur les sommets' },
    ],
  },
  {
    slug: 'michael-saylor',
    name: 'Michael Saylor',
    role: 'MicroStrategy · Chairman',
    category: 'public',
    description:
      "Achat massif de Bitcoin via MicroStrategy. Toutes les acquisitions sont annoncees dans les filings SEC.",
    followers: '3.5M+',
    primaryAssets: ['BTC'],
    publicLinks: [
      { label: 'SEC filings', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001050446&type=8-K' },
      { label: 'X / Twitter', url: 'https://twitter.com/saylor' },
    ],
    notableTrades: [
      { date: '2024 T4', asset: 'BTC', action: 'achat', notes: 'Plus de 200k BTC accumules' },
    ],
  },
  {
    slug: 'whale-0x73af',
    name: 'Whale 0x73af3...',
    role: 'On-chain Ethereum',
    category: 'whale',
    description:
      "Adresse Ethereum a 8 chiffres dont les mouvements sont traces par Arkham et Nansen. Souvent active sur les depots vers exchanges.",
    followers: '—',
    primaryAssets: ['ETH', 'USDC', 'WBTC'],
    publicLinks: [
      { label: 'Arkham', url: 'https://platform.arkhamintelligence.com/' },
      { label: 'Etherscan', url: 'https://etherscan.io/' },
    ],
    notableTrades: [
      { date: '2024', asset: 'ETH', action: 'depot Binance', notes: 'Indice baissier court terme' },
    ],
  },
  {
    slug: 'ray-dalio',
    name: 'Ray Dalio',
    role: 'Bridgewater Associates · Founder',
    category: 'fund',
    description:
      "Plus gros hedge fund mondial. Approche All Weather, macro globale. Portefeuille publie via 13F.",
    followers: '1.4M+',
    primaryAssets: ['SPY', 'IVV', 'IEMG', 'GLD'],
    publicLinks: [
      { label: 'Bridgewater 13F', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001350694&type=13F' },
    ],
    notableTrades: [
      { date: '2024', asset: 'GLD', action: 'achat', notes: 'Diversification or' },
    ],
  },
  {
    slug: 'satoshi-stash',
    name: 'Genesis Whale (Patoshi)',
    role: 'On-chain Bitcoin',
    category: 'on-chain',
    description:
      "Cluster d'adresses lies a Satoshi Nakamoto. Aucun mouvement majeur depuis 2010. Surveillance via WhaleAlert.",
    followers: '—',
    primaryAssets: ['BTC'],
    publicLinks: [
      { label: 'WhaleAlert', url: 'https://whale-alert.io/' },
      { label: 'Blockchain.com', url: 'https://www.blockchain.com/explorer' },
    ],
    notableTrades: [],
  },
  {
    slug: 'paul-tudor-jones',
    name: 'Paul Tudor Jones',
    role: 'Tudor Investment Corp',
    category: 'fund',
    description: 'Macro trader legendaire (Black Monday 87). Position publique pro-Bitcoin et or.',
    followers: '500k+',
    primaryAssets: ['GLD', 'BTC', 'TLT'],
    publicLinks: [
      { label: 'Tudor 13F', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001037389&type=13F' },
    ],
    notableTrades: [
      { date: '2020-2024', asset: 'BTC', action: 'long', notes: 'Hedge anti-inflation' },
    ],
  },
];
