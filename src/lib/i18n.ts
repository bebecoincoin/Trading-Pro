import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr';
import en from './locales/en';

const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('tp_lang')) || 'fr';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: stored,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export default i18n;
