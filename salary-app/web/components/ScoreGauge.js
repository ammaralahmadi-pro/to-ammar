'use client';

import { useEffect, useRef } from 'react';

const STRENGTH_COLORS = {
  weak: ['#f87171', '#dc2626'],
  moderate: ['#fbbf24', '#f59e0b'],
  strong: ['#4ade80', '#16a34a'],
};

function getStrength(score) {
  if (score === null) return 'none';
  if (score >= 80) return 'strong';
  if (score >= 40) return 'moderate';
  return 'weak';
}

function circumference(r) {
  return 2 * Math.PI * r;
}

export default function ScoreGauge({ score, max = 100 }) {
  const strokeRef = useRef(null);
  const gradientId = useRef(`grad-${Math.random().toString(36).slice(2, 8)}`);
  const radius = 45;
  const dist = circumference(radius);
  const distHalf = dist / 2;
  const distFourth = distHalf / 2;
  const strength = getStrength(score);
  const colors = STRENGTH_COLORS[strength] || ['#666b82', '#42475d'];
  const strokeDashoffset = score !== null ? Math.min(score / max, 1) * -distHalf : -distFourth;

  useEffect(() => {
    if (!strokeRef.current) return;
    strokeRef.current.animate(
      [
        { strokeDashoffset: '0', offset: 0 },
        { strokeDashoffset: '0', offset: 0.25 },
        { strokeDashoffset: strokeDashoffset.toString() },
      ],
      { duration: 1200, easing: 'cubic-bezier(0.65,0,0.35,1)', fill: 'forwards' },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, max]);

  return (
    <svg className="block mx-auto w-full max-w-[13rem] h-32" viewBox="0 0 100 50" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId.current} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth="10" transform="translate(50, 50.5)">
        <circle stroke="#252a3b" r={radius} />
        <circle
          ref={strokeRef}
          stroke={`url(#${gradientId.current})`}
          strokeDasharray={`${distHalf} ${distHalf}`}
          r={radius}
        />
      </g>
    </svg>
  );
}

export { getStrength };
