import { useProgress } from '../../lib/progress';
import { Icon } from './Icon';

export function Toasts() {
  const { toasts, dismissToast } = useProgress();

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <span className="toast-icon">
            <Icon name={toast.tone === 'badge' ? 'award' : toast.tone === 'xp' ? 'bolt' : 'spark'} size={16} />
          </span>
          <span className="toast-copy">
            <strong>{toast.title}</strong>
            {toast.body && <span>{toast.body}</span>}
          </span>
          <button type="button" className="toast-close" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
