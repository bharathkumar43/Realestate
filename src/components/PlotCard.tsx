import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatArea, formatINR, ratePer } from '../lib/format';
import type { Plot } from '../lib/types';
import { IconArea, IconPin, StatusBadge } from './ui';
import { sceneImage } from '../lib/demoData';

export function coverOf(p: Plot): string {
  return (p.images.find((i) => i.is_cover) ?? p.images[0])?.url ?? sceneImage(p.title.length);
}

export default function PlotCard({ plot, index = 0 }: { plot: Plot; index?: number }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 18 });

  const sold = plot.status === 'sold';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.06 }}
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        whileHover={{ y: -6 }}
        className="group h-full"
      >
        <Link
          to={`/plots/${plot.id}`}
          className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-violet-100 transition-shadow group-hover:shadow-2xl group-hover:shadow-violet-200"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={coverOf(plot)}
              alt={plot.title}
              loading="lazy"
              className={`h-full w-full object-cover transition duration-700 group-hover:scale-110 ${sold ? 'grayscale-[60%]' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
            <StatusBadge status={plot.status} className="absolute left-3 top-3 shadow" />
            {plot.featured && !sold && (
              <span className="absolute right-3 top-3 rounded-full bg-gold-400 px-2.5 py-0.5 text-xs font-bold text-night-900 shadow">
                {'★'} Featured
              </span>
            )}
            {sold && (
              <div className="absolute -right-12 top-6 rotate-45 bg-rose-600 px-12 py-1 text-xs font-bold uppercase tracking-widest text-white shadow">
                Sold
              </div>
            )}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <span className="text-2xl font-bold drop-shadow">{formatINR(plot.price)}</span>
              {plot.images.length > 1 && (
                <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs backdrop-blur">
                  {'📷'} {plot.images.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <h3 className="line-clamp-1 text-lg font-semibold text-night-900">{plot.title}</h3>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <IconPin className="h-4 w-4 text-violet-500" />
              {plot.location}, {plot.city}
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-violet-50 pt-3 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <IconArea className="h-4 w-4 text-violet-500" />
                {formatArea(plot.area_value, plot.area_unit)}
              </span>
              <span className="text-xs text-slate-500">{ratePer(plot)}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
