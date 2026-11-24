import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ShareButton from '../components/ShareButton';
import { Counter, IconInstagram, IconPhone, IconWhatsApp, Reveal, Starfield } from '../components/ui';
import { useData } from '../hooks/useData';
import { instagramLink, telLink, whatsappLink } from '../lib/contact';

export default function About() {
  const { profile, plots } = useData();
  const available = plots.filter((p) => p.status === 'available').length;

  const contacts = [
    profile.whatsapp && {
      href: whatsappLink(profile.whatsapp, 'Hi! I found your website and want to know about your plots.'),
      label: 'WhatsApp',
      sub: 'Fastest reply',
      icon: <IconWhatsApp className="h-6 w-6" />,
      cls: 'bg-emerald-500 hover:bg-emerald-600',
    },
    profile.phone && {
      href: telLink(profile.phone),
      label: 'Call me',
      sub: profile.phone,
      icon: <IconPhone className="h-6 w-6" />,
      cls: 'bg-violet-600 hover:bg-violet-700',
    },
    profile.instagram && {
      href: instagramLink(profile.instagram),
      label: 'Instagram',
      sub: `@${profile.instagram.replace(/^@/, '')}`,
      icon: <IconInstagram className="h-6 w-6" />,
      cls: 'bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600 hover:opacity-90',
    },
  ].filter(Boolean) as { href: string; label: string; sub: string; icon: JSX.Element; cls: string }[];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-night-900 to-violet-700 pb-24 pt-32 text-white">
        <Starfield count={40} />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 text-center md:flex-row md:text-left">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            className="relative"
          >
            <div className="absolute -inset-2 animate-[spin_8s_linear_infinite] rounded-full bg-gradient-to-tr from-gold-400 via-pink-500 to-violet-500 opacity-80 blur-sm" />
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className="relative h-40 w-40 rounded-full object-cover ring-4 ring-night-900" />
            ) : (
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-night-800 font-display text-6xl font-bold ring-4 ring-night-900">
                {(profile.name || 'A').charAt(0)}
              </div>
            )}
          </motion.div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">Your plot expert</p>
            <h1 className="mt-1 font-display text-4xl font-bold sm:text-5xl">{profile.name}</h1>
            <p className="mt-3 max-w-xl text-lg text-white/80">{profile.tagline}</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-5xl px-4">
        <div className="grid grid-cols-3 gap-3 rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-violet-100">
          {[
            { n: profile.experience_years, s: '+', l: 'Years' },
            { n: profile.plots_sold, s: '+', l: 'Plots sold' },
            { n: available, s: '', l: 'Available now' },
          ].map((x) => (
            <div key={x.l}>
              <p className="text-3xl font-bold text-violet-700"><Counter to={x.n} suffix={x.s} /></p>
              <p className="text-xs text-slate-500 sm:text-sm">{x.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-night-900">A little about me</h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-slate-600">{profile.bio}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/plots" className="rounded-full bg-gold-400 px-6 py-3 font-semibold text-night-900 transition hover:scale-105">
                See my plots →
              </Link>
              <ShareButton
                url={window.location.origin}
                title={`${profile.name} · Plots for sale`}
                text={`Check out the plots ${profile.name} has for sale:`}
                label="Share my page"
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="space-y-3">
            {contacts.map((c, i) => (
              <motion.a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('tel:') ? undefined : '_blank'}
                rel="noreferrer"
                whileHover={{ x: 6 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-4 rounded-2xl p-4 text-white shadow-lg ${c.cls}`}
              >
                {c.icon}
                <div>
                  <p className="font-semibold">{c.label}</p>
                  <p className="text-sm text-white/80">{c.sub}</p>
                </div>
              </motion.a>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
