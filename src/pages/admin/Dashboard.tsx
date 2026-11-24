import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { coverOf } from '../../components/PlotCard';
import ShareButton from '../../components/ShareButton';
import { useData } from '../../hooks/useData';
import { deletePlot, resetDemo, updatePlotQuick } from '../../lib/api';
import { formatArea, formatINR } from '../../lib/format';
import { isDemo } from '../../lib/supabase';
import type { Plot, PlotStatus } from '../../lib/types';

export default function Dashboard() {
  const { plots, profile, refresh, loading } = useData();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<Plot | null>(null);

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setError('');
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  };

  const counts = {
    available: plots.filter((p) => p.status === 'available').length,
    reserved: plots.filter((p) => p.status === 'reserved').length,
    sold: plots.filter((p) => p.status === 'sold').length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-night-900">Your plots</h1>
          <p className="text-sm text-slate-500">
            {counts.available} available · {counts.reserved} reserved · {counts.sold} sold
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <ShareButton
            url={`${window.location.origin}/plots`}
            title={`${profile.name} · Plots for sale`}
            text={`Here are the plots I have for sale. Tap to see photos, prices and locations:`}
            label="Share all plots"
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50"
          />
          <Link to="/admin/plots/new" className="btn-primary">
            + Add plot
          </Link>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {!loading && plots.length === 0 && (
        <div className="mt-10 rounded-3xl bg-white p-12 text-center ring-1 ring-slate-200">
          <p className="text-5xl">🏞️</p>
          <p className="mt-3 text-lg font-semibold">No plots yet</p>
          <p className="text-slate-500">Add your first plot with photos and price.</p>
          <Link to="/admin/plots/new" className="btn-primary mt-6 inline-block">+ Add plot</Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <AnimatePresence>
          {plots.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: busyId === p.id ? 0.5 : 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="flex flex-col gap-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200 sm:flex-row sm:items-center"
            >
              <img src={coverOf(p)} alt="" className="h-24 w-full rounded-xl object-cover sm:w-36" />
              <div className="min-w-0 flex-1">
                <Link to={`/plots/${p.id}`} target="_blank" className="font-semibold text-night-900 hover:text-violet-600">
                  {p.title}
                </Link>
                <p className="text-sm text-slate-500">
                  {p.location}, {p.city} · {formatArea(p.area_value, p.area_unit)} ·{' '}
                  <b className="text-night-900">{formatINR(p.price)}</b> · {p.images.length} photo{p.images.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={p.status}
                  disabled={busyId === p.id}
                  onChange={(e) => run(p.id, () => updatePlotQuick(p.id, { status: e.target.value as PlotStatus }))}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  aria-label="Status"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
                <button
                  type="button"
                  title={p.featured ? 'Remove from featured' : 'Feature on home page'}
                  onClick={() => run(p.id, () => updatePlotQuick(p.id, { featured: !p.featured }))}
                  className={`rounded-full px-3 py-2 text-sm font-medium ${p.featured ? 'bg-gold-400 text-night-900' : 'bg-slate-100 text-slate-500'}`}
                >
                  ★
                </button>
                <Link to={`/admin/plots/${p.id}/edit`} className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200">
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirm(p)}
                  className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isDemo && (
        <button
          type="button"
          onClick={async () => {
            resetDemo();
            await refresh();
          }}
          className="mt-8 text-xs text-slate-400 underline hover:text-slate-600"
        >
          Reset demo data
        </button>
      )}

      <AnimatePresence>
        {confirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white p-6 text-center"
            >
              <p className="text-4xl">🗑️</p>
              <p className="mt-3 font-semibold">Delete “{confirm.title}”?</p>
              <p className="mt-1 text-sm text-slate-500">This removes the plot and its photos permanently.</p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setConfirm(null)} className="flex-1 rounded-full bg-slate-100 py-2.5 font-medium">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = confirm;
                    setConfirm(null);
                    void run(p.id, () => deletePlot(p));
                  }}
                  className="flex-1 rounded-full bg-rose-600 py-2.5 font-medium text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
