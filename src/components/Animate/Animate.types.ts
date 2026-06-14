import type { FC, HTMLAttributes, JSX, ReactNode, RefObject } from "react";

export type AnimateProps = {
  readonly timelineRef?: RefObject<gsap.core.Timeline | null>;
  readonly timelineTiming?: string | number;
  readonly animation?: {
    readonly from: gsap.TweenVars;
    readonly to: gsap.TweenVars;
  };
  readonly animateOnMount?: boolean;
  readonly whileHover?: gsap.TweenVars;
  readonly whileTap?: gsap.TweenVars;
  readonly children?: ReactNode;
} & HTMLAttributes<HTMLElement>;

export type AnimatedComponents = {
  readonly [Tag in keyof JSX.IntrinsicElements]: FC<
    AnimateProps & JSX.IntrinsicElements[Tag]
  >;
};
