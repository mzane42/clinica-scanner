import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { decodeJwt, isEmailAllowed, type DecodedToken } from '@/lib/google-auth';

interface User {
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credential: string) => boolean;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'clinica_scanner_session';

interface StoredSession {
  user: User;
  expiry: number;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session: StoredSession = JSON.parse(stored);

          // Check if session is still valid
          if (session.expiry > Date.now()) {
            setUser(session.user);
          } else {
            // Session expired, clear it
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback((credential: string): boolean => {
    try {
      const decoded: DecodedToken = decodeJwt(credential);

      // Check if email is in the whitelist
      if (!isEmailAllowed(decoded.email)) {
        setError(`Accès refusé pour ${decoded.email}. Contactez l'administrateur.`);
        return false;
      }

      const newUser: User = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      };

      // Store session with 24h expiry
      const session: StoredSession = {
        user: newUser,
        expiry: Date.now() + 24 * 60 * 60 * 1000,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setUser(newUser);
      setError(null);
      return true;
    } catch {
      setError('Erreur lors de la connexion. Réessayez.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
