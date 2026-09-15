import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { ToastContext } from './toast-context';

const TONES = {
  success: { Icon: CheckCircle2, ring: 'ring-emerald-400/25', text: 'text-emerald-700' },
  info: { Icon: Info, ring: 'ring-brand-400/25', text: 'text-brand-600' },
  error: { Icon: TriangleAlert, ring: 'ring-rose-400/25', text: 'text-rose-600' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'success', ttl = 4200) => {
      const id = `t${seq.current++}`;
      setToasts((list) => [...list.slice(-3), { id, message, tone }]);
      if (ttl) setTimeout(() => dismiss(id), ttl);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (m) => push(m, 'success'),
      info: (m) => push(m, 'info'),
      error: (m) => push(m, 'error', 6000),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
        <AnimatePresence initial={false}>
          {toasts.map(({ id, message, tone }) => {
            const { Icon, ring, text } = TONES[tone] || TONES.info;
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                role="status"
                className={`glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 ring-1 ${ring} shadow-2xl shadow-ink-900/12`}
              >
                <Icon className={`mt-0.5 size-4 shrink-0 ${text}`} strokeWidth={2.2} />
                <p className="flex-1 text-sm leading-snug text-ink-800">{message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(id)}
                  aria-label="Dismiss"
                  className="text-ink-500 transition-colors hover:text-ink-900"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
