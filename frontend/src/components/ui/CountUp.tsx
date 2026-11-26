import { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue, useReducedMotion, useTransform, motion } from 'framer-motion';

type Props = {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

export function CountUp({ value, duration = 1.2, decimals = 0, prefix = '', suffix = '' }: Props) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(reduceMotion ? value : 0);
  const text = useTransform(count, (latest) => `${prefix}${latest.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, value, duration, reduceMotion, count]);

  return (
    <motion.span ref={ref} aria-label={`${prefix}${value}${suffix}`}>
      {text}
    </motion.span>
  );
}
