export interface SliderProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly step?: number;
  readonly label: string;
  readonly className?: string;
}
