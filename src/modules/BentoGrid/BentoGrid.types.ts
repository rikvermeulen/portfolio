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

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly config: BentoGridConfig;
}
