import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Starfield } from '../../components/ui';
import { DEMO_PASSWORD, useAuth } from '../../hooks/useAuth';
import { isDemo } from '../../lib/supabase';

export default function Login() {
  const { signIn, isAdmin, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  if (ready && isAdmin) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-night-900 to-violet-800 px-4">
      <Starfield count={50} />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
      >
        <p className="text-center text-5xl">🪔</p>
        <h1 className="mt-3 text-center font-display text-2xl font-bold text-night-900">Agent login</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Only you can add and edit plots.</p>

        {isDemo && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            Demo mode: use any email with the password <b>{DEMO_PASSWORD}</b>. With Supabase connected, only your
            account can log in.
          </p>
        )}

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input type="email" required={!isDemo} value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1" autoComplete="username" />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-1" autoComplete="current-password" />
        </label>

        {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
          {busy ? 'Opening the lamp…' : 'Log in'}
        </button>
        <Link to="/" className="mt-4 block text-center text-sm text-violet-600 hover:underline">
          ← Back to website
        </Link>
      </motion.form>
    </div>
  );
}
