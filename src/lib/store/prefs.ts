import { create } from 'zustand';

export type Theme = 'dark' | 'light' | 'aurora' | 'sunset' | 'midnight';
export type Lang = 'fr' | 'en';

interface PrefsState {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  hydrate: () => void;
}

const THEME_KEY = 'tp_theme';
const LANG_KEY = 'tp_lang';

export const THEMES: { id: Theme; label: string; preview: string }[] = [
  { id: 'dark', label: 'Dark', preview: 'linear-gradient(135deg, #0a0d14, #1a1f2e)' },
  { id: 'midnight', label: 'Midnight', preview: 'linear-gradient(135deg, #050918, #1e2761)' },
  { id: 'aurora', label: 'Aurora', preview: 'linear-gradient(135deg, #0a1929, #003d2e, #1a4b5c)' },
  { id: 'sunset', label: 'Sunset', preview: 'linear-gradient(135deg, #1a0a1f, #6b1f3a, #ff6b35)' },
  { id: 'light', label: 'Light', preview: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' },
];

export function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light', 'theme-aurora', 'theme-sunset', 'theme-midnight');
  root.classList.add('theme-' + t);
  root.setAttribute('data-theme', t);
}

export const usePrefs = create<PrefsState>((set) => ({
  theme: 'dark',
  lang: 'fr',
  setTheme: (t) => {
    localStorage.setItem(THEME_KEY, t);
    applyTheme(t);
    set({ theme: t });
  },
  setLang: (l) => {
    localStorage.setItem(LANG_KEY, l);
    set({ lang: l });
    import('../i18n').then(({ default: i18n }) => i18n.changeLanguage(l));
  },
  hydrate: () => {
    const t = (localStorage.getItem(THEME_KEY) as Theme) || 'dark';
    const l = (localStorage.getItem(LANG_KEY) as Lang) || 'fr';
    applyTheme(t);
    set({ theme: t, lang: l });
  },
}));
