import { motion } from 'framer-motion';

/** Hand-drawn genie: turban, friendly face, waving arm and a smoky tail. */
export default function GenieSvg({ waving, still }: { waving: boolean; still?: boolean }) {
  return (
    <svg viewBox="0 0 120 165" className="h-full w-full overflow-visible drop-shadow-[0_8px_18px_rgba(124,58,237,0.45)]">
      <defs>
        <linearGradient id="gn-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="gn-tail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="0.6" stopColor="#a78bfa" stopOpacity="0.85" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="gn-vest" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="gn-turban" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#be185d" />
        </linearGradient>
      </defs>

      {/* smoky tail */}
      <motion.path
        d="M44 96 C 30 120, 72 126, 52 146 C 44 154, 58 162, 66 152 C 84 130, 82 112, 76 96 Z"
        fill="url(#gn-tail)"
        style={{ originX: '60px', originY: '96px' }}
        animate={still ? undefined : { skewX: [0, 8, -4, 0], scaleY: [1, 1.05, 0.98, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* left arm resting */}
      <path d="M40 74 Q 26 84 34 96 Q 40 100 46 94" fill="none" stroke="url(#gn-skin)" strokeWidth="9" strokeLinecap="round" />
      <circle cx="46" cy="93" r="5" fill="#60a5fa" />
      <rect x="27" y="80" width="10" height="5" rx="2" fill="#fbbf24" transform="rotate(-40 32 82)" />

      {/* torso + vest */}
      <path d="M38 70 Q 60 60 82 70 L 78 100 Q 60 108 42 100 Z" fill="url(#gn-skin)" />
      <path d="M38 70 Q 46 66 52 66 L 50 102 Q 45 102 42 100 Z" fill="url(#gn-vest)" />
      <path d="M82 70 Q 74 66 68 66 L 70 102 Q 75 102 78 100 Z" fill="url(#gn-vest)" />
      <path d="M52 66 L 50 102 M68 66 L 70 102" stroke="#fbbf24" strokeWidth="1.6" />
      <path d="M42 98 Q 60 106 78 98" stroke="#fbbf24" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* right arm (waving) */}
      <motion.g
        style={{ originX: '80px', originY: '74px' }}
        animate={waving && !still ? { rotate: [0, -28, 6, -28, 0] } : { rotate: 0 }}
        transition={{ duration: 1.4, repeat: waving && !still ? Infinity : 0, repeatDelay: 0.6 }}
      >
        <path d="M80 74 Q 96 66 98 48" fill="none" stroke="url(#gn-skin)" strokeWidth="9" strokeLinecap="round" />
        <circle cx="98" cy="45" r="6" fill="#60a5fa" />
        <rect x="91" y="54" width="11" height="5" rx="2" fill="#fbbf24" transform="rotate(-70 96 56)" />
      </motion.g>

      {/* neck + head */}
      <rect x="55" y="60" width="10" height="10" rx="4" fill="#3b82f6" />
      <ellipse cx="41" cy="48" rx="4" ry="6" fill="#60a5fa" />
      <ellipse cx="79" cy="48" rx="4" ry="6" fill="#60a5fa" />
      <circle cx="79" cy="55" r="2.4" fill="#fbbf24" />
      <circle cx="60" cy="47" r="19" fill="url(#gn-skin)" />

      {/* face */}
      <g className="origin-center animate-blink" style={{ transformBox: 'fill-box' }}>
        <ellipse cx="53" cy="47" rx="2.4" ry="3.4" fill="#1e1b4b" />
        <ellipse cx="67" cy="47" rx="2.4" ry="3.4" fill="#1e1b4b" />
      </g>
      <circle cx="53.8" cy="45.8" r="0.9" fill="#fff" />
      <circle cx="67.8" cy="45.8" r="0.9" fill="#fff" />
      <path d="M49 40 Q 53 38 56 40 M64 40 Q 67 38 71 40" stroke="#1e1b4b" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="54" r="3" fill="#f9a8d4" opacity="0.6" />
      <circle cx="72" cy="54" r="3" fill="#f9a8d4" opacity="0.6" />
      <path d="M53 55 Q 60 61 67 55" stroke="#1e1b4b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M57 63 Q 60 72 63 63 Z" fill="#1e1b4b" />

      {/* turban */}
      <path d="M39 42 Q 40 20 60 19 Q 80 20 81 42 Q 70 34 60 35 Q 50 34 39 42 Z" fill="url(#gn-turban)" />
      <path d="M42 36 Q 60 26 78 36" stroke="#9d174d" strokeWidth="1.5" fill="none" />
      <circle cx="60" cy="30" r="4.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
      <circle cx="60" cy="30" r="1.8" fill="#34d399" />
      <path d="M60 25 Q 66 12 74 8 Q 68 16 62 25 Z" fill="#fde68a" />
    </svg>
  );
}

/** Small lamp icon used when the genie is minimized. */
export function LampSvg() {
  return (
    <svg viewBox="0 0 64 40" className="h-full w-full">
      <path d="M6 26 C 14 26 18 18 30 18 C 42 18 46 24 58 20 C 56 30 46 36 30 36 C 16 36 8 32 6 26 Z" fill="#f59e0b" />
      <path d="M22 18 Q 30 8 38 18 Z" fill="#fbbf24" />
      <circle cx="30" cy="9" r="3" fill="#fde68a" />
      <path d="M58 20 Q 62 16 63 12" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="20" y="35" width="20" height="4" rx="2" fill="#d97706" />
    </svg>
  );
}
