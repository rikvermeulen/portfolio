"use client";

import {
  Slider as AriaSlider,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";

import type { SliderProps } from "./Slider.types.ts";

import Glass from "@/components/Glass/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

const Slider = ({
  value,
  onChange,
  minValue = 0,
  maxValue = 1,
  step = 0.01,
  label,
  className,
}: SliderProps) => {
  const percent = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <AriaSlider
      aria-label={label}
      maxValue={maxValue}
      minValue={minValue}
      onChange={onChange}
      step={step}
      value={value}
      className={classnames("flex w-full touch-none items-center", className)}
    >
      {/* h-5 gives thumb enough hit area without being visually tall */}
      <SliderTrack className="relative h-5 w-full">
        {/* Rail */}
        <div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
          <div
            style={{ width: `${percent}%` }}
            className="h-full rounded-full bg-white/80"
          />
        </div>

        {/* Glass thumb — React Aria owns the thumb's centering transform, so the
            drag scale lives on an inner wrapper to grow symmetrically about center */}
        <SliderThumb className="top-1/2 h-4 w-4 outline-none">
          {({ isDragging }) => (
            <div
              className={classnames(
                "h-full w-full overflow-hidden rounded-full transition-transform duration-150 ease-out",
                isDragging ? "scale-125" : "scale-100",
              )}
            >
              <Glass
                blur={8}
                intensity={2}
                interactive
                radius={999}
                tint="light"
              />
            </div>
          )}
        </SliderThumb>
      </SliderTrack>
    </AriaSlider>
  );
};

export default Slider;
