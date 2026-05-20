import type { LucideIcon } from 'lucide-react';
import { Target, LineChart, Bitcoin, Brain } from 'lucide-react';

export interface Lesson {
  id: string;
  title: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  durationMin: number;
  summary: string;
  body: string; // markdown-like text rendered as plain paragraphs
  keyPoints: string[];
}

export interface Course {
  id: string;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  description: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  lessons: Lesson[];
}

export const COURSES: Course[] = [
  {
    id: 'bases',
    title: 'Les bases du trading',
    icon: Target,
    iconColor: 'text-accent-green',
    description: 'Vocabulaire, types de marches, fonctionnement des ordres.',
    level: 'debutant',
    lessons: [
      {
        id: 'qu-est-ce-que-trader',
        title: "Qu'est-ce que trader ?",
        level: 'debutant',
        durationMin: 8,
        summary: "Definition, difference investissement vs trading, horizons de temps.",
        body: `Le trading consiste a acheter et vendre des actifs financiers (actions, devises, matieres premieres, crypto) dans le but de degager un benefice sur la difference entre le prix d'achat et le prix de vente.\n\nA la difference de l'investissement long terme, le trading vise des horizons plus courts: scalping (secondes a minutes), day trading (intra-journee), swing trading (jours a semaines), position trading (semaines a mois).\n\nLes deux moteurs : l'analyse fondamentale (sante economique, bilans, news) et l'analyse technique (graphiques, volumes, indicateurs). Les deux se combinent dans une strategie robuste.`,
        keyPoints: [
          'Trading = court a moyen terme, Investissement = long terme.',
          "L'esperance de gain positive depend avant tout du money management.",
          "80% des traders particuliers perdent: la discipline > la prediction.",
        ],
      },
      {
        id: 'ordres',
        title: 'Les types d\'ordres',
        level: 'debutant',
        durationMin: 10,
        summary: 'Market, limit, stop, stop-limit, OCO. Quand utiliser lequel ?',
        body: `Comprendre les ordres est crucial : c'est l'outil de base de l'execution.\n\n- Market : execution immediate au meilleur prix disponible. Risque de slippage en periode volatile.\n- Limit (limite) : execute UNIQUEMENT a un prix specifie ou meilleur. Pas garanti d'etre rempli.\n- Stop loss : declenche une vente (ou achat) quand le prix franchit un seuil. Protege le capital.\n- Stop limit : combine stop + limit. Plus precis mais peut ne pas se declencher.\n- OCO (One-Cancels-Other) : deux ordres lies (ex: take profit + stop loss). Si l'un s'execute, l'autre s'annule.\n\nRegle d'or : toujours placer un stop loss AVANT d'entrer en position.`,
        keyPoints: [
          'Toujours definir le stop avant d\'entrer.',
          "Le market order paie le bid-ask spread + slippage.",
          "Le ratio risque/gain minimum recommande est 1:2.",
        ],
      },
      {
        id: 'money-management',
        title: 'Money management',
        level: 'debutant',
        durationMin: 12,
        summary: 'Position sizing, regle des 1-2%, drawdown, Kelly simplifie.',
        body: `Le money management est ce qui separe les traders rentables des autres. Sans gestion du risque, meme la meilleure strategie ruinera son utilisateur.\n\nRegle de base : ne JAMAIS risquer plus de 1 a 2% de son capital sur une seule operation. Exemple : compte de 10 000 €, risque max 200 € par trade.\n\nFormule du sizing : taille = (capital × risque%) / (prix_entree − stop_loss). Cela garantit qu'un trade perdant ne mettra jamais votre compte en danger.\n\nLe drawdown maximum acceptable selon votre profil est generalement de 10 a 25%. Au-dela, la psychologie devient toxique.\n\nKelly simplifie : f = W − (1−W)/R, ou W est le taux de reussite et R le ratio gain/perte. Utiliser une fraction de Kelly (1/2 ou 1/4) pour la prudence.`,
        keyPoints: [
          "1-2% max par trade.",
          "Position sizing = risque% × capital / (entry − stop).",
          'Drawdown emotionnel = drawdown technique × 2.',
        ],
      },
    ],
  },
  {
    id: 'ta',
    title: 'Analyse technique',
    icon: LineChart,
    iconColor: 'text-accent',
    description: 'Chandeliers, supports/resistances, indicateurs, structures.',
    level: 'intermediaire',
    lessons: [
      {
        id: 'chandeliers',
        title: 'Les chandeliers japonais',
        level: 'intermediaire',
        durationMin: 12,
        summary: 'Lecture OHLC, patterns essentiels (doji, marteau, englobante).',
        body: `Un chandelier represente quatre prix sur une periode : Open (ouverture), High (plus haut), Low (plus bas), Close (cloture). Corps plein = baissier, corps vide/vert = haussier.\n\nPatterns essentiels :\n- Doji : ouverture = cloture, indecision.\n- Marteau / pendu : long inferieur, signal de retournement potentiel.\n- Englobante haussiere / baissiere : un grand chandelier englobe le precedent oppose, signal de retournement fort.\n- Etoile du matin/soir : combinaison 3 bougies.\n\nLes patterns doivent etre lus DANS UN CONTEXTE (tendance, supports, volume). Isoles, ils n'ont pas de valeur predictive.`,
        keyPoints: [
          'Volume confirme le pattern.',
          "Toujours analyser le contexte de tendance.",
          "Plus la timeframe est elevee, plus le signal est fort.",
        ],
      },
      {
        id: 'sr',
        title: 'Supports & resistances',
        level: 'intermediaire',
        durationMin: 10,
        summary: 'Identification et trading des zones cles.',
        body: `Un support est un niveau de prix ou la demande absorbe la baisse. Une resistance, l'inverse en hausse.\n\nIdentification :\n- Plus haut / plus bas evidents sur le graphique.\n- Zones touchees plusieurs fois.\n- Niveaux psychologiques (10 000, 50 000…).\n- Anciens supports deviennent resistances (et inversement).\n\nStrategies :\n- Trader le rebond : achat pres du support, stop juste en dessous.\n- Trader la cassure : achat apres une cloture franche au-dessus de la resistance.\n- Faux signal (fakeout) : meche au-dessus puis retour, souvent annonce du sens oppose.`,
        keyPoints: [
          "Un niveau valide = au moins 2 touches.",
          "La cassure se confirme avec le volume.",
          "Les zones > les lignes parfaites.",
        ],
      },
      {
        id: 'indicateurs',
        title: 'Indicateurs incontournables',
        level: 'intermediaire',
        durationMin: 14,
        summary: 'Moyennes mobiles, RSI, MACD, Bollinger.',
        body: `- MM (moyennes mobiles) : SMA / EMA. EMA(20) suit la tendance court terme, EMA(200) la tendance long terme.\n- RSI (Relative Strength Index) : entre 0 et 100. >70 surachete, <30 survendu. Divergences = signal puissant.\n- MACD : difference EMA12-EMA26 + signal EMA9. Croisements = signaux.\n- Bollinger Bands : moyenne 20 + 2 ecarts-types. Compression = explosion de volatilite imminente.\n\nAttention : aucun indicateur n'est magique. Combinez 2-3 indicateurs avec confluence sur le prix.`,
        keyPoints: [
          'Ne jamais empiler 10 indicateurs.',
          'Le prix > les indicateurs (ils sont retardataires).',
          'Les divergences RSI valent souvent plus que la valeur absolue.',
        ],
      },
    ],
  },
  {
    id: 'crypto',
    title: 'Crypto & blockchain',
    icon: Bitcoin,
    iconColor: 'text-accent-gold',
    description: 'BTC, ETH, DeFi, layers, securite, wallets.',
    level: 'intermediaire',
    lessons: [
      {
        id: 'bitcoin',
        title: 'Bitcoin & proof of work',
        level: 'debutant',
        durationMin: 10,
        summary: "Pourquoi Bitcoin existe, comment fonctionne le minage.",
        body: `Bitcoin (2009, Satoshi Nakamoto) est le premier reseau monetaire decentralise. Son but : permettre des transferts de valeur sans tiers de confiance.\n\nClefs :\n- Proof of Work : les mineurs depensent de l'energie pour resoudre un puzzle cryptographique. Le gagnant valide un bloc et touche la recompense (BTC + frais).\n- Halving : tous les 210 000 blocs (~4 ans), la recompense est divisee par 2. Supply max = 21 000 000.\n- Securite : la chaine ne peut etre reecrite qu'en controlant > 50% de la puissance de calcul ("attaque 51%"), coute economiquement prohibitif.\n\nLe minage represente aussi le mecanisme d'emission monetaire : pas de banque centrale.`,
        keyPoints: [
          'Supply fixe (21M BTC).',
          "L'halving est un catalyseur historique de hausse.",
          "Self-custody = ne pas confier ses cles a un exchange.",
        ],
      },
      {
        id: 'ethereum',
        title: 'Ethereum & smart contracts',
        level: 'intermediaire',
        durationMin: 12,
        summary: 'Proof of stake, EVM, layer 2, contrats programmables.',
        body: `Ethereum (2015) est une plateforme de smart contracts : du code execute sur la blockchain qui automatise des accords financiers (prets, echanges, NFT…).\n\nDifferences cles avec Bitcoin :\n- Proof of Stake depuis 2022 (The Merge) : la securite est apportee par le capital ETH stakee, pas par l'energie.\n- EVM (Ethereum Virtual Machine) : execute le bytecode des contrats. Compatible sur des dizaines de chaines (Polygon, BSC, Arbitrum…).\n- Gas : chaque operation a un cout en ETH. Layer 2 (rollups) reduit ces couts de 10x a 100x.\n\nDeFi (Finance Decentralisee) repose sur ces contrats : Uniswap, Aave, Compound, MakerDAO.`,
        keyPoints: [
          'PoS = stake ETH pour valider.',
          "Layer 2 = scalabilite + frais reduits.",
          "Un smart contract est definitif une fois deploye.",
        ],
      },
      {
        id: 'wallets',
        title: 'Wallets & securite',
        level: 'debutant',
        durationMin: 10,
        summary: 'Hot wallets, hardware wallets, seed phrase, OPSEC.',
        body: `Trois categories :\n- Custodial (Binance, Coinbase) : l'exchange detient les cles. Pratique mais risque (faillite FTX, Mt.Gox).\n- Hot wallet : non-custodial logiciel (MetaMask, Phantom). Cles sur ta machine.\n- Hardware wallet : Ledger, Trezor, Tangem. Cles signees hors-ligne. Standard pro.\n\nSeed phrase :\n- 12 ou 24 mots = TOUT ton compte. Si quelqu'un l'a, il a TES fonds.\n- Ne jamais photographier, screenshoter, taper sur un PC connecte.\n- Stocker sur metal (Cryptosteel) > papier.\n\nOPSEC : pas de bragging, pas de montant public, separer adresses froides et chaudes.`,
        keyPoints: [
          'Not your keys, not your coins.',
          "La seed phrase est plus precieuse que tes BTC.",
          "Hardware wallet obligatoire au-dela de quelques milliers d'euros.",
        ],
      },
    ],
  },
  {
    id: 'psychologie',
    title: 'Psychologie du trader',
    icon: Brain,
    iconColor: 'text-accent-violet',
    description: 'Biais cognitifs, FOMO, journal de trading, regles ecrites.',
    level: 'avance',
    lessons: [
      {
        id: 'biais',
        title: 'Biais cognitifs en trading',
        level: 'avance',
        durationMin: 14,
        summary: 'Confirmation, ancrage, biais de recence, biais de survivance.',
        body: `Le marche est une machine a exploiter les biais. Les connaitre est un avantage.\n\n- Biais de confirmation : on cherche des infos qui valident notre these. Antidote : lister activement les arguments contraires AVANT d'entrer.\n- Biais d'ancrage : on s'accroche au premier prix vu (entree, ATH). Antidote : raisonner en % et non en valeur absolue.\n- Biais de recence : on extrapole les dernieres bougies. Antidote : zoomer sur une timeframe superieure.\n- Biais de survivance : on regarde uniquement les traders gagnants medias et on ignore les milliers qui ont fait faillite.\n- FOMO (Fear Of Missing Out) : entrer apres un pump. Antidote : strategie ecrite, conditions d'entree precises.`,
        keyPoints: [
          'Ecrire ses regles AVANT le marche ouvert.',
          'Tenir un journal de trading.',
          "Le pire ennemi du trader est lui-meme.",
        ],
      },
      {
        id: 'journal',
        title: 'Journal de trading',
        level: 'avance',
        durationMin: 10,
        summary: 'Format minimum, metriques cles, revue hebdomadaire.',
        body: `Sans journal, pas d'amelioration. Chaque trade doit etre documente :\n\n- Date, heure, actif, timeframe.\n- Raison d'entree (setup precis).\n- Stop, take profit, taille de position, risque en %.\n- Resultat (R-multiple : gain / risque initial).\n- Emotion ressentie pendant le trade.\n- Lecon (1 phrase).\n\nMetriques a calculer chaque semaine :\n- Win rate (%).\n- Average win / Average loss.\n- Expectancy = (win% × avg_win) − (loss% × avg_loss).\n- Max drawdown.\n- R-multiple moyen.\n\nL'objectif n'est pas un % de wins eleve, mais une expectancy positive.`,
        keyPoints: [
          'Documenter avant + apres le trade.',
          "Une expectancy positive bat un win rate eleve.",
          "Revoir 100% des trades chaque semaine.",
        ],
      },
    ],
  },
];
