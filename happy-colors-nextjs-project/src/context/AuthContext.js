'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // 🟡 важно: undefined докато зарежда
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:3030/users/me', {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Not authenticated');

        const userData = await res.json();
        setUser(userData); // 🟢 логнат
      } catch (err) {
        setUser(null); // 🔴 не е логнат
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
