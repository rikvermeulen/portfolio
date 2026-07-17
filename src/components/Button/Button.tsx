"use client";

import { createElement, isValidElement } from "react";

import type { ButtonProps } from "./Button.types.ts";
import type { ReactElement, ReactNode } from "react";

import Glass from "@/components/Glass/index.ts";
import { Slot } from "@/components/Slot/index.ts";
import { RADIUS } from "@/lib/radius/index.ts";
import classnames from "@/utils/classnames/index.ts";

import {
  FILL_CLASSES,
  ICON_SIZE_CLASSES,
  LABEL_CLASSES,
  SIZE_CLASSES,
} from "./Button.const.ts";

/**
 * Button — an iOS-27 "Liquid Glass" capsule built on the agnostic `Glass`
 * material (Figma: iOS & iPadOS 27 · Button - Liquid Glass).
 *
 * `glass` is a clear frosted capsule with a tinted label; `prominent` fills the
 * capsule with a solid tone and draws a white label. `Glass` sits behind the
 * label (via a negative z-index inside the isolated capsule) and supplies the
 * refraction, specular rim, and interactive press light.
 *
 * Renders a native `<button>` by default, or paints onto the child element when
 * `asChild` is set (e.g. an `<a>`), so it stays element-agnostic.
 */
const Button = ({
  variant = "glass",
  tone = "neutral",
  size = "md",
  iconOnly = false,
  asChild = false,
  className,
  children,
  ...rest
}: ButtonProps) => {
  const prominent = variant === "prominent";
  const element =
    asChild && isValidElement(children)
      ? (children as ReactElement<{ children?: ReactNode }>)
      : null;

  const capsule = classnames(
    "focus-ring relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full font-medium whitespace-nowrap transition-transform select-none active:scale-95 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none",
    iconOnly ? [ICON_SIZE_CLASSES[size], "font-semibold"] : SIZE_CLASSES[size],
    LABEL_CLASSES[variant][tone],
    className,
  );

  const inner = (
    <>
      {prominent && (
        <span
          aria-hidden="true"
          className={classnames("absolute inset-0 -z-10", FILL_CLASSES[tone])}
        />
      )}
      <Glass
        intensity={2}
        interactive
        radius={RADIUS.pill}
        tint={prominent ? "none" : "adaptive"}
        className="-z-10"
      />
      {element ? element.props.children : children}
    </>
  );

  if (element) {
    return (
      <Slot
        className={capsule}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {createElement(element.type, element.props, inner)}
      </Slot>
    );
  }

  return (
    <button type="button" className={capsule} {...rest}>
      {inner}
    </button>
  );
};

export default Button;
