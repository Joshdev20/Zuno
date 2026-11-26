import type { Transition, Variants } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export const smooth: Transition = { duration: 0.6, ease: EASE };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: smooth },
};

export const stagger = (delay = 0, gap = 0.07): Variants => ({
  hidden: {},
  shown: { transition: { delayChildren: delay, staggerChildren: gap } },
});

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  shown: { opacity: 1, scale: 1, y: 0, transition: { ...smooth, duration: 0.5 } },
};

export const viewportOnce = { once: true, margin: '-80px 0px -60px 0px' } as const;
