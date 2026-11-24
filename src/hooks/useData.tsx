import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchPlots, fetchProfile } from '../lib/api';
import { demoProfile } from '../lib/demoData';
import type { AgentProfile, Plot } from '../lib/types';

interface DataState {
  plots: Plot[];
  profile: AgentProfile;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [profile, setProfile] = useState<AgentProfile>({ ...demoProfile, name: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, pr] = await Promise.all([fetchPlots(), fetchProfile()]);
      setPlots(p);
      setProfile(pr);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load plots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <DataContext.Provider value={{ plots, profile, loading, error, refresh }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
