import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/store/auth';
import { Loader2 } from 'lucide-react';
import logoUrl from '@/assets/logo.png';

export default function Login() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const r = await window.tradingPro.auth.login({ email, password });
    setBusy(false);
    if (!r?.ok) {
      setErr(r?.error || 'Echec de la connexion.');
      return;
    }
    setSession(r.token, r.user);
    nav('/app');
  };

  const google = async () => {
    setErr(null);
    setBusy(true);
    const r = await window.tradingPro.auth.googleSignIn();
    setBusy(false);
    if (!r?.ok) {
      setErr(r?.error || 'Echec OAuth Google.');
      return;
    }
    setSession(r.token, r.user);
    nav('/app');
  };

  return (
    <AuthShell title="Connexion" subtitle="Bon retour parmi nous.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
          />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {err && (
          <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/30 rounded-lg p-2.5">
            {err}
          </div>
        )}
        <button className="btn-primary w-full py-3" disabled={busy}>
          {busy && <Loader2 className="animate-spin" size={16} />} Se connecter
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-bg-border" />
        <span className="text-xs text-text-dim">OU</span>
        <div className="flex-1 h-px bg-bg-border" />
      </div>

      <button onClick={google} disabled={busy} className="btn-soft w-full py-3 gap-3">
        <GoogleIcon /> Continuer avec Google
      </button>

      <div className="mt-6 text-sm text-text-muted text-center">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-accent hover:underline">
          Inscris-toi
        </Link>
      </div>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-bg-soft via-bg to-bg drag">
        <div className="flex items-center gap-2.5 no-drag">
          <img src={logoUrl} alt="Trading Pro" className="w-11 h-11 rounded-xl shadow-md ring-1 ring-bg-border" draggable={false} />
          <div className="font-extrabold text-xl">
            Trading <span className="gradient-text">Pro</span>
          </div>
        </div>
        <div className="no-drag">
          <h2 className="text-3xl font-black tracking-tight max-w-md leading-tight">
            Une seule app pour les marches, l'apprentissage et la veille.
          </h2>
          <p className="text-text-muted max-w-md mt-3 text-sm">
            Crypto, actions, brokers, blockchain. Donnees temps reel via APIs gratuites,
            previsions statistiques et formation integree.
          </p>
        </div>
        <div className="no-drag text-text-dim text-xs">
          © Trading Pro — paper trading only.
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md card p-7">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-text-muted text-sm mt-1 mb-6">{subtitle}</p>}
          <div className={subtitle ? '' : 'mt-6'}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.799 32.91 29.272 36 24 36 16.82 36 11 30.18 11 23s5.82-13 13-13c3.314 0 6.337 1.246 8.638 3.293l5.657-5.657C33.677 4.082 29.083 2 24 2 11.85 2 2 11.85 2 24s9.85 22 22 22 22-9.85 22-22c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.314 0 6.337 1.246 8.638 3.293l5.657-5.657C33.677 4.082 29.083 2 24 2 16.318 2 9.656 6.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 46c5.166 0 9.86-1.977 13.41-5.197l-6.19-5.238C29.197 36.989 26.715 38 24 38c-5.252 0-9.769-3.077-11.293-7.946l-6.522 5.025C9.5 41.556 16.227 46 24 46z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.002-.001.003-.001.005-.002l6.19 5.238C36.97 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
