export const warpVariants = {
  exit: {
    opacity: 0,
    scale: 1.1,
    filter: 'blur(8px)',
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
  enter: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 },
  },
}

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
}
