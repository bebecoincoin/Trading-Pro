interface Window {
  tradingPro: {
    app: {
      version: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
      supabaseConfig: () => Promise<{ url: string; anonKey: string }>;
    };
    system: {
      pickAvatar: () => Promise<
        | { ok: true; dataUrl: string; fileName: string }
        | { ok: false; canceled?: boolean; error?: string }
      >;
    };
    auth: {
      register: (data: { email: string; password: string; username: string }) => Promise<any>;
      login: (data: { email: string; password: string }) => Promise<any>;
      verifyEmail: (token: string) => Promise<any>;
      resendVerification: (email: string) => Promise<any>;
      googleSignIn: () => Promise<any>;
      me: (token: string) => Promise<any>;
      logout: (token: string) => Promise<any>;
      updateProfile: (token: string, data: any) => Promise<any>;
    };
    markets: {
      cryptoTop: (limit?: number) => Promise<any>;
      cryptoHistory: (id: string, days?: number) => Promise<any>;
      stockQuote: (symbol: string) => Promise<any>;
      stockHistory: (symbol: string, range?: string) => Promise<any>;
      news: (query?: string) => Promise<any>;
      fearGreed: () => Promise<any>;
      globalCrypto: () => Promise<any>;
      forecast: (symbol: string, kind: 'crypto' | 'stock') => Promise<any>;
    };
    portfolio: {
      list: (token: string) => Promise<any>;
      add: (token: string, position: any) => Promise<any>;
      update: (token: string, position: any) => Promise<any>;
      remove: (token: string, id: number) => Promise<any>;
      watchlist: {
        list: (token: string) => Promise<any>;
        add: (token: string, asset: any) => Promise<any>;
        remove: (token: string, id: number) => Promise<any>;
      };
    };
    paper: {
      account: (token: string) => Promise<any>;
      positions: (token: string) => Promise<any>;
      trades: (token: string, limit?: number) => Promise<any>;
      buy: (
        token: string,
        order: { symbol: string; name?: string; kind: 'crypto' | 'stock'; quantity: number }
      ) => Promise<any>;
      sell: (
        token: string,
        order: { symbol: string; kind: 'crypto' | 'stock'; quantity: number }
      ) => Promise<any>;
      reset: (token: string, balance?: number) => Promise<any>;
      quote: (symbol: string, kind: 'crypto' | 'stock') => Promise<any>;
    };
  };
}
