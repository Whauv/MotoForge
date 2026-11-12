"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";

// Counts to the new value so a change reads as a change, not a swap.
export default function AnimatedNumber({ value, format = (v) => v.toFixed(1), className }) {
  const reduceMotion = useReducedMotion();
  // Settle exactly on the target; large values (prices) would otherwise
  // crawl through the last rupee.
  const restDelta = Math.max(0.005, Math.abs(value) * 1e-6);
  const spring = useSpring(value, { stiffness: 120, damping: 22, mass: 0.8, restDelta });
  const display = useTransform(spring, (latest) => format(latest));

  useEffect(() => {
    if (reduceMotion) {
      spring.jump(value);
    } else {
      spring.set(value);
    }
  }, [reduceMotion, spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
