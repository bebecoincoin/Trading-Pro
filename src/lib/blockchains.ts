export interface Blockchain {
  name: string;
  ticker: string;
  consensus: string;
  layer: 1 | 2;
  category: string;
  launched: number;
  description: string;
  tps: string;
  fees: string;
  ecosystems: string[];
  explorer: string;
  website: string;
}

export const BLOCKCHAINS: Blockchain[] = [
  {
    name: 'Bitcoin',
    ticker: 'BTC',
    consensus: 'Proof of Work (SHA-256)',
    layer: 1,
    category: 'Store of value',
    launched: 2009,
    description:
      'Premier reseau decentralise. Or numerique. Supply fixe a 21M, halving tous les ~4 ans.',
    tps: '~7 TPS',
    fees: 'Variable (1-50$ selon congestion)',
    ecosystems: ['Lightning Network', 'Stacks', 'Ordinals'],
    explorer: 'https://mempool.space',
    website: 'https://bitcoin.org',
  },
  {
    name: 'Ethereum',
    ticker: 'ETH',
    consensus: 'Proof of Stake',
    layer: 1,
    category: 'Smart contracts',
    launched: 2015,
    description:
      "Plateforme programmable. DeFi, NFT, DAO. The Merge en 2022, Dencun en 2024 (blobs L2).",
    tps: '~15 TPS L1, 1000+ via L2',
    fees: 'Variable (gas), generalement 0.1-5$',
    ecosystems: ['Uniswap', 'Aave', 'Lido', 'Arbitrum', 'Optimism', 'Base'],
    explorer: 'https://etherscan.io',
    website: 'https://ethereum.org',
  },
  {
    name: 'Solana',
    ticker: 'SOL',
    consensus: 'PoH + PoS',
    layer: 1,
    category: 'Haute performance',
    launched: 2020,
    description:
      'Architecture pipelinee, frais ultra-bas. Forte croissance memecoins/DePIN/Pump.fun.',
    tps: '2 000 - 50 000 TPS',
    fees: '< 0.01 $',
    ecosystems: ['Jupiter', 'Jito', 'Pump.fun', 'Drift'],
    explorer: 'https://solscan.io',
    website: 'https://solana.com',
  },
  {
    name: 'Arbitrum',
    ticker: 'ARB',
    consensus: 'Optimistic Rollup',
    layer: 2,
    category: 'Ethereum L2',
    launched: 2021,
    description:
      "Le L2 le plus utilise d'Ethereum. Compatible EVM, frais 10-100x inferieurs.",
    tps: '~4 000 TPS',
    fees: '0.01 - 0.30 $',
    ecosystems: ['GMX', 'Camelot', 'Radiant'],
    explorer: 'https://arbiscan.io',
    website: 'https://arbitrum.io',
  },
  {
    name: 'Base',
    ticker: '—',
    consensus: 'OP Stack (Optimistic Rollup)',
    layer: 2,
    category: 'Ethereum L2',
    launched: 2023,
    description: "L2 incube par Coinbase. Onboarding fluide, frais reduits.",
    tps: '~500 TPS',
    fees: '< 0.10 $',
    ecosystems: ['Aerodrome', 'Friend.tech', 'Coinbase Wallet'],
    explorer: 'https://basescan.org',
    website: 'https://base.org',
  },
  {
    name: 'Polygon PoS',
    ticker: 'MATIC/POL',
    consensus: 'PoS',
    layer: 2,
    category: 'Ethereum sidechain',
    launched: 2020,
    description: 'Sidechain EVM ultra-economique. Tres utilisee par les entreprises web2.',
    tps: '~7 000 TPS',
    fees: '0.001 $',
    ecosystems: ['QuickSwap', 'Aavegotchi', 'Polymarket'],
    explorer: 'https://polygonscan.com',
    website: 'https://polygon.technology',
  },
  {
    name: 'BNB Chain',
    ticker: 'BNB',
    consensus: 'PoSA',
    layer: 1,
    category: 'EVM compatible',
    launched: 2020,
    description: 'Chaine de Binance, frais bas, ecosysteme massif. Centralisation discutee.',
    tps: '~2 000 TPS',
    fees: '0.10 $',
    ecosystems: ['PancakeSwap', 'Venus', 'Trust Wallet'],
    explorer: 'https://bscscan.com',
    website: 'https://bnbchain.org',
  },
  {
    name: 'Avalanche',
    ticker: 'AVAX',
    consensus: 'Avalanche consensus',
    layer: 1,
    category: 'Subnets',
    launched: 2020,
    description: 'Tres rapide, sub-second finality. Architecture multi-subnet.',
    tps: '~4 500 TPS',
    fees: '0.05 $',
    ecosystems: ['Trader Joe', 'GMX', 'Benqi'],
    explorer: 'https://snowtrace.io',
    website: 'https://avax.network',
  },
  {
    name: 'Cosmos Hub',
    ticker: 'ATOM',
    consensus: 'Tendermint BFT',
    layer: 1,
    category: 'Inter-chain',
    launched: 2019,
    description: "Internet des blockchains. IBC permet les transferts cross-chain natifs.",
    tps: '~10 000 TPS (chaine app)',
    fees: '< 0.01 $',
    ecosystems: ['Osmosis', 'dYdX v4', 'Celestia'],
    explorer: 'https://www.mintscan.io/cosmos',
    website: 'https://cosmos.network',
  },
  {
    name: 'Sui',
    ticker: 'SUI',
    consensus: 'Mysticeti DAG',
    layer: 1,
    category: 'High throughput',
    launched: 2023,
    description:
      "Architecture object-centric (Move). Tres rapide, peu de congestion.",
    tps: '~120 000 TPS theorique',
    fees: '< 0.01 $',
    ecosystems: ['Cetus', 'Suilend', 'Aftermath'],
    explorer: 'https://suiscan.xyz',
    website: 'https://sui.io',
  },
];
