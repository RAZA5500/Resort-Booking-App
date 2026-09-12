import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

export const Gallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const step = (delta) => setActive((i) => (i + delta + images.length) % images.length);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- step is stable enough here
  }, [lightbox, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Desktop: a mosaic. Mobile: a single hero image. */}
      <div className="relative">
      <div className="grid gap-2 overflow-hidden rounded-3xl sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="group relative aspect-[4/3] overflow-hidden sm:col-span-2 sm:row-span-2 sm:aspect-auto"
        >
          <img
            src={images[0]}
            alt={`${name} — main view`}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-ink-950/0 transition-colors group-hover:bg-ink-950/20" />
        </button>

        {images.slice(1, 5).map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setActive(i + 1);
              setLightbox(true);
            }}
            className="group relative hidden aspect-[4/3] overflow-hidden sm:block"
          >
            <img
              src={src}
              alt={`${name} — view ${i + 2}`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-ink-950/0 transition-colors group-hover:bg-ink-950/20" />
          </button>
        ))}

      </div>

        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="glass absolute right-4 bottom-4 flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/15"
        >
          <Expand className="size-3.5" />
          All {images.length} photos
        </button>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex flex-col bg-ink-950/97 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <p className="text-sm text-slate-400">
                {active + 1} / {images.length} · {name}
              </p>
              <button
                type="button"
                onClick={() => setLightbox(false)}
                aria-label="Close gallery"
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/8 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="glass absolute left-4 grid size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
              >
                <ChevronLeft className="size-5" />
              </button>

              <motion.img
                key={images[active]}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={images[active]}
                alt={`${name} — view ${active + 1}`}
                className="max-h-full max-w-full rounded-2xl object-contain"
              />

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="glass absolute right-4 grid size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="flex justify-center gap-2 overflow-x-auto px-6 pb-6">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`size-16 shrink-0 overflow-hidden rounded-lg ring-1 transition-all ${
                    i === active ? 'ring-brand-400 opacity-100' : 'ring-white/10 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;
