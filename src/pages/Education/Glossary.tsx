import { useMemo, useState } from 'react';
import { BookOpenCheck, Search } from 'lucide-react';

interface Term {
  term: string;
  category: 'Trading' | 'Crypto' | 'Macro' | 'Risk';
  definition: string;
}

const TERMS: Term[] = [
  { term: 'Bid / Ask', category: 'Trading', definition: 'Bid = meilleur prix acheteur. Ask = meilleur prix vendeur. La difference est le spread.' },
  { term: 'Slippage', category: 'Trading', definition: 'Difference entre le prix attendu et le prix execute. Plus fort en volatilite ou faible liquidite.' },
  { term: 'Long / Short', category: 'Trading', definition: "Long : parier a la hausse. Short : parier a la baisse (vente a decouvert)." },
  { term: 'Leverage', category: 'Trading', definition: "Effet de levier. Multiplie le gain ET la perte. Liquidation possible." },
  { term: 'Stop Loss', category: 'Risk', definition: 'Ordre automatique qui ferme une position perdante a un niveau predefini.' },
  { term: 'Take Profit', category: 'Risk', definition: "Ordre automatique de cloture en profit." },
  { term: 'Drawdown', category: 'Risk', definition: "Recul maximum du capital depuis un plus haut. Indicateur cle de risque psychologique." },
  { term: 'Volatilite', category: 'Risk', definition: "Mesure de l'amplitude des variations de prix. Generalement l'ecart-type des rendements." },
  { term: 'Liquidite', category: 'Trading', definition: "Capacite du marche a absorber un ordre sans bouger trop. Forte liquidite = spread serre." },
  { term: 'Volume', category: 'Trading', definition: "Quantite echangee sur une periode. Confirme les mouvements." },
  { term: 'RSI', category: 'Trading', definition: "Relative Strength Index. Oscillateur 0-100. >70 surachete, <30 survendu." },
  { term: 'MACD', category: 'Trading', definition: "Moving Average Convergence Divergence. Croisement EMA12-EMA26 + signal EMA9." },
  { term: 'Halving', category: 'Crypto', definition: "Division par 2 de la recompense de bloc Bitcoin (tous les ~4 ans)." },
  { term: 'DeFi', category: 'Crypto', definition: "Finance decentralisee : protocoles ouverts sur blockchain (Uniswap, Aave...)." },
  { term: 'Smart Contract', category: 'Crypto', definition: "Code execute sur la blockchain qui automatise des accords financiers." },
  { term: 'Layer 1 / Layer 2', category: 'Crypto', definition: "L1 = chaine de base (BTC, ETH). L2 = surcouche pour scalabilite (Arbitrum, Base)." },
  { term: 'Gas', category: 'Crypto', definition: "Cout des operations sur Ethereum, paye en ETH. Varie selon la congestion." },
  { term: 'Whale', category: 'Crypto', definition: "Detenteur de tres gros montants, dont les mouvements peuvent bouger le marche." },
  { term: 'Staking', category: 'Crypto', definition: "Bloquer ses tokens pour securiser la chaine et toucher des recompenses." },
  { term: 'TVL', category: 'Crypto', definition: "Total Value Locked. Montant total bloque dans un protocole DeFi." },
  { term: 'Yield Farming', category: 'Crypto', definition: "Strategie de mise a disposition de liquidite pour generer des rendements." },
  { term: 'NFT', category: 'Crypto', definition: "Non-Fungible Token. Actif numerique unique sur blockchain." },
  { term: 'FOMO', category: 'Trading', definition: "Fear Of Missing Out. Entree precipitee apres un mouvement deja realise." },
  { term: 'FUD', category: 'Crypto', definition: "Fear, Uncertainty, Doubt. Peur diffusee pour faire baisser un prix." },
  { term: 'HODL', category: 'Crypto', definition: "Strategie long terme, derive de hold. 'Hold On for Dear Life'." },
  { term: 'Pump & Dump', category: 'Crypto', definition: "Manipulation : gonflement artificiel puis vente massive. Illegal sur les actions." },
  { term: 'Rug Pull', category: 'Crypto', definition: "Equipe d'un projet retire la liquidite et disparait." },
  { term: 'CEX / DEX', category: 'Crypto', definition: "Exchange centralise (Binance) vs decentralise (Uniswap)." },
  { term: 'KYC', category: 'Crypto', definition: "Know Your Customer. Procedure d'identification obligatoire chez les CEX." },
  { term: 'Spread', category: 'Trading', definition: "Difference entre bid et ask. C'est le cout cache de chaque transaction." },
  { term: 'Inflation', category: 'Macro', definition: "Hausse generale et continue des prix. Erode le pouvoir d'achat." },
  { term: 'Taux directeur', category: 'Macro', definition: "Taux fixe par la banque centrale (Fed, BCE). Influence l'ensemble des marches." },
  { term: 'PER', category: 'Trading', definition: "Price Earning Ratio. Capitalisation / benefice net. Permet de comparer la valorisation." },
];

const CATEGORIES = ['Tous', 'Trading', 'Crypto', 'Macro', 'Risk'];

export default function Glossary() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tous');

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return TERMS.filter(
      (t) =>
        (cat === 'Tous' || t.category === cat) &&
        (!term ||
          t.term.toLowerCase().includes(term) ||
          t.definition.toLowerCase().includes(term))
    ).sort((a, b) => a.term.localeCompare(b.term));
  }, [q, cat]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <BookOpenCheck size={22} className="text-accent" /> Glossaire
          </h1>
          <p className="text-text-muted text-sm">
            {TERMS.length} termes essentiels en trading, crypto, macro et risque.
          </p>
        </div>
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            className="input pl-9"
            placeholder="Rechercher un terme…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={
              'px-3 py-1.5 rounded-lg text-sm border ' +
              (cat === c
                ? 'bg-accent text-bg border-accent'
                : 'border-bg-border text-text-muted hover:text-text hover:border-accent/40')
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((t) => (
          <div key={t.term} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-extrabold tracking-tight">{t.term}</div>
              <span className="text-[10px] uppercase tracking-wider text-text-dim border border-bg-border rounded px-1.5 py-0.5">
                {t.category}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-1">{t.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
