"use client";

import { useCallback, useId } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";

import type { DrawerProps } from "./Drawer.types.ts";
import type { DragControls, PanInfo } from "framer-motion";

import { FocusTrap } from "@/components/FocusTrap/index.ts";
import Glass from "@/components/Glass/index.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/index.ts";
import classnames from "@/utils/classnames/index.ts";

const DISMISS_OFFSET = 56;
const DISMISS_VELOCITY = 480;

const SHEET_SPRING = { type: "spring", stiffness: 420, damping: 40 } as const;

function shouldDismiss({
  offset,
  velocity,
}: Pick<PanInfo, "offset" | "velocity">) {
  return offset.y > DISMISS_OFFSET || velocity.y > DISMISS_VELOCITY;
}

/** Contained slide-up sheet. Fills the nearest positioned, overflow-hidden ancestor. */
export default function Drawer({
  isOpen,
  onOpenChange,
  title,
  description,
  header,
  children,
  footer,
  className,
}: DrawerProps) {
  const reduceMotion = usePrefersReducedMotion();
  const dragControls = useDragControls();
  const titleId = useId();
  // Memoised so FocusTrap's effect (which depends on onEscape) doesn't tear
  // down and re-run — and re-steal focus — on every Drawer render.
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const sheetEnter = reduceMotion ? { opacity: 0 } : { y: "100%" };
  const sheetActive = reduceMotion ? { opacity: 1 } : { y: 0 };
  const sheetExit = reduceMotion ? { opacity: 0 } : { y: "100%" };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent catcher: tapping the exposed tile (the peek above the
              sheet) closes the drawer. No dimming, so the tile behind never
              animates when the drawer opens. */}
          <button
            aria-label="Close"
            onClick={close}
            tabIndex={-1}
            type="button"
            className="absolute inset-0 z-20 cursor-default"
          />

          <motion.dialog
            key="drawer-sheet"
            animate={sheetActive}
            aria-label={header ? title : undefined}
            aria-labelledby={header ? undefined : titleId}
            aria-modal="true"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragControls={dragControls}
            dragElastic={{ top: 0, bottom: 0.5 }}
            dragListener={false}
            exit={sheetExit}
            initial={sheetEnter}
            onDragEnd={(_event, info) => {
              if (shouldDismiss(info)) {
                close();
              }
            }}
            open
            transition={SHEET_SPRING}
            className={classnames(
              "absolute inset-x-0 top-4 bottom-0 z-30 m-0 flex size-auto touch-none flex-col overflow-hidden rounded-3xl bg-transparent p-0 text-white shadow-2xl",
              className,
            )}
          >
            <Glass blur={16} intensity={1} radius={24} tint="dark" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-black/50"
            />

            <FocusTrap
              isActive={isOpen}
              onEscape={close}
              className="relative z-10 flex min-h-0 flex-1 flex-col"
            >
              <DrawerHandle dragControls={dragControls} onClose={close} />

              {header ? (
                <div className="shrink-0">{header}</div>
              ) : (
                <header className="shrink-0 px-4 pb-2 text-center">
                  <p id={titleId} className="text-sm font-semibold">
                    {title}
                  </p>
                  {description && (
                    <p className="mt-0.5 text-xs text-white/50">
                      {description}
                    </p>
                  )}
                </header>
              )}

              <div className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto px-3 pb-3 [&::-webkit-scrollbar]:hidden">
                {children}
              </div>

              {footer ? (
                <footer className="shrink-0 p-3">{footer}</footer>
              ) : null}
            </FocusTrap>
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerHandle({
  dragControls,
  onClose,
}: {
  readonly dragControls: DragControls;
  readonly onClose: () => void;
}) {
  return (
    <button
      aria-label="Close"
      onClick={onClose}
      onPointerDown={(event) => dragControls.start(event)}
      type="button"
      className="group relative z-10 flex shrink-0 cursor-grab touch-none items-center justify-center pt-2.5 pb-1.5 focus-visible:outline-none active:cursor-grabbing"
    >
      <span className="h-1 w-9 rounded-full bg-white/35 transition-colors group-hover:bg-white/50 group-focus-visible:bg-white/70" />
    </button>
  );
}
