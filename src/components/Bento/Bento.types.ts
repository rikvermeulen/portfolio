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

export interface BentoProps extends React.HTMLAttributes<HTMLElement> {
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
