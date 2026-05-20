import { create } from 'zustand';
import { upsertProfile, invalidateProfileCache } from '../supabase';

export interface User {
  id: number;
  publicId?: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  provider: string;
  verified: boolean;
  createdAt: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: User) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (dataUrl: string | null) => Promise<void>;
  updateBio: (bio: string) => Promise<void>;
  syncProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  loading: true,

  hydrate: async () => {
    const t = localStorage.getItem('tp_token');
    if (!t) {
      set({ loading: false });
      return;
    }
    const r = await window.tradingPro.auth.me(t);
    if (r?.ok) {
      set({ token: t, user: r.user, loading: false });
      void get().syncProfile();
    } else {
      localStorage.removeItem('tp_token');
      set({ token: null, user: null, loading: false });
    }
  },

  setSession: (token, user) => {
    localStorage.setItem('tp_token', token);
    set({ token, user });
    void get().syncProfile();
  },

  refresh: async () => {
    const t = get().token;
    if (!t) return;
    const r = await window.tradingPro.auth.me(t);
    if (r?.ok) {
      set({ user: r.user });
      void get().syncProfile();
    }
  },

  logout: async () => {
    const t = get().token;
    if (t) await window.tradingPro.auth.logout(t);
    localStorage.removeItem('tp_token');
    set({ token: null, user: null });
  },

  updateAvatar: async (dataUrl) => {
    const t = get().token;
    if (!t) return;
    const r = await window.tradingPro.auth.updateProfile(t, { avatarUrl: dataUrl });
    if (r?.ok) {
      set({ user: r.user });
      invalidateProfileCache(r.user.publicId);
      void get().syncProfile();
    }
  },

  updateBio: async (bio) => {
    const t = get().token;
    if (!t) return;
    const r = await window.tradingPro.auth.updateProfile(t, { bio });
    if (r?.ok) {
      set({ user: r.user });
      invalidateProfileCache(r.user.publicId);
      void get().syncProfile();
    }
  },

  syncProfile: async () => {
    const u = get().user;
    if (!u || !u.publicId) return;
    try {
      await upsertProfile({
        id: u.publicId,
        username: u.username,
        avatar_data: u.avatarUrl ?? null,
        bio: u.bio ?? null,
      });
    } catch {
      // Supabase optionnel
    }
  },
}));
