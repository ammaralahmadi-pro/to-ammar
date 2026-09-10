'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { formatCurrency } from '../lib/format';

const defaultProps = {
  baseSalary: 0,
  extraIncome: 0,
  outerDotsCount: 48,
  innerDotsCount: 36,
  enableAnimations: true,
};

function generateDots(count, radius, centerX, centerY) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const x = Math.round((centerX + radius * Math.cos(angle)) * 1000) / 1000;
    const y = Math.round((centerY + radius * Math.sin(angle)) * 1000) / 1000;
    dots.push({ x, y, angle, delay: i * 0.02 });
  }
  return dots;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const dotVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 0.6, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function IncomeSummaryCard(props) {
  const { baseSalary, extraIncome, outerDotsCount, innerDotsCount, enableAnimations, onMoreDetails } = {
    ...defaultProps,
    ...props,
  };

  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const outerDots = generateDots(outerDotsCount, 185, 203, 200);
  const innerDots = generateDots(innerDotsCount, 155, 203, 200);
  const total = baseSalary + extraIncome;

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={shouldAnimate ? 'hidden' : 'visible'}
      animate="visible"
      variants={shouldAnimate ? containerVariants : {}}
    >
      <div className="bg-surface border border-gray-100 rounded-xl overflow-hidden shadow-card">
        <div className="relative pl-4 pr-8 pb-4 pt-8 overflow-hidden">
          <div className="absolute inset-0 bg-surface backdrop-blur-[2px] rounded-lg" />

          <div className="relative w-full aspect-square max-w-[20rem] mx-auto">
            <svg className="w-full h-full" viewBox="0 0 448 448">
              {outerDots.map((dot, i) => (
                <motion.circle
                  key={`outer-${i}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="6"
                  fill="#5A8CEF"
                  variants={shouldAnimate ? dotVariants : {}}
                  initial="hidden"
                  animate="visible"
                />
              ))}
              {innerDots.map((dot, i) => (
                <motion.circle
                  key={`inner-${i}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="6"
                  fill="#4B7A63"
                  variants={shouldAnimate ? dotVariants : {}}
                  initial="hidden"
                  animate="visible"
                />
              ))}
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <motion.div
                  className="text-sm font-medium text-gray-500 mb-1"
                  initial={shouldAnimate ? { opacity: 0, y: -10, scale: 0.95 } : {}}
                  animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 25, mass: 0.6 }}
                >
                  إجمالي الدخل
                </motion.div>
                <motion.div
                  className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900"
                  initial={shouldAnimate ? { opacity: 0, y: 20, scale: 0.8, filter: 'blur(4px)' } : {}}
                  animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : {}}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
                >
                  {formatCurrency(total)}
                </motion.div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-start justify-between mt-4 mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-0.5 h-4 rounded-full"
                  style={{ backgroundColor: '#5A8CEF' }}
                  initial={shouldAnimate ? { opacity: 0, scaleY: 0 } : {}}
                  animate={shouldAnimate ? { opacity: 1, scaleY: 1 } : {}}
                  transition={{ delay: 0.4, type: 'spring' }}
                />
                <motion.div
                  className="text-sm font-medium text-gray-500"
                  initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
                  animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                >
                  الراتب الأساسي
                </motion.div>
              </div>
              <motion.div
                className="text-xl font-bold text-gray-900"
                initial={shouldAnimate ? { opacity: 0, y: -10 } : {}}
                animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
              >
                {formatCurrency(baseSalary)}
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-0.5 h-4 rounded-full"
                  style={{ backgroundColor: '#4B7A63' }}
                  initial={shouldAnimate ? { opacity: 0, scaleY: 0 } : {}}
                  animate={shouldAnimate ? { opacity: 1, scaleY: 1 } : {}}
                  transition={{ delay: 0.8, type: 'spring' }}
                />
                <motion.div
                  className="text-sm font-medium text-gray-500"
                  initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
                  animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.9 }}
                >
                  دخل إضافي
                </motion.div>
              </div>
              <motion.div
                className="text-xl font-bold text-gray-900"
                initial={shouldAnimate ? { opacity: 0, y: -10 } : {}}
                animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.0 }}
              >
                {formatCurrency(extraIncome)}
              </motion.div>
            </div>
          </div>

          {onMoreDetails && (
            <motion.button
              className="relative z-10 w-full bg-transparent border border-gray-200 hover:bg-surface2 text-gray-800 px-4 py-2 rounded-lg font-medium"
              initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.1 }}
              whileHover={shouldAnimate ? { scale: 1.02 } : {}}
              whileTap={shouldAnimate ? { scale: 0.98 } : {}}
              onClick={onMoreDetails}
            >
              تفاصيل أكثر
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
