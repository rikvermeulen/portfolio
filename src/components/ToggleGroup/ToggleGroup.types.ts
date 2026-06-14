export interface ToggleOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  readonly icon?: string;
}

export interface ToggleGroupProps<T extends string = string> {
  readonly options: readonly ToggleOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly className?: string;
}
