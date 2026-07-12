export type GlassTint = "adaptive" | "light" | "dark" | "none";

export interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly radius?: number;
  readonly intensity?: number;
  readonly blur?: number;
  readonly tint?: GlassTint;
  readonly interactive?: boolean;
}

export interface GlassFilterProps {
  readonly id: string;
  readonly feImageRef: React.RefObject<SVGFEImageElement | null>;
  readonly displacementScale: number;
  readonly chroma: number;
  readonly blur: number;
}

export interface GlassLightRefs {
  readonly illuminateRef: React.RefObject<HTMLSpanElement | null>;
  readonly hotspotRef: React.RefObject<HTMLSpanElement | null>;
}

export interface DisplacementFilter {
  readonly feImageRef: React.RefObject<SVGFEImageElement | null>;
  readonly filterId: string;
  readonly paintedRef: React.RefObject<boolean>;
}
