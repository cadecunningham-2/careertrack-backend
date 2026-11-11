import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { apiGet } from '../services/api';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'careertrack_token';

// Safe wrappers — guards against native method mismatches in Expo Go
async function storeToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // SecureStore unavailable — token lives in memory only
  }
}

async function loadToken(): Promise<string | null> {
  try {
    const val = await SecureStore.getItemAsync(TOKEN_KEY);
    return val && val.length > 0 ? val : null;
  } catch {
    return null;
  }
}

async function clearToken(): Promise<void> {
  try {
    // Use setItemAsync('') instead of deleteItemAsync to avoid
    // the deleteValueWithKeyAsync native method missing in some Expo Go builds
    await SecureStore.setItemAsync(TOKEN_KEY, '');
  } catch {
    // Silently ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadToken();
        if (stored) {
          setToken(stored);
          const me = await apiGet<User>('/api/users/me', stored);
          setUser(me);
        }
      } catch {
        await clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (newToken: string, newUser: User) => {
    await storeToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const me = await apiGet<User>('/api/users/me', token);
      setUser(me);
    } catch {
      await signOut();
    }
  }, [token, signOut]);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

