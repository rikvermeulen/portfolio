import { createElement, isValidElement } from "react";

import type { SlotProps } from "./slot.types.ts";

import classnames from "@/utils/classnames/index.ts";

/**
 * Slot component for merging props with child elements
 */
export function Slot({ children, ref, ...rest }: SlotProps) {
  if (!isValidElement(children)) {
    return null;
  }

  const { type: Component, props: childProps, key } = children;
  const { children: nestedChildren, ...restChildProps } = childProps;

  const mergedProps = {
    ...rest,
    ...restChildProps,
    className: classnames(rest.className, restChildProps.className),
    ref,
    key,
  };

  return createElement(Component, mergedProps, nestedChildren);
}
