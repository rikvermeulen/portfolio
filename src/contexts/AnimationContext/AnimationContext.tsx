"use client";

import { createContext, useContext, useMemo } from "react";

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

export const useAnimationContext = () => useContext(AnimationContext);

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isLowEndDevice = useIsLowEndDevice();

  // Disable animations if either condition is true
  const isAnimationDisabled = prefersReducedMotion || isLowEndDevice;

  const gsap = useLoadGsap(!isAnimationDisabled, ["ScrollTrigger"]);

  const contextValue = useMemo(
    () => ({ gsap, isAnimationDisabled }),
    [gsap, isAnimationDisabled],
  );

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};
