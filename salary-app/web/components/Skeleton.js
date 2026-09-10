'use client';

import { AnimatePresence, motion } from 'framer-motion';

export function Skeleton({ className = '', animate = true }) {
  return (
    <div
      className={`rounded-md bg-gray-100 ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

export function SkeletonReveal({ loading, skeleton, children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
