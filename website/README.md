# Site vitrine Trading Pro

Site statique : presentation, captures, telechargements **directs** depuis GitHub Releases (AppImage + ZIP Windows).

Depot : [bebecoincoin/Trading-Pro](https://github.com/bebecoincoin/Trading-Pro)

## Lancer en local

```bash
./scripts/prepare-website.sh   # copie AppImage + ZIP dans website/downloads/
./scripts/serve-website.sh     # http://localhost:8080
```

## Telechargements

Les boutons pointent vers `config.js` :

```javascript
window.TP_RELEASE.assets.appimage   // .AppImage
window.TP_RELEASE.assets.windowsZip // .zip Windows
```

Mettre a jour `version` et les URLs a chaque nouvelle release.

## Structure

```
website/
  index.html       # Page (icones SVG, pas d'emojis)
  style.css
  config.js        # URLs GitHub Releases
  assets/          # logo.png, screenshots, athena.gif
  downloads/       # Binaires locaux (gitignore)
```

## Installation affichee sur le site

- **Methode 1** : `wget` + `chmod +x` + lancer l'AppImage
- **Methode 2** : `install-linux.sh` (menu Activites, sans garder l'AppImage dans Downloads)
- **Methode 3** : clone + `npm run dev`
- **Windows** : extraire le ZIP, lancer `Trading Pro.exe`

## GitHub Pages

Workflow `.github/workflows/pages.yml` — deploie `website/` sans `downloads/*.AppImage` ni `*.zip` (voir `website/.gitignore`).

Les binaires restent sur **GitHub Releases** uniquement.
