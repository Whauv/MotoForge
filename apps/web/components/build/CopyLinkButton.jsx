"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function CopyLinkButton() {
  const [state, setState] = useState("idle");

  useEffect(() => {
    if (state === "idle") {
      return undefined;
    }
    const timer = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  const label = { idle: "Copy build link", copied: "Link copied", failed: "Copy failed, use the address bar" }[state];

  return (
    <button
      type="button"
      onClick={copy}
      className="relative shrink-0 overflow-hidden rounded-panel border border-graphite/80 px-3 py-2 text-sm font-semibold transition-colors hover:bg-graphite hover:text-bench"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          aria-live="polite"
          className="block"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
