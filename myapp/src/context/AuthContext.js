import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App khulne par token aur user load karein[cite: 1]
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@auth_user');
        const token = await AsyncStorage.getItem('@auth_token');
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to restore session', err);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await apiClient('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    // Token aur user ko AsyncStorage me save karein taake app band hone par bhi user login rahe[cite: 1]
    await AsyncStorage.setItem('@auth_token', data.token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (name, email, password, role) => {
    const data = await apiClient('/api/auth/register', {
      method: 'POST',
      body: { name, email, password, role },
    });
    await AsyncStorage.setItem('@auth_token', data.token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    // Logout hone par dono cheezein clear karein[cite: 1]
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);