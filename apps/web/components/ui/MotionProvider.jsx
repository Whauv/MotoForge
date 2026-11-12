"use client";

import { MotionConfig } from "motion/react";

// Honour the OS "reduce motion" setting for every motion component.
export default function MotionProvider({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 34 }}>
      {children}
    </MotionConfig>
  );
}
