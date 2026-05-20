import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoUrl from '@/assets/logo.png';
import {
  LayoutDashboard,
  CandlestickChart,
  GraduationCap,
  Newspaper,
  Trophy,
  Boxes,
  Settings,
  Sparkles,
  Building2,
  BookOpenCheck,
  Zap,
  MessageSquare,
  Users,
  MessagesSquare,
  Scale,
  Heart,
} from 'lucide-react';
import clsx from 'clsx';

interface Item {
  to?: string;
  labelKey?: string;
  icon?: any;
  end?: boolean;
  highlight?: boolean;
  divider?: boolean;
}

const items: Item[] = [
  { to: '/app', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/markets', labelKey: 'nav.markets', icon: CandlestickChart },
  { to: '/app/simulator', labelKey: 'nav.simulator', icon: Zap, highlight: true },
  { to: '/app/traders', labelKey: 'nav.traders', icon: Trophy },
  { to: '/app/forecasts', labelKey: 'nav.forecasts', icon: Sparkles },
  { to: '/app/news', labelKey: 'nav.news', icon: Newspaper },
  { divider: true },
  { to: '/app/forum', labelKey: 'nav.forum', icon: MessageSquare },
  { to: '/app/community', labelKey: 'nav.community', icon: Users },
  { to: '/app/messages', labelKey: 'nav.messages', icon: MessagesSquare },
  { divider: true },
  { to: '/app/learn', labelKey: 'nav.learn', icon: GraduationCap },
  { to: '/app/brokers', labelKey: 'nav.brokers', icon: Building2 },
  { to: '/app/blockchain', labelKey: 'nav.blockchain', icon: Boxes },
  { to: '/app/glossary', labelKey: 'nav.glossary', icon: BookOpenCheck },
  { divider: true },
  { to: '/app/rules', labelKey: 'nav.rules', icon: Scale },
  { to: '/app/creator', labelKey: 'nav.creator', icon: Heart },
  { to: '/app/settings', labelKey: 'nav.settings', icon: Settings },
];

export default function Sidebar() {
  const { t } = useTranslation();
  return (
    <aside className="w-[240px] shrink-0 h-full border-r border-bg-border bg-bg-soft/80 glass flex flex-col">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <img
            src={logoUrl}
            alt="Trading Pro"
            className="w-10 h-10 rounded-xl shadow-md ring-1 ring-bg-border"
            draggable={false}
          />
          <div>
            <div className="font-extrabold tracking-tight text-text leading-none">
              Trading <span className="gradient-text">Pro</span>
            </div>
            <div className="text-[10px] uppercase text-text-dim tracking-[0.18em]">
              Markets · Edu · Social
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
        {items.map((it, i) => {
          if (it.divider) return <div key={i} className="my-2 h-px bg-bg-border" />;
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to!}
              end={it.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition',
                  it.highlight && !isActive &&
                    'bg-gradient-to-r from-accent-gold/10 to-accent-violet/10 text-accent-gold border border-accent-gold/20',
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : !it.highlight &&
                        'text-text-muted hover:text-text hover:bg-bg-card border border-transparent'
                )
              }
            >
              <Icon size={16} />
              <span>{t(it.labelKey!)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-bg-border text-[11px] text-text-dim">
        <div className="flex items-center justify-between">
          <span>Trading Pro v1.0</span>
          <span className="badge-violet">PAPER</span>
        </div>
      </div>
    </aside>
  );
}
