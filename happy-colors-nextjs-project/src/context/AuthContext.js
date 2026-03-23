'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import baseUrl from '@/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/users/me`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        setUser(null);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch authenticated user');
      }

      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      console.error('Auth refresh error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      refreshUser,
    }),
    [user, loading, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);