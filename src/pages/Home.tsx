import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PlotCard from '../components/PlotCard';
import { Counter, IconWhatsApp, Reveal, Spinner, Starfield } from '../components/ui';
import { useData } from '../hooks/useData';
import { whatsappLink } from '../lib/contact';

const perks = [
  { icon: '📜', title: 'Clear titles', text: 'Every plot is checked for clean documents and approvals before it is listed.' },
  { icon: '🚗', title: 'Free site visits', text: 'Pick a day and I will personally take you to see the plot.' },
  { icon: '🏦', title: 'Loan help', text: 'Guidance with bank loans and paperwork, start to registration.' },
];

export default function Home() {
  const { plots, profile, loading } = useData();
  const available = plots.filter((p) => p.status !== 'sold');
  const featured = (available.filter((p) => p.featured).length ? available.filter((p) => p.featured) : available).slice(0, 3);
  const cities = new Set(plots.map((p) => p.location)).size;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-night-900 via-night-700 to-violet-700 pb-28 pt-32 text-white">
        <Starfield count={60} />
        <motion.div
          aria-hidden
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-400/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative mx-auto max-w-6xl px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm text-gold-300 ring-1 ring-white/20 backdrop-blur"
          >
            ✨ {available.length} plots waiting for you
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl"
          >
            Your wish for the{' '}
            <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">perfect plot</span>{' '}
            is granted.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-xl text-lg text-white/80"
          >
            {profile.tagline} Browse plots with photos, prices and locations, then chat with {profile.name || 'me'} directly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/plots"
              className="rounded-full bg-gold-400 px-7 py-3.5 font-semibold text-night-900 shadow-lg shadow-gold-500/30 transition hover:scale-105 hover:bg-gold-300"
            >
              Explore Plots →
            </Link>
            {profile.whatsapp && (
              <a
                href={whatsappLink(profile.whatsapp, 'Hi! I am looking for a plot. Can you help?')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 font-semibold ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
              >
                <IconWhatsApp /> Talk to me
              </a>
            )}
          </motion.div>
        </div>
        <svg aria-hidden viewBox="0 0 1440 120" className="absolute -bottom-px left-0 w-full text-violet-50" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 64 C 320 120 560 0 880 40 S 1280 110 1440 60 V120 H0Z" />
        </svg>
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto -mt-14 max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-violet-100 sm:grid-cols-4">
          {[
            { n: available.length, label: 'Plots available' },
            { n: cities, label: 'Locations' },
            { n: profile.plots_sold, label: 'Plots sold', suffix: '+' },
            { n: profile.experience_years, label: 'Years experience', suffix: '+' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-violet-700 sm:text-4xl">
                <Counter to={s.n} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-500">Handpicked</p>
            <h2 className="font-display text-3xl font-bold text-night-900 sm:text-4xl">Featured plots</h2>
          </div>
          <Link to="/plots" className="font-semibold text-violet-600 hover:text-violet-800">
            See all plots →
          </Link>
        </Reveal>
        {loading ? (
          <Spinner label="The genie is fetching plots…" />
        ) : featured.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <PlotCard key={p.id} plot={p} index={i} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl bg-white p-10 text-center text-slate-500">New plots are coming soon. Check back shortly!</p>
        )}
      </section>

      {/* Perks */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-night-900 sm:text-4xl">Why buy with me?</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8, rotate: -1 }}
                  className="h-full rounded-3xl bg-gradient-to-br from-violet-50 to-white p-8 ring-1 ring-violet-100"
                >
                  <motion.div
                    className="mb-4 inline-block text-5xl"
                    whileHover={{ scale: 1.3, rotate: 12 }}
                  >
                    {p.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-night-900">{p.title}</h3>
                  <p className="mt-2 text-slate-600">{p.text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-700 to-night-700 px-8 py-14 text-center text-white">
            <Starfield count={25} />
            <h2 className="relative font-display text-3xl font-bold sm:text-4xl">Didn’t find what you wished for?</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-white/80">
              Tell me your budget and preferred area. I have more plots than I can list here.
            </p>
            {profile.whatsapp && (
              <a
                href={whatsappLink(profile.whatsapp, 'Hi! My budget is ___ and I prefer the ___ area. Do you have any plots?')}
                target="_blank"
                rel="noreferrer"
                className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 font-semibold shadow-lg transition hover:scale-105 hover:bg-emerald-600"
              >
                <IconWhatsApp /> Send my requirement
              </a>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}
