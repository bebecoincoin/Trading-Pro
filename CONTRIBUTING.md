# Contribuer a Trading Pro

Merci de ton interet ! Toute contribution est la bienvenue.

## Demarrage rapide

```bash
git clone https://github.com/<user>/trading-pro.git
cd trading-pro
npm install
npm run dev
```

## Structure du projet

```
electron/        # Processus principal Electron (Node.js)
  services/      # IPC handlers : auth, markets, paperTrading, system...
src/             # Renderer React + TypeScript
  components/    # Composants reutilisables
  pages/         # Pages routees
  lib/           # Utilitaires, store Zustand, i18n
  styles/        # CSS / Tailwind
docs/            # Documentation
supabase/        # Schema SQL pour le forum
scripts/         # Scripts utilitaires (build, install)
```

## Workflow

1. Fork du repo
2. `git checkout -b feat/ma-feature` (ou `fix/bug-xyz`)
3. Code + tests si applicable
4. `npm run build` pour verifier que tout compile
5. Commit avec un message clair (`feat:`, `fix:`, `docs:`, etc.)
6. Push et ouvre une PR

## Conventions de code

- TypeScript strict
- Indentation 2 espaces
- Pas de commentaires inutiles (le code doit etre auto-explicatif)
- Noms de variables/fonctions en anglais
- Textes UI en francais ET anglais (via i18n) dans `src/lib/locales/`

## Ajouter une langue

1. Cree `src/lib/locales/<code>.ts` en copiant `fr.ts`
2. Traduis les valeurs
3. Importe-le dans `src/lib/i18n.ts`
4. Ajoute le bouton de selection dans `src/pages/Settings.tsx`

## Ajouter un theme

1. Ajoute une entree dans le tableau `THEMES` de `src/lib/store/prefs.ts`
2. Cree la classe `.theme-<id>` dans `src/styles/index.css` avec toutes les
   variables CSS (`--bg`, `--accent`, etc.)

## Tests manuels avant PR

- [ ] L'app build sans erreur (`npm run build`)
- [ ] Le mode dev se lance (`npm run dev`)
- [ ] Les 5 themes fonctionnent
- [ ] Les 2 langues fonctionnent
- [ ] Pas de console.error visible
- [ ] L'AppImage Linux se package (`npx electron-builder --linux AppImage`)

## Questions ?

Ouvre une issue avec le label `question`.
