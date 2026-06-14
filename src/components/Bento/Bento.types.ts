import type {
  BentoBoxSize,
  BentoGridConfig,
  ResponsiveBentoSize,
} from "./config.ts";
import type { HTMLAttributes, ReactNode } from "react";

export interface BentoProps extends HTMLAttributes<HTMLElement> {
  readonly image?: string;
  readonly href?: string;
  readonly size?: BentoBoxSize;
  readonly sizes?: ResponsiveBentoSize;
  readonly children: ReactNode;
}

export interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  readonly config: BentoGridConfig;
}
