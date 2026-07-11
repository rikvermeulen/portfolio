import type { AudioControlsProps } from "./AudioControls.types.ts";

import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

import { NextIcon } from "./NextIcon.tsx";

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
        name="Previous song"
        onClick={() => onChangeTrack("previous")}
        className={classnames(
          pulsedButton === "previous" && "button",
          "relative border-none fill-white outline-hidden",
        )}
      >
        <NextIcon className="relative -top-1 size-[22px]" />
      </button>

      <button
        aria-label="Play / Pause"
        name="Play / Pause"
        onClick={onPlayOrPause}
        className={classnames(
          pulsedButton === "playPause" && "button",
          "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full fill-white",
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
        name="Next song"
        onClick={() => onChangeTrack("next")}
        className={classnames(
          pulsedButton === "next" && "button",
          "-scale-x-100 border-none fill-white outline-hidden",
        )}
      >
        <NextIcon className="relative -top-1 size-[22px]" />
      </button>
    </div>
  );
};

export default AudioControls;
