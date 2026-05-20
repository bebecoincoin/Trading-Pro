import { Bell, LogOut, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/store/auth';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';

export default function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="h-14 border-b border-bg-border glass flex items-center px-5 gap-4 drag">
      <div className="relative no-drag flex-1 max-w-[480px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          className="input pl-9 py-2 text-sm"
          placeholder="Recherche d'un actif, ticker, sujet…"
        />
      </div>

      <div className="flex-1" />

      <div className="no-drag flex items-center gap-3">
        <button className="p-2 rounded-lg border border-bg-border hover:border-accent/40 text-text-muted hover:text-text transition">
          <Bell size={16} />
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-bg-border">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold leading-tight">{user.username}</div>
              <div className="text-[11px] text-text-dim flex items-center justify-end gap-1">
                {user.verified ? (
                  <>
                    <ShieldCheck size={11} className="text-accent-green" /> verifie
                  </>
                ) : (
                  <span className="text-accent-gold">non verifie</span>
                )}
              </div>
            </div>
            <Avatar
              src={user.avatarUrl}
              name={user.username}
              size={36}
              onClick={() => nav('/app/settings')}
              title="Profil"
            />
            <button
              onClick={async () => {
                await logout();
                nav('/login');
              }}
              className="p-2 rounded-lg border border-bg-border hover:border-accent-red/40 text-text-muted hover:text-accent-red transition"
              title="Se deconnecter"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
