import React, { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

export default function AnimatedCounter({ value = 0, decimals = 1, className = '' }) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 70,
    damping: 18,
    restDelta: 0.001,
  });

  const displayVal = useTransform(springVal, (current) => {
    return Number(current).toFixed(decimals);
  });

  useEffect(() => {
    motionVal.set(Number(value || 0));
  }, [value, motionVal]);

  return <motion.span className={className}>{displayVal}</motion.span>;
}
