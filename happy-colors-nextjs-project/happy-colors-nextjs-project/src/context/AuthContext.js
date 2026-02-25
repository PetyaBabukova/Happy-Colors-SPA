'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import baseUrl from '@/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false); // 🟢 нов флаг

  useEffect(() => {
    setIsClient(true); // 🟢 безопасно да рендерираме

    const fetchUser = async () => {
      try {
        const res = await fetch(`${baseUrl}/users/me`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Not authenticated');
        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (!isClient) return null; // 🛑 избягваме SSR рендериране

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
