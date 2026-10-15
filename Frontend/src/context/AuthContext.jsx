import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { bootstrapApi, setCsrfToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await bootstrapApi();
        setCsrfToken(token);
        const response = await api.get('/api/auth/me');
        if (mounted) {
          setUser(response.data.user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(credentials) {
        const response = await api.post('/api/auth/login', credentials);
        setUser(response.data.user);
        return response.data.user;
      },
      async register(payload) {
        const response = await api.post('/api/auth/register', payload);
        setUser(response.data.user);
        return response.data.user;
      },
      async logout() {
        await api.post('/api/auth/logout');
        setUser(null);
      },
      async refresh() {
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
        return response.data.user;
      },
      updateUser(updated) {
        setUser((prev) => (prev ? { ...prev, ...updated } : updated));
      },
      async updateProfile(payload) {
        const response = await api.patch('/api/profile', payload);
        if (response.data?.user) {
          setUser(response.data.user);
        }
        return response.data?.user;
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
