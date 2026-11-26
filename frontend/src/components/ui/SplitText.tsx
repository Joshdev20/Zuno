import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { EASE_OUT, wordUp } from '../../lib/motion';

type Props = {
  text: string;
  emWords?: string[];
  delay?: number;
  gap?: number;
  className?: string;
  as?: 'span' | 'div';
};

export function SplitText({ text, emWords = [], delay = 0, gap = 0.045, className, as = 'span' }: Props) {
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  const container: Variants = {
    hidden: {},
    shown: { transition: { delayChildren: delay, staggerChildren: gap } },
  };

  const Wrapper = as === 'div' ? motion.div : motion.span;

  return (
    <Wrapper
      className={className ? `split ${className}` : 'split'}
      variants={container}
      initial={reduceMotion ? false : 'hidden'}
      animate="shown"
      aria-label={text}
    >
      {words.map((word, index) => (
        <span className="split-word" key={`${word}-${index}`} aria-hidden="true">
          <motion.span
            className="split-inner"
            variants={wordUp}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.78, ease: EASE_OUT }}
          >
            {emWords.includes(word.replace(/[^a-zA-Z]/g, '')) ? <em>{word}</em> : word}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  );
}
