"use client";

import {
  UNSTABLE_Toast as AriaToast,
  Button,
  Text,
  UNSTABLE_ToastContent as ToastContent,
} from "react-aria-components";

import type { ToastProps } from "./Toast.types.ts";

import AdaptiveText from "@/components/AdaptiveText/index.ts";
import AppIcon from "@/components/AppIcon/index.ts";
import { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/Icon.tsx";
import { time } from "@/utils/datetime/index.ts";

const RADIUS = 24;

/**
 * Keep blur at 0 — heavy blur (in the SVG filter and/or backdrop string) smears
 * away the chromatic edge fringing. Intensity drives refraction reach.
 */
const GLASS = {
  blur: 0,
  intensity: 2,
  radius: RADIUS,
  tint: "none",
} as const;

/**
 * A single macOS-style notification banner: the shared `Glass` material behind
 * a squircle app icon (pulled straight from the bento registry), a title,
 * message, and timestamp.
 *
 * Glass lives in a sibling layer outside `.app-toast` so `view-transition-class`
 * does not break `backdrop-filter` / edge refraction. Do not move `<Glass>` back
 * inside the transitioning node.
 */
const Toast = ({ toast }: ToastProps) => {
  const { app, title, description, date } = toast.content;
  const identity = bentos[app];
  const timestamp = date ? time.stamp(date) : null;

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 overflow-hidden rounded-3xl shadow-xl">
        <Glass {...GLASS} />
      </div>

      <AriaToast toast={toast} className="app-toast group relative flex w-full">
        <div className="relative flex w-full items-center gap-2.5 px-3.5 py-3">
          <AppIcon
            alt={identity.name}
            darkSrc={"darkIcon" in identity ? identity.darkIcon : undefined}
            src={identity.icon}
          />
          <ToastContent className="flex flex-1 items-start gap-2">
            <AdaptiveText className="flex flex-1 flex-col">
              <Text slot="title" className="text-sm font-semibold">
                {title}
              </Text>
              {description && (
                <Text slot="description" className="text-sm">
                  {description}
                </Text>
              )}
            </AdaptiveText>
            {timestamp && (
              <time className="shrink-0 text-sm text-black/35 dark:text-white/35">
                {timestamp}
              </time>
            )}
          </ToastContent>
        </div>

        <Button
          aria-label="Dismiss"
          slot="close"
          className="absolute -top-2 -left-2 z-20 grid size-5.5 scale-75 place-items-center overflow-hidden rounded-full text-black/55 opacity-0 shadow-md transition-[opacity,transform] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 focus-visible:scale-100 focus-visible:opacity-100 dark:text-white/70"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-white/55 backdrop-blur-sm dark:bg-black/45"
          />
          <Icon iconClassName="relative z-10 size-3.5 rotate-45" name="plus" />
        </Button>
      </AriaToast>
    </div>
  );
};

export default Toast;
