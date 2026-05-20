import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthShell } from './Login';
import { useAuth } from '@/lib/store/auth';
import { Loader2, MailCheck } from 'lucide-react';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    setMsg(`Un code de verification a 6 chiffres a ete envoye a ${email}.`);
  }, [email]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    const r = await window.tradingPro.auth.verifyEmail(code);
    setBusy(false);
    if (!r?.ok) {
      setErr(r?.error || 'Code invalide.');
      return;
    }
    await refresh();
    nav('/app');
  };

  const resend = async () => {
    setErr(null);
    setMsg(null);
    setBusy(true);
    const r = await window.tradingPro.auth.resendVerification(email);
    setBusy(false);
    if (!r?.ok) setErr(r?.error || 'Erreur lors du renvoi.');
    else setMsg('Un nouveau code a ete envoye.');
  };

  return (
    <AuthShell
      title="Verifie ton email"
      subtitle={`Saisis le code recu ${email ? `a ${email}` : ''}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Code de verification</label>
          <input
            className="input text-center tracking-[0.5em] font-mono text-xl"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="000000"
            required
          />
        </div>
        {msg && (
          <div className="text-sm text-accent-green bg-accent-green/10 border border-accent-green/30 rounded-lg p-2.5 flex items-start gap-2">
            <MailCheck size={16} className="mt-0.5" /> {msg}
          </div>
        )}
        {err && (
          <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/30 rounded-lg p-2.5">
            {err}
          </div>
        )}
        <button disabled={busy || code.length !== 6} className="btn-primary w-full py-3">
          {busy && <Loader2 className="animate-spin" size={16} />} Verifier
        </button>
      </form>
      <button
        onClick={resend}
        disabled={busy || !email}
        className="mt-4 text-sm text-text-muted hover:text-accent transition"
      >
        Renvoyer le code
      </button>

      <div className="mt-6 text-xs text-text-dim leading-relaxed">
        Tu peux temporairement passer cette etape et continuer dans l'app — certaines
        fonctionnalites resteront limitees. Pour les tests locaux sans SMTP, le code s'affiche
        dans la console du processus principal d'Electron.
      </div>
      <button
        onClick={() => nav('/app')}
        className="mt-2 text-sm text-accent hover:underline"
      >
        Continuer plus tard →
      </button>
    </AuthShell>
  );
}
