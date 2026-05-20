import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/store/auth';
import { usePrefs, THEMES, type Theme, type Lang } from '@/lib/store/prefs';
import { Save, Settings as SettingsIcon, ShieldCheck, Upload, Trash2, Camera, Palette, Globe, Check } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export default function Settings() {
  const { t } = useTranslation();
  const { user, token, refresh, logout, updateAvatar } = useAuth();
  const { theme, lang, setTheme, setLang } = usePrefs();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [version, setVersion] = useState<string>('');
  const [msg, setMsg] = useState<string | null>(null);
  const [pickingAvatar, setPickingAvatar] = useState(false);

  useEffect(() => {
    window.tradingPro.app.version().then(setVersion);
  }, []);

  useEffect(() => {
    setUsername(user?.username || '');
    setBio(user?.bio || '');
  }, [user?.username, user?.bio]);

  if (!user || !token) return null;

  const save = async () => {
    const r = await window.tradingPro.auth.updateProfile(token, { username, bio });
    if (r?.ok) {
      await refresh();
      setMsg('Profil mis a jour.');
      setTimeout(() => setMsg(null), 2500);
    } else {
      setMsg(r?.error || 'Erreur');
    }
  };

  const pickAvatar = async () => {
    setPickingAvatar(true);
    try {
      const r = await window.tradingPro.system.pickAvatar();
      if (r.ok) {
        // Resize a 256x256 cote renderer pour limiter la taille en DB et sur Supabase
        const small = await resizeDataUrl(r.dataUrl, 256);
        await updateAvatar(small);
        setMsg('Avatar mis a jour.');
        setTimeout(() => setMsg(null), 2500);
      } else if (!r.canceled && r.error) {
        setMsg(r.error);
        setTimeout(() => setMsg(null), 4000);
      }
    } finally {
      setPickingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    await updateAvatar(null);
    setMsg('Avatar supprime.');
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <SettingsIcon size={22} className="text-accent" /> {t('settings.title')}
        </h1>
        <p className="text-text-muted text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="card p-6">
        <div className="text-sm font-bold mb-4 flex items-center gap-2">
          <Palette size={16} className="text-accent" /> {t('settings.appearance')}
        </div>

        <div className="mb-5">
          <label className="label">{t('settings.theme')}</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => setTheme(th.id as Theme)}
                className={
                  'group relative rounded-xl overflow-hidden border-2 transition ' +
                  (theme === th.id ? 'border-accent shadow-glow' : 'border-bg-border hover:border-accent/40')
                }
              >
                <div className="h-16 w-full" style={{ background: th.preview }} />
                <div className="px-3 py-2 bg-bg-card flex items-center justify-between">
                  <span className="text-xs font-semibold">{th.label}</span>
                  {theme === th.id && <Check size={12} className="text-accent" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><Globe size={12} /> {t('settings.language')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setLang('fr')}
              className={
                'btn-soft text-sm ' + (lang === 'fr' ? '!border-accent !text-accent' : '')
              }
            >
              Francais
            </button>
            <button
              onClick={() => setLang('en')}
              className={
                'btn-soft text-sm ' + (lang === 'en' ? '!border-accent !text-accent' : '')
              }
            >
              English
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-sm font-bold mb-4">Profil public</div>
        <div className="flex items-center gap-5 mb-5">
          <div className="relative">
            <Avatar
              src={user.avatarUrl}
              name={user.username}
              size={88}
              onClick={pickAvatar}
              title="Cliquer pour changer l'avatar"
            />
            <button
              onClick={pickAvatar}
              disabled={pickingAvatar}
              className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full p-2 shadow"
              title="Choisir un avatar"
            >
              <Camera size={14} />
            </button>
          </div>
          <div className="flex-1">
            <div className="text-text-muted text-xs">{user.email}</div>
            <div className="text-sm mt-1">
              {user.verified ? (
                <span className="badge-green">
                  <ShieldCheck size={11} /> Verifie
                </span>
              ) : (
                <span className="badge-gold">Non verifie</span>
              )}
              <span className="ml-2 badge-violet">{user.provider}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={pickAvatar} disabled={pickingAvatar} className="btn-soft text-xs">
                <Upload size={12} /> {pickingAvatar ? 'Chargement...' : 'Choisir une image'}
              </button>
              {user.avatarUrl && (
                <button onClick={removeAvatar} className="btn-soft text-xs text-accent-red border-accent-red/30 hover:bg-accent-red/10">
                  <Trash2 size={12} /> Retirer
                </button>
              )}
            </div>
            <p className="text-xs text-text-muted mt-2">
              PNG/JPG/WebP/GIF, max 5 MB. Sera redimensionne automatiquement.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Pseudo</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Bio</label>
            <input
              className="input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Day trader crypto, swing trader..."
              maxLength={140}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={save} className="btn-primary">
            <Save size={14} /> Enregistrer
          </button>
          {msg && <span className="text-sm text-accent-green">{msg}</span>}
        </div>
      </div>

      <div className="card p-6">
        <div className="text-sm font-bold mb-4">Application</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-text-muted text-xs">Version</div>
            <div className="font-mono">{version || '—'}</div>
          </div>
          <div>
            <div className="text-text-muted text-xs">Mode</div>
            <div className="font-mono">Paper trading (local SQLite)</div>
          </div>
        </div>
      </div>

      <div className="card p-6 border-accent-red/30">
        <div className="text-sm font-bold mb-2 text-accent-red">Zone sensible</div>
        <p className="text-text-muted text-sm mb-3">
          Se deconnecter de l'appareil. Tes donnees restent stockees localement et seront
          accessibles a ta prochaine connexion.
        </p>
        <button
          onClick={async () => {
            await logout();
            window.location.hash = '#/login';
          }}
          className="btn-soft text-accent-red border-accent-red/30 hover:bg-accent-red/10"
        >
          Se deconnecter
        </button>
      </div>
    </div>
  );
}

async function resizeDataUrl(dataUrl: string, max: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * ratio));
      const h = Math.max(1, Math.round(img.height * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
