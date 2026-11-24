import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { isDemo, supabase } from '../lib/supabase';

export const DEMO_PASSWORD = 'genie123';
const DEMO_SESSION_KEY = 'plotgenie-demo-admin';

interface AuthState {
  isAdmin: boolean;
  ready: boolean;
  email: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isDemo) {
      try {
        setEmail(sessionStorage.getItem(DEMO_SESSION_KEY));
      } catch {
        /* ignore */
      }
      setReady(true);
      return;
    }
    supabase!.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setReady(true);
    });
    const { data } = supabase!.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (mail: string, password: string) => {
    if (isDemo) {
      if (password !== DEMO_PASSWORD) throw new Error('Wrong password');
      try {
        sessionStorage.setItem(DEMO_SESSION_KEY, mail || 'demo@agent');
      } catch {
        /* ignore */
      }
      setEmail(mail || 'demo@agent');
      return;
    }
    const { error } = await supabase!.auth.signInWithPassword({ email: mail, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (isDemo) {
      try {
        sessionStorage.removeItem(DEMO_SESSION_KEY);
      } catch {
        /* ignore */
      }
      setEmail(null);
      return;
    }
    await supabase!.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ isAdmin: !!email, ready, email, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
