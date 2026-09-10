'use client';

import { motion } from 'framer-motion';
import ScoreGauge, { getStrength } from './ScoreGauge';

const STRENGTH_LABEL = { weak: 'ضعيف', moderate: 'متوسط', strong: 'ممتاز', none: '' };
const STRENGTH_BADGE = {
  weak: 'bg-danger/10 text-danger',
  moderate: 'bg-warning/10 text-warning',
  strong: 'bg-success/10 text-success',
  none: '',
};

function ScoreDigits({ score }) {
  const digits = String(Math.round(score)).split('');
  return (
    <div className="text-4xl font-display font-extrabold text-gray-900" dir="ltr">
      {digits.map((d, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
        >
          {d}
        </motion.span>
      ))}
    </div>
  );
}

function FinancialScoreCard({ title, description, score, index }) {
  const strength = getStrength(score);

  return (
    <motion.div
      className="bg-surface shadow-card rounded-xl p-6 w-full max-w-sm"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <h3 className="font-display font-bold text-lg">{title}</h3>
        {strength !== 'none' && (
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${STRENGTH_BADGE[strength]}`}>
            {STRENGTH_LABEL[strength]}
          </span>
        )}
      </div>

      <div className="relative mb-4">
        <ScoreGauge score={score} max={100} />
        <div className="absolute bottom-0 w-full text-center">
          <ScoreDigits score={score} />
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">من 100</div>
        </div>
      </div>

      <p className="text-gray-500 text-sm text-center min-h-[3.5rem]">{description}</p>
    </motion.div>
  );
}

export default function FinancialScoreCards({ cards }) {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-4">
      {cards.map((card, i) => (
        <FinancialScoreCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}
