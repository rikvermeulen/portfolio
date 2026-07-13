import type { BentoAppKey, BentoSizeKey } from "./config.ts";
import type { Result } from "@/types/index.ts";

export type BentoBoxSize = `${number}x${number}`;

export interface ResponsiveBentoSize {
  readonly base: BentoBoxSize;
  readonly md?: BentoBoxSize;
  readonly lg?: BentoBoxSize;
}

export interface ResponsiveGridValue<T> {
  readonly base: T;
  readonly md?: T;
  readonly lg?: T;
}

export interface BentoGridConfig {
  readonly columns: ResponsiveGridValue<number>;
  readonly gap: ResponsiveGridValue<string>;
  readonly rowHeight: ResponsiveGridValue<string>;
}

export type BentoIconPosition = "top-right" | "bottom-right";

export interface BentoSizedProps {
  readonly sizeKey: BentoSizeKey;
}

export interface BentoProps extends React.HTMLAttributes<HTMLElement> {
  readonly app?: BentoAppKey;
  readonly image?: string;
  readonly imageAlt?: string;
  readonly href?: string;
  readonly iconPosition?: BentoIconPosition;
  readonly sizes?: ResponsiveBentoSize;
  readonly children: React.ReactNode;
}

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly config: BentoGridConfig;
}

export interface AsyncBentoProps<T> {
  readonly load: () => Promise<Result<T>>;
  readonly render: (data: T) => React.ReactNode;
  readonly renderError: (errorMessage: string) => React.ReactNode;
}

export interface BentoEmptyStateProps {
  readonly sizeKey: BentoSizeKey;
  readonly message: string;
  readonly className?: string;
}

export interface BentoErrorBoundaryProps {
  readonly sizeKey: BentoSizeKey;
  readonly children: React.ReactNode;
}

export interface BentoSkeletonProps {
  readonly sizeKey: BentoSizeKey;
}
