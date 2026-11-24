import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isDemo } from '../../lib/supabase';

export default function AdminLayout() {
  const { email, signOut } = useAuth();
  const navigate = useNavigate();

  const tab = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-medium ${isActive ? 'bg-white text-night-900' : 'text-white/80 hover:text-white'}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-night-900 text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/admin" className="font-display text-lg font-bold">
            🪔 Agent Console
          </Link>
          <nav className="flex gap-1">
            <NavLink to="/admin" end className={tab}>Plots</NavLink>
            <NavLink to="/admin/profile" className={tab}>My profile</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-white/60 sm:inline">{email}</span>
            <Link to="/" target="_blank" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20">
              View site ↗
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/admin/login');
              }}
              className="rounded-full bg-rose-500 px-3 py-1.5 font-medium hover:bg-rose-600"
            >
              Log out
            </button>
          </div>
        </div>
        {isDemo && (
          <p className="bg-amber-400 px-4 py-1 text-center text-xs font-medium text-night-900">
            Demo mode: changes are saved only in this browser. Connect Supabase (see README) so clients see your plots.
          </p>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
