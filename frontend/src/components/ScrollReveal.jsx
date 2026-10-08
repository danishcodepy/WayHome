import { Children } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function ScrollReveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, scale: 0.985 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -6% 0px' }}
      transition={reduced ? { duration: 0 } : { duration: 0.52, delay: Math.min(0.18, delay), ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ResultsGrid({ children, className = 'premium-property-grid' }) {
  const reduced = useReducedMotion();
  return (
    <motion.div layout={!reduced} className={className}>
      <AnimatePresence mode="popLayout" initial={false}>
        {Children.toArray(children).map((child, index) => (
          <motion.div
            key={child.key}
            layout={!reduced}
            className="result-item"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.12, margin: '0px 0px -8% 0px' }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
            transition={reduced ? { duration: 0.01 } : {
              delay: Math.min(index * 0.045, 0.18),
              type: 'spring',
              stiffness: 340,
              damping: 24,
              mass: 0.7,
              layout: { duration: 0.22, ease: 'easeOut' }
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
