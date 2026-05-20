import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpenCheck, Shield, Sparkles, Trophy } from 'lucide-react';
import logoUrl from '@/assets/logo.png';

export default function Landing() {
  return (
    <div className="min-h-full bg-app">
      <header className="flex items-center justify-between px-8 py-5 border-b border-bg-border drag">
        <div className="flex items-center gap-2.5 no-drag">
          <img src={logoUrl} alt="Trading Pro" className="w-10 h-10 rounded-xl shadow-md ring-1 ring-bg-border" draggable={false} />
          <div className="font-extrabold tracking-tight">
            Trading <span className="gradient-text">Pro</span>
          </div>
        </div>
        <nav className="flex items-center gap-2 no-drag">
          <Link to="/login" className="btn-ghost">
            Connexion
          </Link>
          <Link to="/register" className="btn-primary">
            Creer un compte <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      <section className="px-8 pt-20 pb-24 max-w-6xl mx-auto text-center">
        <span className="badge-violet">Beta · Paper trading · Education</span>
        <h1 className="mt-6 text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
          Maitrise les <span className="gradient-text">marches</span>,<br />
          forme-toi, anticipe.
        </h1>
        <p className="mt-6 text-lg text-text-muted max-w-2xl mx-auto">
          Trading Pro reunit suivi de marche temps reel, cours structures, suivi des pro
          traders, previsions statistiques et portefeuille virtuel — dans une application desktop
          rapide, soignee et 100% locale.
        </p>
        <div className="mt-8 flex items-center gap-3 justify-center">
          <Link to="/register" className="btn-primary px-5 py-3">
            Commencer gratuitement <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-ghost px-5 py-3">
            J'ai deja un compte
          </Link>
        </div>
      </section>

      <section className="px-8 pb-20 max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
        {[
          {
            icon: BarChart3,
            title: 'Donnees temps reel',
            body:
              'CoinGecko, Binance, Yahoo Finance, CryptoCompare. Bougies, watchlists, indicateurs.',
          },
          {
            icon: BookOpenCheck,
            title: 'Cours & glossaire',
            body:
              "De l'analyse technique aux smart contracts, des bases jusqu'aux concepts pro.",
          },
          {
            icon: Trophy,
            title: 'Pro Traders',
            body:
              "Suivi de portefeuilles publics (whales on-chain, 13F, traders connus) avec metriques.",
          },
          {
            icon: Sparkles,
            title: 'Previsions statistiques',
            body: 'Regression + volatilite + RSI : projections pedagogiques, pas un signal financier.',
          },
          {
            icon: Shield,
            title: '100% local',
            body:
              'SQLite local, JWT, OAuth Google optionnel, mots de passe hashes bcrypt.',
          },
          {
            icon: BarChart3,
            title: 'Multi-actifs',
            body:
              'Crypto, actions US, ETF. Portefeuille virtuel pour pratiquer sans risque.',
          },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <f.icon className="text-accent mb-3" size={22} />
            <div className="font-bold mb-1">{f.title}</div>
            <div className="text-sm text-text-muted">{f.body}</div>
          </div>
        ))}
      </section>

      <footer className="px-8 py-6 border-t border-bg-border text-center text-xs text-text-dim">
        Trading Pro · ceci n'est PAS un conseil financier. Toute decision d'investissement est sous votre seule responsabilite.
      </footer>
    </div>
  );
}
