import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/api/auth/login/', { email, password });
          const { access, refresh } = response.data;

          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);

          set({ isAuthenticated: true, user: { username: email, email } });
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ isAuthenticated: false, user: null });
      },

      checkAuth: () => {
        const token = localStorage.getItem('access_token');
        if (token) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

