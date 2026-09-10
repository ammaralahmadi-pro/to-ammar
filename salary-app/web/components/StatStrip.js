'use client';

import { motion } from 'framer-motion';

export default function StatStrip({ items }) {
  return (
    <div className="bg-surface shadow-card rounded-2xl px-2 sm:px-0 flex flex-wrap sm:flex-nowrap divide-x divide-gray-100">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="flex-1 min-w-[9rem] px-4 sm:px-6 py-4"
        >
          <p className="text-gray-500 text-xs mb-1">{item.label}</p>
          <p className={`font-display font-extrabold text-xl sm:text-2xl ${item.color || 'text-gray-900'}`}>
            {item.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
