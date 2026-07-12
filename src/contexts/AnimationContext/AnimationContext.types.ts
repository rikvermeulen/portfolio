export interface AnimationContextType {
  gsap: GSAP | null;
  isAnimationDisabled: boolean;
}

export interface AnimationProviderProps {
  children: React.ReactNode;
}
