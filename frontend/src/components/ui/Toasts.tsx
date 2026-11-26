import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '../../lib/progress';
import { EASE_OUT, POP } from '../../lib/motion';
import { Icon } from './Icon';

export function Toasts() {
  const { toasts, dismissToast } = useProgress();

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast--${toast.tone}`}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: POP }}
            exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.22, ease: EASE_OUT } }}
          >
          <span className="toast-icon">
            <Icon name={toast.tone === 'badge' ? 'award' : toast.tone === 'xp' ? 'bolt' : 'spark'} size={16} />
          </span>
          <span className="toast-copy">
            <strong>{toast.title}</strong>
            {toast.body && <span>{toast.body}</span>}
          </span>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss"
            >
              <Icon name="close" size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
