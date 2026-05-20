import { useTranslation } from 'react-i18next';
import { AlertTriangle, MessageSquare, Lock, Scale, Heart } from 'lucide-react';

export default function Rules() {
  const { t } = useTranslation();
  const forumRules = t('rules.forumRules', { returnObjects: true }) as string[];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Scale size={26} className="text-accent" /> {t('rules.title')}
        </h1>
        <p className="text-text-muted mt-1">
          Charte d'utilisation, vie privee et avertissements legaux.
        </p>
      </div>

      <div className="card p-6 border-accent-gold/30 bg-accent-gold/5">
        <div className="flex items-start gap-4">
          <AlertTriangle size={28} className="text-accent-gold shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-lg mb-1">{t('rules.disclaimer')}</h2>
            <p className="text-text-muted text-sm leading-relaxed">{t('rules.disclaimerText')}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-text/90">
              <li>• Aucune donnee affichee dans l'application n'est garantie temps reel ni infaillible.</li>
              <li>• Trading Pro ne fournit AUCUN conseil financier, juridique ou fiscal.</li>
              <li>• Le simulateur utilise un capital VIRTUEL. Les gains/pertes simulees n'ont aucune valeur reelle.</li>
              <li>• Avant tout investissement reel, consulte un conseiller financier diplome.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare size={22} className="text-accent" />
          <h2 className="font-bold text-lg">{t('rules.forum')}</h2>
        </div>
        <p className="text-text-muted text-sm mb-4">
          Le forum et les messages prives sont un espace de discussion. Pour qu'il reste agreable :
        </p>
        <ul className="space-y-2">
          {forumRules.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-accent/15 text-accent grid place-items-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-text/95">{r}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-text-dim mt-4">
          Tout contenu enfreignant ces regles peut etre supprime sans preavis. Les comportements
          repetes peuvent entrainer un blocage.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Lock size={22} className="text-accent-green" />
          <h2 className="font-bold text-lg">{t('rules.privacy')}</h2>
        </div>
        <p className="text-text-muted text-sm leading-relaxed">{t('rules.privacyText')}</p>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <div className="bg-bg-soft border border-bg-border rounded-lg p-4">
            <div className="text-sm font-bold text-accent-green mb-1">Stocke localement</div>
            <ul className="text-xs text-text-muted space-y-1">
              <li>• Mot de passe (hash bcrypt)</li>
              <li>• Token de session JWT</li>
              <li>• Portefeuille virtuel (simulateur)</li>
              <li>• Historique de trades</li>
              <li>• Cles API et secrets</li>
            </ul>
          </div>
          <div className="bg-bg-soft border border-bg-border rounded-lg p-4">
            <div className="text-sm font-bold text-accent mb-1">Synchronise vers Supabase</div>
            <ul className="text-xs text-text-muted space-y-1">
              <li>• Pseudo public + avatar + bio</li>
              <li>• Threads et reponses du forum</li>
              <li>• Messages prives (chiffres en transit)</li>
              <li>• ID public UUID (pas d'email)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-6 text-center">
        <Heart size={20} className="text-accent-red fill-accent-red mx-auto mb-2" />
        <p className="text-sm text-text-muted">
          Trading Pro est <span className="text-text font-semibold">100% open source</span> et gratuit.
          <br />
          Aucune publicite, aucune revente de donnees, aucun frais cache.
        </p>
      </div>
    </div>
  );
}
