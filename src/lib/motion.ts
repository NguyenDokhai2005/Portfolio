import type { Variants } from 'framer-motion';

/** The single easing curve the whole site is built on. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Hero / About: staggered blur-up reveal. */
export const containerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16 } },
};

export const blurUpItem: Variants = {
  hidden: { opacity: 0, y: 35, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, ease: EASE },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 70, rotate: 2 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 1.2, ease: EASE },
  },
};

export const popCard: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 25 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

/** Contact / Comments: subtle rise. */
export const riseStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const riseItemSm: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
