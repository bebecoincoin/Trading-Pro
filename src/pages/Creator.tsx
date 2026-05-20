import { useTranslation } from 'react-i18next';
import { Code, Palette, Sparkles, Github, Twitter, Heart, Zap, Globe, Lock } from 'lucide-react';
import athenaGif from '@/assets/athena.gif';
import logoUrl from '@/assets/logo.png';

export default function Creator() {
  const { t } = useTranslation();

  const stack = [
    { name: 'Electron', desc: 'Desktop runtime' },
    { name: 'React + TypeScript', desc: 'UI' },
    { name: 'Tailwind CSS', desc: 'Design system' },
    { name: 'Vite', desc: 'Bundler' },
    { name: 'better-sqlite3', desc: 'Local storage' },
    { name: 'Supabase', desc: 'Forum + DMs' },
    { name: 'lightweight-charts', desc: 'TradingView grade graphs' },
    { name: 'i18next', desc: 'Multi-langue' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Sparkles size={26} className="text-accent" />
          {t('creator.title')}
        </h1>
        <p className="text-text-muted mt-1">{t('creator.subtitle')}</p>
      </div>

      <div className="card p-8 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              'radial-gradient(600px 300px at 80% -20%, var(--accent), transparent 60%), radial-gradient(500px 280px at 0% 100%, var(--accent-violet), transparent 60%)',
          }}
        />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-accent via-accent-violet to-accent-gold animate-pulse opacity-60 blur-md" />
            <img
              src={athenaGif}
              alt="Athena"
              className="relative w-40 h-40 rounded-full object-cover ring-4 ring-bg-border shadow-xl"
              draggable={false}
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="text-text-muted text-sm">{t('creator.by')}</div>
            <h2 className="text-4xl font-black tracking-tight mt-1 gradient-text">Athena</h2>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-soft border border-bg-border text-sm">
              <Code size={14} className="text-accent" /> {t('creator.role')}
            </div>
            <p className="text-text-muted text-sm mt-4 max-w-md leading-relaxed">
              {t('creator.missionText')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <FeatureCard icon={Zap} title={t('creator.mission')} color="text-accent-gold">
          {t('creator.missionText')}
        </FeatureCard>
        <FeatureCard icon={Lock} title="Privacy first" color="text-accent-green">
          Donnees sensibles 100% locales. Pas de tracking, pas de pub.
        </FeatureCard>
        <FeatureCard icon={Globe} title="Open source" color="text-accent-violet">
          Code source disponible sur GitHub. Forke, contribue, apprends.
        </FeatureCard>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={18} className="text-accent" />
          <h3 className="font-bold">{t('creator.stack')}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stack.map((s) => (
            <div key={s.name} className="bg-bg-soft border border-bg-border rounded-lg p-3">
              <div className="font-semibold text-sm">{s.name}</div>
              <div className="text-xs text-text-dim mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <img src={logoUrl} className="w-7 h-7 rounded-md" alt="" />
          <h3 className="font-bold">{t('creator.follow')}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExtLink href="https://github.com/" icon={Github} label="GitHub" />
          <ExtLink href="https://twitter.com/" icon={Twitter} label="Twitter / X" />
        </div>
        <p className="text-xs text-text-dim mt-4 flex items-center gap-1.5">
          Made with <Heart size={11} className="text-accent-red fill-accent-red" /> & beaucoup de cafe.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: any;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <Icon size={22} className={color + ' mb-2'} />
      <div className="font-bold mb-1">{title}</div>
      <p className="text-sm text-text-muted leading-relaxed">{children}</p>
    </div>
  );
}

function ExtLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <button
      onClick={() => window.tradingPro.app.openExternal(href)}
      className="btn-soft text-sm"
    >
      <Icon size={14} /> {label}
    </button>
  );
}
