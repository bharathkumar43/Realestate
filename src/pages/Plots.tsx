import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { genie } from '../components/Genie/genieBus';
import PlotCard from '../components/PlotCard';
import { IconSearch, Spinner } from '../components/ui';
import { useData } from '../hooks/useData';
import { toSqyd } from '../lib/format';
import type { Plot } from '../lib/types';

const budgets = [
  { v: '', label: 'Any budget' },
  { v: '2500000', label: 'Under ₹25 L' },
  { v: '5000000', label: 'Under ₹50 L' },
  { v: '10000000', label: 'Under ₹1 Cr' },
  { v: '20000000', label: 'Under ₹2 Cr' },
];

const sorts = [
  { v: 'new', label: 'Newest first' },
  { v: 'price-asc', label: 'Price: low to high' },
  { v: 'price-desc', label: 'Price: high to low' },
  { v: 'area-desc', label: 'Biggest first' },
];

const statuses = [
  { v: '', label: 'All' },
  { v: 'available', label: 'Available' },
  { v: 'reserved', label: 'Reserved' },
  { v: 'sold', label: 'Sold' },
];

export default function Plots() {
  const { plots, loading, error } = useData();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const city = params.get('city') ?? '';
  const budget = params.get('budget') ?? '';
  const sort = params.get('sort') ?? 'new';
  const status = params.get('status') ?? '';
  const featured = params.get('featured') === '1';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const cities = useMemo(() => [...new Set(plots.map((p) => p.city).filter(Boolean))].sort(), [plots]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = plots.filter((p) => {
      if (term && !`${p.title} ${p.location} ${p.city} ${p.approval} ${p.facing}`.toLowerCase().includes(term)) return false;
      if (city && p.city !== city) return false;
      if (budget && p.price > Number(budget)) return false;
      if (status && p.status !== status) return false;
      if (featured && !p.featured) return false;
      return true;
    });
    const by: Record<string, (a: Plot, b: Plot) => number> = {
      new: (a, b) => b.created_at.localeCompare(a.created_at),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'area-desc': (a, b) => toSqyd(b.area_value, b.area_unit) - toSqyd(a.area_value, a.area_unit),
    };
    // Sold plots always sink to the bottom
    return [...list].sort((a, b) => Number(a.status === 'sold') - Number(b.status === 'sold') || (by[sort] ?? by.new)(a, b));
  }, [plots, q, city, budget, status, featured, sort]);

  // Genie reacts when filters change (not on first load)
  const first = useRef(true);
  useEffect(() => {
    if (loading) return;
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      genie(
        'spin',
        results.length ? `Abracadabra! ${results.length} plot${results.length > 1 ? 's' : ''} found ✨` : 'Hmm, no plots match. Try a bigger budget?',
      );
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, budget, status, featured, sort]);

  const anyFilter = q || city || budget || status || featured;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-night-900 sm:text-5xl">Find your plot</h1>
        <p className="mt-2 text-slate-500">
          {plots.filter((p) => p.status === 'available').length} available · tap any plot for photos, price and map
        </p>
      </motion.div>

      {/* Filters */}
      <div className="sticky top-16 z-30 -mx-4 mt-6 bg-violet-50/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-md ring-1 ring-violet-100 md:flex-row md:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-2xl bg-violet-50 px-4 py-2.5">
            <IconSearch className="h-5 w-5 text-violet-400" />
            <input
              value={q}
              onChange={(e) => set('q', e.target.value)}
              placeholder="Search area, city, approval…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
          <div className="grid grid-cols-3 gap-2 md:flex">
            <select value={city} onChange={(e) => set('city', e.target.value)} className="filter-select" aria-label="City">
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={budget} onChange={(e) => set('budget', e.target.value)} className="filter-select" aria-label="Budget">
              {budgets.map((b) => (
                <option key={b.v} value={b.v}>
                  {b.label}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)} className="filter-select" aria-label="Sort">
              {sorts.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {statuses.map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => set('status', s.v)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${status === s.v ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-violet-100 hover:bg-violet-100'}`}
            >
              {status === s.v && <motion.span layoutId="status-pill" className="absolute inset-0 rounded-full bg-violet-600" />}
              <span className="relative">{s.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => set('featured', featured ? '' : '1')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${featured ? 'bg-gold-400 text-night-900' : 'bg-white text-slate-600 ring-1 ring-violet-100 hover:bg-gold-300/40'}`}
          >
            ★ Featured
          </button>
          {anyFilter && (
            <button type="button" onClick={() => setParams({}, { replace: true })} className="ml-auto text-sm font-medium text-violet-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-6 rounded-2xl bg-rose-50 p-4 text-rose-700">Could not load plots: {error}</p>}

      {loading ? (
        <Spinner label="The genie is fetching plots…" />
      ) : results.length ? (
        <motion.div layout className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {results.map((p, i) => (
              <PlotCard key={p.id} plot={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 rounded-3xl bg-white p-12 text-center ring-1 ring-violet-100">
          <p className="text-5xl">🔮</p>
          <p className="mt-4 text-lg font-semibold text-night-900">No plots match your wish… yet</p>
          <p className="mt-1 text-slate-500">Try changing the filters, or message me what you need.</p>
        </motion.div>
      )}
    </div>
  );
}
