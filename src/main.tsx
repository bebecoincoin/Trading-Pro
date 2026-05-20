import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import './lib/i18n';
import { usePrefs } from './lib/store/prefs';

// Hydrate les preferences (theme + langue) avant le premier render
usePrefs.getState().hydrate();

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
