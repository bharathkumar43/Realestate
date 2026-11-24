import { motion } from 'framer-motion';
import { Suspense, lazy, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Gallery from '../components/Gallery';
import { genie } from '../components/Genie/genieBus';
import PlotCard, { coverOf } from '../components/PlotCard';
import ShareButton from '../components/ShareButton';
import {
  IconArea,
  IconCheck,
  IconCompass,
  IconInstagram,
  IconPhone,
  IconPin,
  IconWhatsApp,
  Reveal,
  Spinner,
  StatusBadge,
} from '../components/ui';
import { useData } from '../hooks/useData';
import { instagramLink, mapsLink, plotUrl, telLink, whatsappLink } from '../lib/contact';
import { areaBreakdown, formatArea, formatINR, formatINRFull, ratePer } from '../lib/format';

const PlotMap = lazy(() => import('../components/PlotMap'));

export default function PlotDetail() {
  const { id } = useParams();
  const { plots, profile, loading } = useData();
  const plot = plots.find((p) => p.id === id);

  useEffect(() => {
    if (!plot) return;
    document.title = `${plot.title} · ${formatINR(plot.price)} | ${profile.name || 'Plots'}`;
    const t = setTimeout(
      () => genie('cheer', plot.status === 'sold' ? 'This one is sold, but I have similar plots below! 👇' : undefined),
      1600,
    );
    return () => {
      clearTimeout(t);
      document.title = 'Plot Genie | Plots for Sale';
    };
  }, [plot, profile.name]);

  if (loading) return <div className="pt-24"><Spinner /></div>;
  if (!plot) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-24 pt-32 text-center">
        <p className="text-6xl">🧞</p>
        <h1 className="mt-4 text-2xl font-bold text-night-900">This plot has vanished!</h1>
        <p className="mt-2 text-slate-500">It may have been removed. Have a look at the other plots.</p>
        <Link to="/plots" className="mt-6 inline-block rounded-full bg-violet-600 px-6 py-3 font-semibold text-white">
          See all plots
        </Link>
      </div>
    );
  }

  const area = areaBreakdown(plot);
  const url = plotUrl(plot.id);
  const waText = `Hi! I'm interested in "${plot.title}" at ${plot.location}, ${plot.city} (${formatINR(plot.price)}).\n${url}`;
  const wa = whatsappLink(profile.whatsapp || profile.phone, waText);
  const shareText = `🏡 ${plot.title}\n📍 ${plot.location}, ${plot.city}\n📐 ${formatArea(plot.area_value, plot.area_unit)} · 💰 ${formatINR(plot.price)}`;
  const similar = plots
    .filter((p) => p.id !== plot.id && p.status !== 'sold')
    .sort((a, b) => Number(b.city === plot.city) - Number(a.city === plot.city) || Math.abs(a.price - plot.price) - Math.abs(b.price - plot.price))
    .slice(0, 3);

  const images = plot.images.length
    ? plot.images
    : [{ id: 'cover', url: coverOf(plot), storage_path: '', sort_order: 0, is_cover: true }];

  const facts = [
    { icon: <IconArea />, label: 'Area', value: formatArea(plot.area_value, plot.area_unit) },
    { icon: <span className="text-lg">₹</span>, label: 'Rate', value: ratePer(plot) },
    { icon: <IconCompass />, label: 'Facing', value: plot.facing || '—' },
    { icon: <IconCheck />, label: 'Approval', value: plot.approval || '—' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-24 md:pb-20">
      <nav className="mb-4 text-sm text-slate-500">
        <Link to="/" className="hover:text-violet-600">Home</Link> /{' '}
        <Link to="/plots" className="hover:text-violet-600">Plots</Link> /{' '}
        <span className="text-slate-700">{plot.location}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Gallery images={images} title={plot.title} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={plot.status} />
            {plot.featured && <span className="rounded-full bg-gold-400 px-2.5 py-0.5 text-xs font-bold text-night-900">★ Featured</span>}
            {plot.price_negotiable && <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">Negotiable</span>}
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-night-900 sm:text-4xl">{plot.title}</h1>
          <p className="flex items-center gap-2 text-slate-600">
            <IconPin className="h-5 w-5 text-violet-500" /> {plot.location}, {plot.city}
          </p>

          <div className="rounded-3xl bg-gradient-to-br from-night-800 to-violet-700 p-6 text-white shadow-xl">
            <p className="text-sm text-white/70">Total price</p>
            <p className="text-4xl font-bold">{formatINR(plot.price)}</p>
            <p className="mt-1 text-sm text-white/70">{formatINRFull(plot.price)} · {ratePer(plot)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {facts.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="rounded-2xl bg-white p-4 ring-1 ring-violet-100"
              >
                <div className="flex items-center gap-2 text-violet-500">
                  {f.icon}
                  <span className="text-xs font-semibold uppercase tracking-wider">{f.label}</span>
                </div>
                <p className="mt-1 font-semibold text-night-900">{f.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="hidden flex-wrap gap-3 md:flex">
            <a href={wa} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02] hover:bg-emerald-600">
              <IconWhatsApp /> WhatsApp
            </a>
            {profile.phone && (
              <a href={telLink(profile.phone)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3.5 font-semibold text-white transition hover:scale-[1.02] hover:bg-violet-700">
                <IconPhone /> Call
              </a>
            )}
            <ShareButton
              url={url}
              title={plot.title}
              text={shareText}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-3.5 font-semibold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-50"
            />
          </div>
        </motion.div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="space-y-8">
          {plot.description && (
            <section className="rounded-3xl bg-white p-6 ring-1 ring-violet-100">
              <h2 className="text-xl font-semibold text-night-900">About this plot</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{plot.description}</p>
            </section>
          )}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-violet-100">
            <h2 className="text-xl font-semibold text-night-900">Area in every unit</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { v: area.sqyd, u: 'sq.yards' },
                { v: area.sqft, u: 'sq.feet' },
                { v: area.acre, u: 'acres' },
              ].map((a) => (
                <div key={a.u} className="rounded-2xl bg-violet-50 p-3">
                  <p className="text-lg font-bold text-violet-700 sm:text-2xl">{a.v}</p>
                  <p className="text-xs text-slate-500">{a.u}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.1} className="space-y-4">
          {plot.latitude !== null && plot.longitude !== null && (
            <section>
              <h2 className="mb-3 text-xl font-semibold text-night-900">Location</h2>
              <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-violet-100" />}>
                <PlotMap lat={plot.latitude} lng={plot.longitude} />
              </Suspense>
              <a
                href={mapsLink(plot.latitude, plot.longitude)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-50"
              >
                <IconPin className="h-5 w-5" /> Open in Google Maps
              </a>
            </section>
          )}
          <section className="flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-violet-100">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-xl font-bold text-white">
                {(profile.name || 'A').charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs text-slate-500">Listed by</p>
              <Link to="/about" className="font-semibold text-night-900 hover:text-violet-600">{profile.name}</Link>
            </div>
            {profile.instagram && (
              <a href={instagramLink(profile.instagram)} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600 p-2.5 text-white">
                <IconInstagram />
              </a>
            )}
          </section>
        </Reveal>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold text-night-900 sm:text-3xl">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p, i) => (
              <PlotCard key={p.id} plot={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky contact bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 26 }}
        className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-violet-100 bg-white/95 p-3 backdrop-blur md:hidden"
      >
        <a href={wa} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 font-semibold text-white">
          <IconWhatsApp /> WhatsApp
        </a>
        {profile.phone && (
          <a href={telLink(profile.phone)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-violet-600 py-3 font-semibold text-white">
            <IconPhone /> Call
          </a>
        )}
        <ShareButton
          url={url}
          title={plot.title}
          text={shareText}
          label=""
          up
          className="flex items-center justify-center rounded-full bg-violet-50 px-4 py-3 text-violet-700"
        />
      </motion.div>
    </div>
  );
}
