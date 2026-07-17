import type { SheetVariants } from "./Drawer.types.ts";
import type { Transition } from "framer-motion";

/** Spring driving the sheet's slide-up entrance and drag settle. */
export const SHEET_SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 40,
};

/**
 * Enter/active/exit targets for the sheet. Slides from the bottom by default;
 * fades in place when the user prefers reduced motion.
 */
export function getSheetVariants(reduceMotion: boolean): SheetVariants {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };
}
