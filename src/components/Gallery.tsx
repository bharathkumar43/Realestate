import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import type { PlotImage } from '../lib/types';
import { IconChevronL, IconChevronR, IconX } from './ui';

export default function Gallery({ images, title }: { images: PlotImage[]; title: string }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [full, setFull] = useState(false);
  const n = images.length;

  const go = useCallback(
    (d: number) => setState(([i]) => [(i + d + n) % n, d]),
    [n],
  );

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Escape') setFull(false);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [go]);

  if (!n) return null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  const slide = (big: boolean) => (
    <div className={`relative overflow-hidden ${big ? 'h-full w-full' : 'aspect-[16/10] rounded-3xl bg-violet-100'}`}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.img
          key={index}
          src={images[index].url}
          alt={`${title} photo ${index + 1}`}
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? '100%' : d < 0 ? '-100%' : 0, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          drag={n > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={onDragEnd}
          onClick={() => !big && setFull(true)}
          className={`absolute inset-0 h-full w-full select-none ${big ? 'object-contain' : 'cursor-zoom-in object-cover'}`}
          draggable={false}
        />
      </AnimatePresence>
      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-night-900 shadow backdrop-blur transition hover:scale-110"
          >
            <IconChevronL />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-night-900 shadow backdrop-blur transition hover:scale-110"
          >
            <IconChevronR />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      {slide(false)}
      {n > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((im, i) => (
            <button
              key={im.id}
              type="button"
              onClick={() => setState([i, i > index ? 1 : -1])}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition ${i === index ? 'ring-violet-500' : 'opacity-70 ring-transparent hover:opacity-100'}`}
            >
              <img src={im.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {full && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setFull(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <IconX className="h-6 w-6" />
            </button>
            <p className="absolute left-4 top-5 z-10 text-sm text-white/70">
              {index + 1} / {n}
            </p>
            {slide(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
