"use client";

import { createContext, use, useMemo } from "react";

import type { Plugin } from "@/hooks/useLoadGsap/useLoadGsap.ts";

import { useIsLowEndDevice } from "@/hooks/useIsLowEndDevice/useIsLowEndDevice.ts";
import { useLoadGsap } from "@/hooks/useLoadGsap/useLoadGsap.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/usePrefersReducedMotion.ts";

interface AnimationContextType {
  gsap: GSAP | null;
  isAnimationDisabled: boolean;
}

const AnimationContext = createContext<AnimationContextType>({
  gsap: null,
  isAnimationDisabled: false,
});

export const useAnimationContext = () => use(AnimationContext);

const GSAP_PLUGINS: Plugin[] = ["ScrollTrigger"];

interface AnimationProviderProps {
  children: React.ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isLowEndDevice = useIsLowEndDevice();
  const isAnimationDisabled = prefersReducedMotion || isLowEndDevice;
  const gsap = useLoadGsap(!isAnimationDisabled, GSAP_PLUGINS);

  const value = useMemo(
    () => ({ gsap, isAnimationDisabled }),
    [gsap, isAnimationDisabled],
  );

  return <AnimationContext value={value}>{children}</AnimationContext>;
}
