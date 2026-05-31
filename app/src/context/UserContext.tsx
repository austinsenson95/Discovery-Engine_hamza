import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import { fetchUser, fetchCredits } from '@/lib/api';

interface UserContextValue {
  user: User | null;
  credits: number;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const data = await fetchUser();
      setUser(data);
      if (data.credits !== undefined) {
        setCredits(data.credits);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    }
  }, []);

  const refreshCredits = useCallback(async () => {
    try {
      const data = await fetchCredits();
      setCredits(data.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credits');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      setIsLoading(true);
      try {
        const [userData, creditData] = await Promise.all([fetchUser(), fetchCredits()]);
        if (mounted) {
          setUser(userData);
          setCredits(creditData.balance);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  return (
    <UserContext.Provider value={{ user, credits, isLoading, error, refreshUser, refreshCredits }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };
