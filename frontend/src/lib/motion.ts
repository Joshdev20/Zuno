import type { Transition, Variants } from 'framer-motion';

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const smooth: Transition = { duration: 0.6, ease: EASE_OUT };
export const quick: Transition = { duration: 0.28, ease: EASE_OUT };

export const SPRING: Transition = { type: 'spring', stiffness: 320, damping: 30, mass: 0.7 };
export const SOFT_SPRING: Transition = { type: 'spring', stiffness: 180, damping: 26, mass: 0.9 };
export const POP: Transition = { type: 'spring', stiffness: 520, damping: 24, mass: 0.6 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: smooth },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: smooth },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  shown: { opacity: 1, scale: 1, y: 0, transition: { ...smooth, duration: 0.5 } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -14 },
  shown: { opacity: 1, x: 0, transition: smooth },
};

export const wordUp: Variants = {
  hidden: { y: '115%' },
  shown: { y: 0, transition: { duration: 0.78, ease: EASE_OUT } },
};

export const stagger = (delay = 0, gap = 0.07): Variants => ({
  hidden: {},
  shown: { transition: { delayChildren: delay, staggerChildren: gap } },
});

export const viewportOnce = { once: true, margin: '-80px 0px -60px 0px' } as const;
export const viewportSoft = { once: true, margin: '-40px 0px -40px 0px' } as const;
