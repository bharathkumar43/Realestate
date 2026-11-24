import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { instagramLink, telLink, whatsappLink } from '../lib/contact';
import { isDemo } from '../lib/supabase';
import Genie from './Genie/Genie';
import { IconInstagram, IconMenu, IconPhone, IconWhatsApp, IconX } from './ui';

/** Freezes the outlet so the old page can animate out while the new one waits. */
function FrozenOutlet() {
  const o = useOutlet();
  const [outlet] = useState(o);
  return <>{outlet}</>;
}

function Navbar() {
  const { profile } = useData();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/plots', label: 'Plots' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || pathname !== '/' ? 'bg-night-900/90 shadow-lg backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          >
            {'🪔'}
          </motion.span>
          <span className="font-display text-xl font-bold leading-tight">
            {profile.name ? `${profile.name.split(' ')[0]}'s` : 'Plot'} <span className="text-gold-400">Plots</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'text-night-900' : 'text-white/80 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gold-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
          {profile.whatsapp && (
            <a
              href={whatsappLink(profile.whatsapp, 'Hi! I saw your plots website and want to know more.')}
              target="_blank"
              rel="noreferrer"
              className="ml-3 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600"
            >
              <IconWhatsApp className="h-4 w-4" /> Chat now
            </a>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-white md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <IconX /> : <IconMenu />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-night-900 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-base font-medium ${isActive ? 'bg-gold-400 text-night-900' : 'text-white/90'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const { profile } = useData();
  return (
    <footer className="bg-night-900 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold text-white">{profile.name || 'Plots'}</p>
          <p className="mt-2 text-sm">{profile.tagline}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold uppercase tracking-wider text-gold-400">Explore</p>
          <Link to="/plots" className="block hover:text-white">All plots</Link>
          <Link to="/plots?status=available" className="block hover:text-white">Available now</Link>
          <Link to="/about" className="block hover:text-white">About me</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-wider text-gold-400">Get in touch</p>
          {profile.phone && (
            <a href={telLink(profile.phone)} className="flex items-center gap-2 hover:text-white">
              <IconPhone className="h-4 w-4" /> {profile.phone}
            </a>
          )}
          {profile.whatsapp && (
            <a href={whatsappLink(profile.whatsapp, 'Hi!')} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
              <IconWhatsApp className="h-4 w-4" /> WhatsApp
            </a>
          )}
          {profile.instagram && (
            <a href={instagramLink(profile.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
              <IconInstagram className="h-4 w-4" /> @{profile.instagram.replace(/^@/, '')}
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </div>
    </footer>
  );
}

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-violet-50">
      {isDemo && (
        <div className="fixed bottom-0 left-1/2 z-40 hidden -translate-x-1/2 rounded-t-lg bg-amber-400 px-3 py-1 text-xs font-medium text-night-900 md:block">
          Demo mode: sample data. Connect Supabase to go live (see README).
        </div>
      )}
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <FrozenOutlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <Genie />
    </div>
  );
}
