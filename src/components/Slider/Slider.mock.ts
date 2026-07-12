import type { SliderProps } from "./Slider.types.ts";

export const mockSliderProps = {
  minValue: 0,
  maxValue: 1,
  step: 0.01,
  label: "Volume",
} satisfies Omit<SliderProps, "value" | "onChange">;
