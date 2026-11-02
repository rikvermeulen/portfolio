"use client";

/* eslint-disable @eslint-react/immutability -- framer-motion controls/MotionValues are mutated imperatively by design, never during render */
import { motion, useAnimation, useReducedMotion } from "framer-motion";

import type { SkipIconProps } from "./AudioControls.types.ts";
import type { Variants } from "framer-motion";

const inVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  tap: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, delay: 0.1, ease: "easeInOut" },
  },
};

const nextVariants: Variants = {
  initial: { x: 0, scale: 1 },
  tap: {
    scale: 1,
    x: "-8px",
    transition: { duration: 0.3, delay: 0.1, ease: "easeInOut" },
  },
};

const outVariants: Variants = {
  initial: { x: "-2px", scale: 1, opacity: 1 },
  tap: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

export function SkipIcon({ className }: SkipIconProps) {
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();

  const handleTap = async () => {
    if (prefersReducedMotion) {
      return;
    }
    await controls.start("tap");
    controls.set("initial");
  };

  return (
    <motion.svg
      animate={controls}
      aria-hidden="true"
      focusable="false"
      height={22.651}
      initial="initial"
      onTap={handleTap}
      viewBox="0 0 22.651 22.651"
      width={22.651}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M10.443,15.4a1.438,1.438,0,0,1,0-2.329L20.551,5.849a1.392,1.392,0,0,1,2.192,1.165V21.455a1.392,1.392,0,0,1-2.192,1.165Z"
        variants={inVariants}
        className="origin-left"
      />
      <motion.path
        d="M10.443,15.4a1.438,1.438,0,0,1,0-2.329L20.551,5.849a1.392,1.392,0,0,1,2.192,1.165V21.455a1.392,1.392,0,0,1-2.192,1.165Z"
        variants={nextVariants}
      />
      <motion.path
        d="M4.023,15.4a1.438,1.438,0,0,1,0-2.329L14.132,5.849a1.392,1.392,0,0,1,2.192,1.165V21.455a1.392,1.392,0,0,1-2.192,1.165Z"
        variants={outVariants}
        className="origin-right"
      />
    </motion.svg>
  );
}
