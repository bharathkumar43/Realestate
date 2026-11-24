import { AnimatePresence, animate, motion, useAnimationControls, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { whatsappLink } from '../../lib/contact';
import GenieSvg, { LampSvg } from './GenieSvg';
import { onGenie } from './genieBus';
import { stopFor } from './genieScript';

const HIDDEN_KEY = 'plotgenie-hidden';
const FLIGHT_SECONDS = 1.4;

interface Pt {
  x: number;
  y: number;
}
interface Flight {
  id: number;
  from: Pt;
  ctrl: Pt;
  to: Pt;
}

const bezier = (f: Flight, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * f.from.x + 2 * u * t * f.ctrl.x + t * t * f.to.x,
    y: u * u * f.from.y + 2 * u * t * f.ctrl.y + t * t * f.to.y,
  };
};

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVp({ w: window.innerWidth, h: window.innerHeight }));
    };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

export default function Genie() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile } = useData();
  const reduce = useReducedMotion();
  const vp = useViewport();
  const mobile = vp.w < 768;
  const S = mobile ? 72 : 112;
  const onAdmin = pathname.startsWith('/admin');
  const onDetail = pathname.startsWith('/plots/');

  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDDEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [side, setSide] = useState<'left' | 'right'>('left');

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const rotate = useMotionValue(0);
  const mood = useAnimationControls();
  const placed = useRef(false);
  const fromLamp = useRef(false);
  const announcedPath = useRef<string | null>(null);
  const msgTimer = useRef<number>();
  const rootRef = useRef<HTMLDivElement>(null);

  const stop = stopFor(pathname);

  const target = useMemo<Pt>(() => {
    if (mobile) {
      const left = stop.x < 0.5;
      const bottomGap = onDetail ? 92 : 20;
      return { x: left ? 10 : vp.w - S - 10, y: vp.h - S - bottomGap };
    }
    const tx = Math.min(Math.max(stop.x * vp.w - S / 2, 12), vp.w - S - 12);
    const ty = Math.min(Math.max(stop.y * vp.h - S / 2, 76), vp.h - S - 16);
    return { x: tx, y: ty };
  }, [mobile, onDetail, stop, vp.w, vp.h, S]);

  const say = (text: string, ms = 6500) => {
    window.clearTimeout(msgTimer.current);
    setMsg(text);
    msgTimer.current = window.setTimeout(() => setMsg(null), ms);
  };

  // Bubble/menu go on whichever side of the genie has room
  useEffect(() => setSide(target.x + S / 2 > vp.w / 2 ? 'left' : 'right'), [target.x, S, vp.w]);

  // Fly to the page's spot whenever the page (or viewport) changes
  useEffect(() => {
    if (hidden || onAdmin) {
      placed.current = false;
      return;
    }
    const to = target;
    const announce = () => {
      if (announcedPath.current !== pathname) {
        announcedPath.current = pathname;
        say(stop.tips[0]);
      }
    };

    if (!placed.current) {
      placed.current = true;
      if (fromLamp.current && !reduce) {
        fromLamp.current = false;
        x.set(16);
        y.set(vp.h - 70);
      } else {
        x.set(to.x);
        y.set(to.y);
        const t = window.setTimeout(announce, 900);
        return () => window.clearTimeout(t);
      }
    }

    const from = { x: x.get(), y: y.get() };
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    if (reduce || dist < 8) {
      x.set(to.x);
      y.set(to.y);
      announce();
      return;
    }

    setMenuOpen(false);
    setMsg(null);
    const f: Flight = {
      id: Date.now(),
      from,
      to,
      ctrl: { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - Math.min(220, 60 + dist * 0.35) },
    };
    const dir = to.x >= from.x ? 1 : -1;
    setFlight(f);
    const ctl = animate(0, 1, {
      duration: FLIGHT_SECONDS,
      ease: [0.45, 0, 0.25, 1],
      onUpdate: (t) => {
        const p = bezier(f, t);
        x.set(p.x);
        y.set(p.y);
        rotate.set(Math.sin(t * Math.PI) * dir * 18);
      },
      onComplete: () => {
        setFlight(null);
        announce();
      },
    });
    return () => ctl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.x, target.y, hidden, onAdmin, reduce]);

  // Rotate through the page's tips every so often
  useEffect(() => {
    if (hidden || onAdmin || stop.tips.length < 2) return;
    let i = 0;
    const id = window.setInterval(() => {
      if (menuOpen) return;
      i = (i + 1) % stop.tips.length;
      say(stop.tips[i], 5500);
    }, 20000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hidden, onAdmin, menuOpen]);

  // React to events from pages (filters applied, plot opened, ...)
  useEffect(
    () =>
      onGenie((e) => {
        if (e.message) say(e.message, 4500);
        if (reduce) return;
        if (e.mood === 'spin') {
          void mood.start({ rotate: [0, 360], scale: [1, 1.15, 1], transition: { duration: 0.8, ease: 'easeInOut' } });
        } else if (e.mood === 'cheer') {
          void mood.start({ y: [0, -30, 0, -16, 0], scale: [1, 1.12, 1, 1.05, 1], transition: { duration: 1.1 } });
        }
      }),
    [mood, reduce],
  );

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const on = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', on);
    return () => document.removeEventListener('pointerdown', on);
  }, [menuOpen]);

  const hide = () => {
    setMenuOpen(false);
    setMsg(null);
    setHidden(true);
    try {
      localStorage.setItem(HIDDEN_KEY, '1');
    } catch {
      /* ignore */
    }
  };
  const summon = () => {
    fromLamp.current = true;
    announcedPath.current = null;
    setHidden(false);
    try {
      localStorage.removeItem(HIDDEN_KEY);
    } catch {
      /* ignore */
    }
  };

  const go = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  const menu: { icon: string; label: string; action: () => void }[] = [
    { icon: '🏡', label: 'Home', action: () => go('/') },
    { icon: '🗺️', label: 'All plots', action: () => go('/plots') },
    { icon: '💰', label: 'Cheapest first', action: () => go('/plots?sort=price-asc&status=available') },
    { icon: '🌟', label: 'Featured plots', action: () => go('/plots?featured=1') },
    { icon: '🙋', label: 'About the agent', action: () => go('/about') },
    {
      icon: '💬',
      label: 'WhatsApp the agent',
      action: () => {
        setMenuOpen(false);
        window.open(whatsappLink(profile.whatsapp || profile.phone, 'Hi! I found your plots website and would like to know more.'), '_blank');
      },
    },
    { icon: '🙈', label: 'Hide genie', action: hide },
  ];

  if (onAdmin) return null;

  if (hidden) {
    return (
      <motion.button
        type="button"
        onClick={summon}
        aria-label="Summon the genie"
        title="Rub the lamp to summon the genie"
        className={`fixed left-4 z-[60] h-12 w-16 rounded-2xl bg-night-800/90 p-2 shadow-lg ring-1 ring-gold-400/40 backdrop-blur ${onDetail && mobile ? 'bottom-24' : 'bottom-4'}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ rotate: [0, -8, 8, -4, 0], transition: { duration: 0.5 } }}
        whileTap={{ scale: 0.9 }}
      >
        <LampSvg />
      </motion.button>
    );
  }

  const bubbleWidth = mobile ? 200 : 240;
  const panelTop = mobile ? -40 : 0;
  const panelPos: { left?: number; right?: number; top: number } =
    side === 'left' ? { right: S - 4, top: panelTop } : { left: S - 4, top: panelTop };

  return (
    <>
      {/* magic dust trail */}
      {flight && !reduce && (
        <div key={flight.id} className="pointer-events-none fixed inset-0 z-[55]">
          {Array.from({ length: 14 }, (_, i) => {
            const t = (i + 1) / 15;
            const p = bezier(flight, t);
            return (
              <motion.span
                key={i}
                className="absolute text-gold-300"
                style={{ left: p.x + S * 0.45, top: p.y + S * 0.85, fontSize: 10 + (i % 3) * 5 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0.4], y: [0, 14] }}
                transition={{ delay: t * FLIGHT_SECONDS * 0.95, duration: 0.9 }}
              >
                {i % 2 ? '✦' : '✧'}
              </motion.span>
            );
          })}
        </div>
      )}

      <motion.div
        ref={rootRef}
        className="fixed left-0 top-0 z-[60]"
        style={{ x, y, rotate, width: S, height: S * 1.35 }}
      >
        <AnimatePresence>
          {(msg || menuOpen) && (
            <motion.div
              key={menuOpen ? 'menu' : msg}
              className="absolute"
              style={{ ...panelPos, width: bubbleWidth }}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            >
              {menuOpen ? (
                <div className="rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-violet-200">
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-violet-500">
                    Your wish is my command
                  </p>
                  {menu.map((m, i) => (
                    <motion.button
                      key={m.label}
                      type="button"
                      onClick={m.action}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50"
                      initial={{ opacity: 0, x: side === 'left' ? 12 : -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.035 }}
                    >
                      <span className="text-lg">{m.icon}</span>
                      {m.label}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMsg(null)}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-left text-sm leading-snug text-slate-700 shadow-xl ring-1 ring-violet-200"
                >
                  {msg}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="h-full w-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.3 }}
        >
          <motion.div
            className="h-full w-full"
            animate={reduce ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.button
              type="button"
              aria-label="Open the genie menu"
              aria-expanded={menuOpen}
              onClick={() => {
                setMsg(null);
                setMenuOpen((o) => !o);
              }}
              animate={mood}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="block h-full w-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-400/60 rounded-full"
            >
              <GenieSvg waving={!flight && (!!msg || menuOpen)} still={!!reduce} />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
