import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // --- App ---
  app: {
    version: () => ipcRenderer.invoke('app:version') as Promise<string>,
    openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
    supabaseConfig: () =>
      ipcRenderer.invoke('app:supabase-config') as Promise<{ url: string; anonKey: string }>,
  },

  // --- Systeme (fichiers) ---
  system: {
    pickAvatar: () =>
      ipcRenderer.invoke('system:pick-avatar') as Promise<
        { ok: true; dataUrl: string; fileName: string } | { ok: false; canceled?: boolean; error?: string }
      >,
  },

  // --- Auth ---
  auth: {
    register: (data: { email: string; password: string; username: string }) =>
      ipcRenderer.invoke('auth:register', data),
    login: (data: { email: string; password: string }) =>
      ipcRenderer.invoke('auth:login', data),
    verifyEmail: (token: string) => ipcRenderer.invoke('auth:verify-email', token),
    resendVerification: (email: string) =>
      ipcRenderer.invoke('auth:resend-verification', email),
    googleSignIn: () => ipcRenderer.invoke('auth:google-signin'),
    me: (token: string) => ipcRenderer.invoke('auth:me', token),
    logout: (token: string) => ipcRenderer.invoke('auth:logout', token),
    updateProfile: (token: string, data: any) =>
      ipcRenderer.invoke('auth:update-profile', { token, data }),
  },

  // --- Marche ---
  markets: {
    cryptoTop: (limit?: number) => ipcRenderer.invoke('markets:crypto-top', limit ?? 100),
    cryptoHistory: (id: string, days?: number) =>
      ipcRenderer.invoke('markets:crypto-history', { id, days: days ?? 30 }),
    stockQuote: (symbol: string) => ipcRenderer.invoke('markets:stock-quote', symbol),
    stockHistory: (symbol: string, range?: string) =>
      ipcRenderer.invoke('markets:stock-history', { symbol, range: range ?? '1mo' }),
    news: (query?: string) => ipcRenderer.invoke('markets:news', query ?? ''),
    fearGreed: () => ipcRenderer.invoke('markets:fear-greed'),
    globalCrypto: () => ipcRenderer.invoke('markets:global-crypto'),
    forecast: (symbol: string, kind: 'crypto' | 'stock') =>
      ipcRenderer.invoke('markets:forecast', { symbol, kind }),
  },

  // --- Paper trading (simulateur 1M$) ---
  paper: {
    account: (token: string) => ipcRenderer.invoke('paper:account', token),
    positions: (token: string) => ipcRenderer.invoke('paper:positions', token),
    trades: (token: string, limit?: number) =>
      ipcRenderer.invoke('paper:trades', { token, limit }),
    buy: (token: string, order: { symbol: string; name?: string; kind: 'crypto' | 'stock'; quantity: number }) =>
      ipcRenderer.invoke('paper:buy', { token, ...order }),
    sell: (token: string, order: { symbol: string; kind: 'crypto' | 'stock'; quantity: number }) =>
      ipcRenderer.invoke('paper:sell', { token, ...order }),
    reset: (token: string, balance?: number) =>
      ipcRenderer.invoke('paper:reset', balance != null ? { token, balance } : token),
    quote: (symbol: string, kind: 'crypto' | 'stock') =>
      ipcRenderer.invoke('paper:quote', { symbol, kind }),
  },

  // --- Portefeuille ---
  portfolio: {
    list: (token: string) => ipcRenderer.invoke('portfolio:list', token),
    add: (token: string, position: any) =>
      ipcRenderer.invoke('portfolio:add', { token, position }),
    update: (token: string, position: any) =>
      ipcRenderer.invoke('portfolio:update', { token, position }),
    remove: (token: string, id: number) =>
      ipcRenderer.invoke('portfolio:remove', { token, id }),
    watchlist: {
      list: (token: string) => ipcRenderer.invoke('watchlist:list', token),
      add: (token: string, asset: any) =>
        ipcRenderer.invoke('watchlist:add', { token, asset }),
      remove: (token: string, id: number) =>
        ipcRenderer.invoke('watchlist:remove', { token, id }),
    },
  },
};

contextBridge.exposeInMainWorld('tradingPro', api);

export type TradingProAPI = typeof api;
