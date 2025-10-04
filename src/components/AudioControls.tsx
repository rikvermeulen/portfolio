import Icon from "@/components/Icons/Icon.tsx";
import cc from "@/lib/cc.ts";

import type { FC } from "react";

interface AudioControlsProps {
  isPlaying: boolean;
  pulsedButton: null | "playPause" | "previous" | "next";
  handlePlayOrPause: () => void;
  handleChangeTrack: (direction: "previous" | "next") => void;
}

const AudioControls: FC<AudioControlsProps> = ({
  isPlaying,
  pulsedButton,
  handlePlayOrPause,
  handleChangeTrack,
}) => {
  return (
    <div className="m-auto mt-4 flex w-full max-w-[184px] items-center justify-between">
      <button
        aria-label="Previous song"
        name="Previous song"
        onClick={() => handleChangeTrack("previous")}
        className={cc(
          pulsedButton === "previous" ? "button" : "",
          "relative border-none fill-white outline-hidden",
        )}
      >
        <Icon
          type="next"
          className="relative -top-1 border-none outline-hidden"
        />
      </button>
      <button
        aria-label="Play / Pause"
        name="Play / Pause"
        onClick={handlePlayOrPause}
        className={cc(
          pulsedButton === "playPause" ? "button" : "",
          "relative flex h-6 w-6 justify-center fill-white",
        )}
      >
        <Icon
          type="pause"
          className={cc(
            isPlaying ? "scale-100 opacity-100" : "scale-0 opacity-0",
            "h-full transition-[opacity,transform] duration-300 ease-in-out active:scale-90",
          )}
        />
        <Icon
          type="play"
          className={cc(
            !isPlaying ? "scale-100 opacity-100" : "scale-0 opacity-0",
            "absolute h-full transition-[opacity,transform] duration-300 ease-in-out active:scale-90",
          )}
        />
      </button>
      <button
        aria-label="Next song"
        name="Next song"
        onClick={() => handleChangeTrack("next")}
        className={cc(
          pulsedButton === "next" ? "button" : "",
          "-scale-x-100 border-none fill-white outline-hidden",
        )}
      >
        <Icon
          type="next"
          className="relative -top-1 border-none outline-hidden"
        />
      </button>
    </div>
  );
};

export default AudioControls;
