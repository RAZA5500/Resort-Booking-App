import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({ open, onClose, title, description, size = 'md', children, footer }) => {
  const titleId = useId();
  const panelRef = useRef(null);

  // Callers pass a fresh `onClose` closure every render; holding it in a ref
  // keeps the effect below keyed to `open` alone, so a re-render while the
  // dialog is open cannot yank focus back out of the field being typed in.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Lock the page behind the dialog while it is open, and keep focus inside it.
  useEffect(() => {
    if (!open) return undefined;

    const opener = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      // Wrap Tab at the edges so focus cannot escape to the page behind.
      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
          {/* Spotlight backdrop — radial gradient pulls focus to center. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(5,7,15,0.75), rgba(5,7,15,0.92))',
            }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 32, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className={`glass relative flex max-h-[92vh] w-full ${widths[size]} flex-col overflow-hidden rounded-t-3xl shadow-2xl shadow-black/70 sm:rounded-3xl`}
          >
            {/* Luminous top border accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />

            <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
              <div>
                <h2 id={titleId} className="display text-2xl text-white">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mt-1 rounded-full p-2 text-slate-500 transition-all hover:bg-white/8 hover:text-white hover:rotate-90"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-white/8 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const ConfirmDialog = ({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', variant = 'danger', loading = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>Keep it</Button>
        <Button variant={variant} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </>
    }
  >
    <p className="text-sm leading-relaxed text-slate-300">{message}</p>
  </Modal>
);

export default Modal;
