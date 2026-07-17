import type { AudioControlsProps } from "./AudioControls.types.ts";

import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import classnames from "@/utils/classnames/index.ts";

import { SkipIcon } from "./SkipIcon.tsx";

const AudioControls = ({
  isPlaying,
  pulsedButton,
  onPlayOrPause,
  onChangeTrack,
}: AudioControlsProps) => {
  return (
    <div className="m-auto flex w-full max-w-[184px] items-center justify-between">
      <button
        aria-label="Previous song"
        onClick={() => onChangeTrack("previous")}
        type="button"
        className={classnames(
          pulsedButton === "previous" && "button",
          "relative cursor-pointer border-none fill-white outline-hidden",
        )}
      >
        <SkipIcon className="relative -top-1 size-[22px]" />
      </button>

      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        aria-pressed={isPlaying}
        onClick={onPlayOrPause}
        type="button"
        className={classnames(
          pulsedButton === "playPause" && "button",
          "relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full text-white",
        )}
      >
        <Glass
          blur={12}
          intensity={0.6}
          interactive
          radius={999}
          tint="light"
        />
        <Icon
          iconClassName={classnames(
            isPlaying ? "scale-100 opacity-100" : "scale-0 opacity-0",
            "relative z-10 h-4 transition-[opacity,transform] duration-300 ease-in-out",
          )}
          name="pause"
        />
        <Icon
          iconClassName={classnames(
            !isPlaying ? "scale-100 opacity-100" : "scale-0 opacity-0",
            "absolute z-10 h-4 transition-[opacity,transform] duration-300 ease-in-out",
          )}
          name="play"
        />
      </button>

      <button
        aria-label="Next song"
        onClick={() => onChangeTrack("next")}
        type="button"
        className={classnames(
          pulsedButton === "next" && "button",
          "-scale-x-100 cursor-pointer border-none fill-white outline-hidden",
        )}
      >
        <SkipIcon className="relative -top-1 size-[22px]" />
      </button>
    </div>
  );
};

export default AudioControls;
