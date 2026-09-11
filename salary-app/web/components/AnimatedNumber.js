'use client';

import { useEffect, useRef } from 'react';
import { animate, useMotionValue } from 'framer-motion';

export default function AnimatedNumber({ value, format }) {
  const mv = useMotionValue(0);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.textContent = format(0);
    const controls = animate(mv, value, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref}>{format(value)}</span>;
}
