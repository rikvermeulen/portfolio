"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import type { GlassLightRefs } from "./Glass.types.ts";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/index.ts";

/**
 * Interactive ("liquid") tuning. Apple's Liquid Glass illuminates from within
 * on touch, gathers a specular hotspot under the pointer, and follows the
 * finger with a gel-like spring that rebounds off the inner walls. These
 * constants drive that behaviour:
 *
 * - `STIFFNESS`/`DAMPING` are a critically-underdamped spring: damping < 1 lets
 *   the hotspot overshoot its target and spring back, which — combined with the
 *   inset clamp on the target (see `EDGE_INSET`) — reads as the light bouncing
 *   off the glass edge instead of sliding out of it.
 * - `ACTIVE_EASE`/`PRESS_EASE` are simple lerp factors for the hover-illuminate
 *   and press-squish ramps.
 */
const SPRING_STIFFNESS = 0.18;
const SPRING_DAMPING = 0.72;
const ACTIVE_EASE = 0.14;
const PRESS_EASE = 0.22;
/** Fraction of the short side the hotspot target is kept inside the rim. */
const EDGE_INSET = 0.12;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

interface Spring {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Eased {
  value: number;
  target: number;
}

/**
 * Drives the interactive specular light for a glass element. A single rAF loop
 * advances a spring-followed hotspot plus hover/press ramps, writing the result
 * to CSS custom properties (`--glass-light-x/y`, `--glass-active`,
 * `--glass-press`) that the overlay layers read — so the animation never causes
 * a React re-render. The loop self-parks when at rest and drops the
 * (compositor-expensive) overlays out of the layer tree until the next
 * press/focus. No-op when `interactive` is false.
 */
export function useGlassLight(
  rootRef: React.RefObject<HTMLDivElement | null>,
  interactive: boolean,
): GlassLightRefs {
  const illuminateRef = useRef<HTMLSpanElement>(null);
  const hotspotRef = useRef<HTMLSpanElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const reduceRef = useRef(prefersReducedMotion);
  useLayoutEffect(() => {
    reduceRef.current = prefersReducedMotion;
  });

  // Kept in refs so the rAF loop mutates them without re-rendering.
  const animationFrameRef = useRef<number | null>(null);
  const springRef = useRef<Spring>({ x: 0, y: 0, vx: 0, vy: 0 });
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const activeRef = useRef<Eased>({ value: 0, target: 0 });
  const pressRef = useRef<Eased>({ value: 0, target: 0 });

  useEffect(() => {
    if (!interactive) {
      return;
    }
    const element = rootRef.current;
    const parent = element?.parentElement;
    if (!element || !parent) {
      return;
    }

    // One rAF loop advances the spring + ramps and writes the CSS vars. It runs
    // only while something is still moving, then parks itself until the next
    // pointer event re-arms it — no idle frames when the glass is at rest.
    const tick = (): void => {
      const spring = springRef.current;
      const pointer = pointerRef.current;
      const active = activeRef.current;
      const press = pressRef.current;
      const reduce = reduceRef.current;

      if (pointer) {
        if (reduce) {
          // Reduced motion: snap, no overshoot/bounce.
          spring.x = pointer.x;
          spring.y = pointer.y;
          spring.vx = 0;
          spring.vy = 0;
        } else {
          spring.vx =
            (spring.vx + (pointer.x - spring.x) * SPRING_STIFFNESS) *
            SPRING_DAMPING;
          spring.vy =
            (spring.vy + (pointer.y - spring.y) * SPRING_STIFFNESS) *
            SPRING_DAMPING;
          spring.x += spring.vx;
          spring.y += spring.vy;
        }
      }

      const ease = reduce ? 1 : ACTIVE_EASE;
      active.value += (active.target - active.value) * ease;
      press.value += (press.target - press.value) * (reduce ? 1 : PRESS_EASE);

      element.style.setProperty("--glass-light-x", `${spring.x.toFixed(2)}px`);
      element.style.setProperty("--glass-light-y", `${spring.y.toFixed(2)}px`);
      element.style.setProperty("--glass-active", active.value.toFixed(3));
      element.style.setProperty("--glass-press", press.value.toFixed(3));

      const settling =
        Math.abs(spring.vx) > 0.02 ||
        Math.abs(spring.vy) > 0.02 ||
        Math.abs(active.target - active.value) > 0.002 ||
        Math.abs(press.target - press.value) > 0.002;

      if (settling || active.target > 0 || press.target > 0) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
      } else {
        animationFrameRef.current = null;
        // Fully at rest: drop the mix-blend overlays out of the layer tree so
        // they cost nothing to composite while scrolling.
        if (illuminateRef.current) {
          illuminateRef.current.style.display = "none";
        }
        if (hotspotRef.current) {
          hotspotRef.current.style.display = "none";
        }
      }
    };

    const wake = (): void => {
      // Re-arm the overlays before the ramp runs so the press/focus glow can
      // fade in from opacity 0.
      if (illuminateRef.current) {
        illuminateRef.current.style.display = "block";
      }
      if (hotspotRef.current) {
        hotspotRef.current.style.display = "block";
      }
      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
      }
    };

    // Clamp the spring *target* to an inset inside the rounded rect: the light
    // never targets the very edge, so when the pointer races to the rim the
    // underdamped spring overshoots toward the clamp and rebounds — the
    // "bounces off the inner walls" feel.
    const aim = (event: PointerEvent): void => {
      const { height, left, top, width } = element.getBoundingClientRect();
      if (width < 1 || height < 1) {
        return;
      }
      const inset = Math.min(width, height) * EDGE_INSET;
      pointerRef.current = {
        x: clamp(event.clientX - left, inset, width - inset),
        y: clamp(event.clientY - top, inset, height - inset),
      };
    };

    // The light is active-only and explicitly NOT a mouse-hover effect. It turns
    // on for the pressed/held/touch state (pointerdown) and the keyboard focus
    // state (focusin), and off on release/blur. `pressed` gates pointer tracking
    // so the light follows the input ONLY while physically held — a bare hover,
    // or a mouse merely moving over an already-focused element, does nothing.
    let pressed = false;

    const snapTo = (x: number, y: number): void => {
      springRef.current = { x, y, vx: 0, vy: 0 };
      pointerRef.current = { x, y };
    };

    const handleDown = (event: PointerEvent): void => {
      pressed = true;
      aim(event);
      const pointer = pointerRef.current;
      // Gather the light under the input on press instead of flying it in from
      // a stale position.
      if (pointer) {
        snapTo(pointer.x, pointer.y);
      }
      activeRef.current.target = 1;
      pressRef.current.target = 1;
      wake();
    };

    const handleMove = (event: PointerEvent): void => {
      // Follow ONLY while physically pressed/held — never on hover.
      if (!pressed) {
        return;
      }
      aim(event);
      wake();
    };

    const handleUp = (): void => {
      pressed = false;
      activeRef.current.target = 0;
      pressRef.current.target = 0;
      wake();
    };

    // Keyboard focus state: glow centred (no pointer to follow) and no pointer
    // tracking, so tabbing to the control lights it without turning subsequent
    // mouse movement into a hover-follow.
    const handleFocus = (): void => {
      const { width, height } = element.getBoundingClientRect();
      snapTo(width / 2, height / 2);
      activeRef.current.target = 1;
      pressRef.current.target = 1;
      wake();
    };

    const handleBlur = (): void => {
      if (pressed) {
        return;
      }
      activeRef.current.target = 0;
      pressRef.current.target = 0;
      wake();
    };

    parent.addEventListener("pointerdown", handleDown);
    parent.addEventListener("pointermove", handleMove);
    parent.addEventListener("focusin", handleFocus);
    parent.addEventListener("focusout", handleBlur);
    // Release on window so a press that ends off the element still clears —
    // otherwise the light could stick on after dragging out and releasing.
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      parent.removeEventListener("pointerdown", handleDown);
      parent.removeEventListener("pointermove", handleMove);
      parent.removeEventListener("focusin", handleFocus);
      parent.removeEventListener("focusout", handleBlur);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [interactive, rootRef]);

  return { illuminateRef, hotspotRef };
}
