/* eslint-disable @eslint-react/component-hook-factories */
"use client";

import {
  createElement,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react";

import type { AnimatedComponents, AnimateProps } from "./Animate.types.ts";
import type { JSX } from "react";

import { useAnimationContext } from "@/contexts/AnimationContext/AnimationContext.tsx";

// Helper function to combine multiple refs
function useCombinedRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return useCallback(
    (node: T) => {
      refs.forEach((ref) => {
        if (!ref) {
          return;
        }
        if (typeof ref === "function") {
          ref(node);
        } else {
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      });
    },
    [refs],
  );
}

/**
 * Creates an animated React component for a given HTML tag.
 *
 * @template Tag
 * @param {Tag} Tag - The HTML tag to create an animated component for.
 * @returns {React.FC<AnimateProps>} The animated component.
 *
 * @example
 * // Basic usage with an `Animate.div` component
 * const MyComponent = () => (
 *   <Animate.div
 *     animation={{ from: { opacity: 0 }, to: { opacity: 1 } }}
 *     whileHover={{ scale: 1.1 }}
 *     whileTap={{ scale: 0.9 }}
 *     timeline={timeline}
 *     timelineTiming={1}
 *   >
 *     Hover and Tap to Animate!
 *   </Animate.div>
 * );
 */
function createAnimatedComponent<Tag extends keyof JSX.IntrinsicElements>(
  Tag: Tag,
) {
  const AnimatedComponent = forwardRef<HTMLElement, AnimateProps>(
    (props, ref) => {
      const {
        timelineRef,
        timelineTiming,
        animation,
        animateOnMount = true,
        whileHover,
        whileTap,
        children,
        ...rest
      } = props;

      const localRef = useRef<HTMLElement>(null);
      const combinedRef = useCombinedRefs<HTMLElement>(ref, localRef);
      const { gsap, isAnimationDisabled } = useAnimationContext();

      // Refs to store GSAP animations
      const mountAnimationRef = useRef<gsap.core.Tween | null>(null);
      const hoverAnimationRef = useRef<gsap.core.Tween | null>(null);
      const tapAnimationRef = useRef<gsap.core.Tween | null>(null);

      // Ref to track if the animation has been added
      const animationAddedRef = useRef(false);

      useEffect(() => {
        const element = localRef.current;
        if (!element || !gsap) {
          return;
        }

        // If animations are disabled, kill all existing animations and return
        if (isAnimationDisabled) {
          mountAnimationRef.current?.kill();
          hoverAnimationRef.current?.kill();
          tapAnimationRef.current?.kill();
          animationAddedRef.current = false;
          return;
        }

        const cleanupFns: (() => void)[] = [];

        // Initialize animations
        if (animation && !animationAddedRef.current) {
          if (timelineRef?.current) {
            timelineRef.current.fromTo(
              element,
              animation.from,
              animation.to,
              timelineTiming,
            );
          } else if (animateOnMount) {
            mountAnimationRef.current = gsap.fromTo(element, animation.from, {
              ...animation.to,
              onComplete: () => {
                mountAnimationRef.current = null;
              },
            });
          }
          animationAddedRef.current = true;
        }

        // Initialize hover animation
        if (whileHover && !hoverAnimationRef.current) {
          hoverAnimationRef.current = gsap.to(element, {
            ...whileHover,
            paused: true,
          });
          const handleMouseEnter = () => hoverAnimationRef.current?.play();
          const handleMouseLeave = () => hoverAnimationRef.current?.reverse();

          element.addEventListener("mouseenter", handleMouseEnter);
          element.addEventListener("mouseleave", handleMouseLeave);

          cleanupFns.push(() => {
            element.removeEventListener("mouseenter", handleMouseEnter);
            element.removeEventListener("mouseleave", handleMouseLeave);
            hoverAnimationRef.current?.kill();
          });
        }

        // Initialize tap animation
        if (whileTap && !tapAnimationRef.current) {
          tapAnimationRef.current = gsap.to(element, {
            ...whileTap,
            paused: true,
          });
          const handleMouseDown = () => tapAnimationRef.current?.play();
          const handleMouseUp = () => tapAnimationRef.current?.reverse();

          element.addEventListener("mousedown", handleMouseDown);
          element.addEventListener("mouseup", handleMouseUp);
          element.addEventListener("touchstart", handleMouseDown);
          element.addEventListener("touchend", handleMouseUp);

          cleanupFns.push(() => {
            element.removeEventListener("mousedown", handleMouseDown);
            element.removeEventListener("mouseup", handleMouseUp);
            element.removeEventListener("touchstart", handleMouseDown);
            element.removeEventListener("touchend", handleMouseUp);
            tapAnimationRef.current?.kill();
          });
        }

        // Cleanup function
        return () => {
          cleanupFns.forEach((fn) => fn());
        };
      }, [
        gsap,
        isAnimationDisabled,
        animateOnMount,
        timelineTiming,
        animation,
        whileHover,
        whileTap,
        timelineRef,
      ]);

      return createElement(Tag, { ref: combinedRef, ...rest }, children);
    },
  );

  AnimatedComponent.displayName = `Animate.${Tag}`;
  return memo(AnimatedComponent);
}

// Create Animate components for all HTML tags
const componentCache = new Map<string, React.FC<AnimateProps>>();

export const Animate = new Proxy(
  {},
  {
    get: (_, tag: string) => {
      if (!componentCache.has(tag)) {
        const AnimatedComponent = createAnimatedComponent(
          tag as keyof JSX.IntrinsicElements,
        );
        componentCache.set(tag, AnimatedComponent);
      }
      return componentCache.get(tag);
    },
  },
) as AnimatedComponents;
