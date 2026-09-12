import { useEffect } from 'react';
import { useBooking } from '../context/bookingStore';

const TONES = {
  success: { ring: 'ring-emerald-400/30', dot: 'bg-emerald-400', icon: '✓' },
  info: { ring: 'ring-indigo-400/30', dot: 'bg-indigo-400', icon: 'i' },
  error: { ring: 'ring-rose-400/30', dot: 'bg-rose-400', icon: '!' },
};

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const tone = TONES[toast.tone] || TONES.info;

  return (
    <div
      role="status"
      className={`flex items-start gap-3 w-[320px] px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl ring-1 ${tone.ring} shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-[toast-in_0.3s_ease-out]`}
    >
      <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full ${tone.dot} text-slate-950 text-[11px] font-bold grid place-items-center`}>
        {tone.icon}
      </span>
      <p className="text-sm text-slate-200 leading-snug flex-1">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-slate-500 hover:text-white transition-colors leading-none"
      >
        ×
      </button>
    </div>
  );
};

const Toaster = () => {
  const { toasts, dismissToast } = useBooking();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={() => dismissToast(toast.id)} />
        </div>
      ))}
    </div>
  );
};

export default Toaster;
