import type { Transition, Variants } from "framer-motion";

/** Navigation direction: `1` advances (next), `-1` goes back (previous). */
export type FlipDirection = -1 | 1;

/**
 * Depth transition for the recipe card swap — same gesture both ways, just
 * mirrored.
 *
 * The new recipe always falls over the old one: it drops in at full size, on top
 * (`zIndex: 2`), and fades in, while the card it lands on recedes underneath
 * (`zIndex: 1`), scaling out a touch and fading, as if pushed back into the
 * stack. The only thing direction changes is which edge the new card falls in
 * from — from above going forward (`dir > 0`, chevron down), from below going
 * back (`dir < 0`). The falling card never scales, so it never zooms or shrinks.
 *
 * Pass the direction as `custom` on both `AnimatePresence` and the `motion`
 * element so the entering and exiting cards resolve the right variant.
 */
export const cardVariants: Variants = {
  enter: (dir: FlipDirection) => ({
    opacity: 0,
    y: dir > 0 ? "-14%" : "14%",
    scale: 1,
    zIndex: 2,
  }),
  center: { opacity: 1, y: "0%", scale: 1, zIndex: 2 },
  exit: { opacity: 0, y: "0%", scale: 0.92, zIndex: 1 },
};

/**
 * The incoming card drops with a soft spring settle; the outgoing card eases out
 * and back on Apple's smooth curve. Fades are gentle so the two cross cleanly.
 */
export const cardTransition: Transition = {
  y: { type: "spring", stiffness: 280, damping: 30, mass: 0.9 },
  scale: { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
  opacity: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
};
