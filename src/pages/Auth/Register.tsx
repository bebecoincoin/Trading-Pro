import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/store/auth';
import { AuthShell } from './Login';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', cgu: false });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.cgu) {
      setErr('Tu dois accepter les conditions.');
      return;
    }
    setBusy(true);
    const r = await window.tradingPro.auth.register({
      username: form.username,
      email: form.email,
      password: form.password,
    });
    setBusy(false);
    if (!r?.ok) {
      setErr(r?.error || 'Echec de la creation du compte.');
      return;
    }
    setSession(r.token, r.user);
    nav('/verify?email=' + encodeURIComponent(form.email));
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
    <AuthShell title="Creer un compte" subtitle="Commence en moins de 30 secondes.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Pseudo</label>
          <input
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            placeholder="trader42"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="vous@exemple.com"
          />
        </div>
        <div>
          <label className="label">Mot de passe (min. 8)</label>
          <input
            className="input"
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            placeholder="••••••••"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={form.cgu}
            onChange={(e) => setForm({ ...form, cgu: e.target.checked })}
            className="mt-0.5"
          />
          <span>
            J'accepte que Trading Pro est une app de paper trading et ne constitue pas un
            conseil financier.
          </span>
        </label>
        {err && (
          <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/30 rounded-lg p-2.5">
            {err}
          </div>
        )}
        <button disabled={busy} className="btn-primary w-full py-3">
          {busy && <Loader2 className="animate-spin" size={16} />} Creer mon compte
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-bg-border" />
        <span className="text-xs text-text-dim">OU</span>
        <div className="flex-1 h-px bg-bg-border" />
      </div>

      <button onClick={google} disabled={busy} className="btn-soft w-full py-3 gap-3">
        Continuer avec Google
      </button>

      <div className="mt-6 text-sm text-text-muted text-center">
        Deja un compte ?{' '}
        <Link to="/login" className="text-accent hover:underline">
          Se connecter
        </Link>
      </div>
    </AuthShell>
  );
}
