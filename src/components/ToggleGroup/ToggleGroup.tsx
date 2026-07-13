"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { Tab, TabList, Tabs } from "react-aria-components";

import type { ToggleGroupProps } from "./ToggleGroup.types.ts";

import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/index.ts";
import classnames from "@/utils/classnames/index.ts";

interface Rect {
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

const HOVER_SCALE = 1.12;
const PRESS_SCALE = 1.18;
const PILL_INSET = 2;
const MAGNET_MAX = 10;
const MAGNET_PULL = 0.04;
const RUBBER = 0.22;
const DRAG_THRESHOLD = 4;

function rubberClamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min - (min - value) * RUBBER;
  }
  if (value > max) {
    return max + (value - max) * RUBBER;
  }
  return value;
}

export default function ToggleGroup<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: ToggleGroupProps<T>) {
  const reduceMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const tabElementsRef = useRef(new Map<T, HTMLElement>());
  const draggingRef = useRef(false);
  const readyRef = useRef(false);

  const [rects, setRects] = useState<Record<string, Rect>>({});
  const [barHeight, setBarHeight] = useState(0);
  const [dragPreview, setDragPreview] = useState<T | null>(null);

  const x = useMotionValue(0);
  const w = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 420, damping: 32, mass: 0.9 });
  const springW = useSpring(w, { stiffness: 420, damping: 36 });
  const scale = useSpring(1, { stiffness: 500, damping: 30 });

  const velocity = useVelocity(springX);
  const stretch = useTransform(velocity, (current) =>
    Math.min(Math.abs(current) / 1800, 0.16),
  );
  const scaleX = useSpring(
    useTransform(stretch, (current) => 1 + current),
    {
      stiffness: 400,
      damping: 28,
    },
  );
  const scaleY = useSpring(
    useTransform(stretch, (current) => 1 - current * 0.7),
    { stiffness: 400, damping: 28 },
  );
  const boxShadow = useTransform(
    scale,
    [1, PRESS_SCALE],
    ["0 1px 3px rgba(0,0,0,0.18)", "0 10px 28px rgba(0,0,0,0.30)"],
  );

  const setTabRef = useCallback((tabValue: T, element: HTMLElement | null) => {
    if (element) {
      tabElementsRef.current.set(tabValue, element);
      return;
    }
    tabElementsRef.current.delete(tabValue);
  }, []);

  useLayoutEffect(() => {
    const measure = (): void => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const next = Object.fromEntries(
        options.flatMap((option) => {
          const element = tabElementsRef.current.get(option.value);
          if (!element) {
            return [];
          }

          const rect = element.getBoundingClientRect();
          return [
            [
              option.value,
              {
                left: rect.left - rootRect.left,
                width: rect.width,
                height: rect.height,
              } satisfies Rect,
            ],
          ];
        }),
      );

      requestAnimationFrame(() => {
        setRects(next);
        setBarHeight(rootRect.height);
      });
    };

    measure();
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);
    const root = rootRef.current;

    if (root) {
      observer.observe(root);
    }

    for (const element of tabElementsRef.current.values()) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [options]);

  useEffect(() => {
    const rect = rects[value];
    if (!rect || draggingRef.current) {
      return;
    }

    if (!readyRef.current || reduceMotion) {
      x.jump(rect.left);
      w.jump(rect.width);
      readyRef.current = true;
    } else {
      x.set(rect.left);
      w.set(rect.width);
    }
  }, [rects, reduceMotion, value, w, x]);

  const latestRef = useRef({ dragPreview, rects, value });

  useLayoutEffect(() => {
    latestRef.current = { dragPreview, rects, value };
  }, [dragPreview, rects, value]);

  const activeValue = dragPreview ?? value;

  useMotionValueEvent(springX, "change", (currentX) => {
    if (!draggingRef.current) {
      return;
    }

    const center = currentX + (rects[value]?.width ?? 0) / 2;
    let nearest = options[0]?.value ?? value;
    let best = Infinity;

    for (const option of options) {
      const rect = rects[option.value];
      if (!rect) {
        continue;
      }

      const distance = Math.abs(rect.left + rect.width / 2 - center);
      if (distance < best) {
        best = distance;
        nearest = option.value;
      }
    }

    setDragPreview((current) => (current === nearest ? current : nearest));
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) {
      return;
    }

    let hovering = false;
    let pressing = false;
    let pressX = 0;

    const updateFromPointer = (clientX: number, pressed: boolean): void => {
      const selectedRect = rects[value];

      if (!selectedRect) {
        return;
      }

      const pointerX = clientX - root.getBoundingClientRect().left;

      if (pressed) {
        const firstRect = rects[options[0]?.value ?? ""];
        const lastRect = rects[options[options.length - 1]?.value ?? ""];
        const min = firstRect?.left ?? 0;
        const max = lastRect
          ? lastRect.left + lastRect.width - selectedRect.width
          : 0;

        x.set(rubberClamp(pointerX - selectedRect.width / 2, min, max));
        return;
      }

      const offset =
        (pointerX - (selectedRect.left + selectedRect.width / 2)) * MAGNET_PULL;
      x.set(
        selectedRect.left + Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, offset)),
      );
    };

    const arm = (): void => {
      hovering = true;
      scale.set(HOVER_SCALE);
    };

    const settle = (): void => {
      hovering = false;
      scale.set(1);
      const rect = latestRef.current.rects[latestRef.current.value];
      if (rect) {
        x.set(rect.left);
      }
    };

    const onMove = (event: PointerEvent): void => {
      if (draggingRef.current) {
        updateFromPointer(event.clientX, true);
        return;
      }

      if (pressing && Math.abs(event.clientX - pressX) > DRAG_THRESHOLD) {
        draggingRef.current = true;
        scale.set(PRESS_SCALE);

        try {
          root.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture can fail on unsupported elements; ignore.
        }

        updateFromPointer(event.clientX, true);
        return;
      }

      if (!hovering) {
        arm();
      }

      updateFromPointer(event.clientX, false);
    };

    const onUp = (event: PointerEvent): void => {
      const wasDragging = draggingRef.current;
      draggingRef.current = false;
      pressing = false;

      if (root.hasPointerCapture(event.pointerId)) {
        root.releasePointerCapture(event.pointerId);
      }

      if (wasDragging) {
        const {
          dragPreview: nextValue,
          rects: nextRects,
          value: currentValue,
        } = latestRef.current;

        if (nextValue !== null && nextValue !== currentValue) {
          onChange(nextValue);
        }

        setDragPreview(null);

        const rect = nextRects[nextValue ?? currentValue];
        if (rect) {
          x.set(rect.left);
          w.set(rect.width);
        }

        if (event.pointerType !== "touch") {
          scale.set(HOVER_SCALE);
        }
      }

      if (event.pointerType === "touch") {
        settle();
      }
    };

    const onLeave = (): void => {
      if (!draggingRef.current && !pressing) {
        settle();
      }
    };

    const onDown = (event: PointerEvent): void => {
      pressing = true;
      pressX = event.clientX;
      arm();
    };

    root.addEventListener("pointerenter", arm);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    return () => {
      root.removeEventListener("pointerenter", arm);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
    };
  }, [onChange, options, rects, reduceMotion, scale, value, w, x]);

  const activeRect = rects[value];

  return (
    <Tabs
      ref={rootRef}
      onSelectionChange={(key) => {
        if (typeof key === "string") {
          onChange(key as T);
        }
      }}
      selectedKey={value}
      className={classnames(
        "group relative inline-flex touch-none items-center rounded-full p-1",
        className,
      )}
    >
      <Glass intensity={1} radius={999} tint="adaptive" />

      {activeRect ? (
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: PILL_INSET,
            height: (barHeight || activeRect.height) - PILL_INSET * 2,
            width: springW,
            x: springX,
            scale,
            boxShadow,
            borderRadius: 999,
          }}
        >
          <motion.div
            style={{ scaleX, scaleY, transformOrigin: "center" }}
            className="absolute inset-0 overflow-hidden rounded-full"
          >
            <Glass
              intensity={2}
              radius={999}
              tint="adaptive"
              className="bg-black/30 dark:bg-white/30"
            />
          </motion.div>
        </motion.div>
      ) : null}

      <TabList
        aria-label="Toggle group"
        className="relative z-10 inline-flex items-center"
      >
        {options.map((option) => (
          <Tab
            key={option.value}
            ref={(element: HTMLElement | null) =>
              setTabRef(option.value, element)
            }
            id={option.value}
            className={classnames(
              "relative flex min-w-15 cursor-pointer items-center justify-center rounded-full px-2.5 py-1 outline-none",
              option.value === activeValue ? "text-blue-600" : "text-black",
            )}
          >
            <span className="relative z-10">
              {option.icon ? (
                <span className="flex flex-col items-center dark:text-white">
                  <Icon
                    iconClassName="size-4.5"
                    label={option.label}
                    name={option.icon}
                  />
                  <span className="-mt-px text-[8px] font-medium">
                    {option.label}
                  </span>
                </span>
              ) : (
                option.label
              )}
            </span>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
}
