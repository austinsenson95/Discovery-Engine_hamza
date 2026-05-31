import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import { loginUser, registerUser, fetchUser } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'de_token';

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setStoredToken(null);
  }, []);

  const validateSession = useCallback(async () => {
    try {
      const userData = await fetchUser();
      setUser(userData);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const stored = getStoredToken();
      if (stored && mounted) {
        setToken(stored);
        await validateSession();
      }
      if (mounted) setIsLoading(false);
    }
    init();
    return () => { mounted = false; };
  }, [validateSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    setUser(res.user);
    setToken(res.token);
    setStoredToken(res.token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await registerUser({ name, email, password });
    setUser(res.user);
    setToken(res.token);
    setStoredToken(res.token);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
