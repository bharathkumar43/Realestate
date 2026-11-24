import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { whatsappShareLink } from '../lib/contact';
import { IconShare, IconWhatsApp } from './ui';

interface Props {
  url: string;
  title: string;
  text: string;
  className?: string;
  label?: string;
  /** Open the popover above the button (for bottom bars). */
  up?: boolean;
}

/** Native share sheet on phones; a small popover with WhatsApp + copy link elsewhere. */
export default function ShareButton({ url, title, text, className = '', label = 'Share', up = false }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const on = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', on);
    return () => document.removeEventListener('pointerdown', on);
  }, [open]);

  const click = async () => {
    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* cancelled, fall through to popover */
      }
    }
    setOpen((o) => !o);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={click} className={className}>
        <IconShare className="h-5 w-5" /> {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`absolute right-0 z-30 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-violet-100 ${up ? 'bottom-full mb-2' : 'mt-2'}`}
          >
            <a
              href={whatsappShareLink(`${text}\n${url}`)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50"
            >
              <IconWhatsApp className="h-5 w-5 text-emerald-500" /> Share on WhatsApp
            </a>
            <button
              type="button"
              onClick={copy}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50"
            >
              <span className="text-lg">{copied ? '✅' : '🔗'}</span>
              {copied ? 'Link copied!' : 'Copy link'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
