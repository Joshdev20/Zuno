import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT } from '../../lib/motion';
import { Icon } from './Icon';

export function Accordion({ q, a, index = 0 }: { q: string; a: string; index?: number }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const id = useId();

  return (
    <motion.div
      className={`faq-item${open ? ' is-open' : ''}`}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(index * 0.04, 0.24) }}
    >
      <button
        type="button"
        className="faq-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{q}</span>
        <motion.span
          className="faq-toggle"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 26 }}
        >
          <Icon name="chevronDown" size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="faq-answer"
            initial={reduceMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { height: 'auto', opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: EASE_OUT }}
            style={{ overflow: 'hidden' }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
