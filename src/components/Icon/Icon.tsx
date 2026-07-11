import { memo } from "react";

import type { IconProps, SvgIconComponent } from "./Icon.types.ts";

import ArrowIcon from "@/assets/icons/arrow.svg";
import ChevronDownIcon from "@/assets/icons/chevron.down.svg";
import ChevronUpIcon from "@/assets/icons/chevron.up.svg";
import DogIcon from "@/assets/icons/dog.svg";
import ExplicitIcon from "@/assets/icons/explicit.svg";
import HeartIcon from "@/assets/icons/heart.svg";
import ImagesIcon from "@/assets/icons/images.svg";
import MapIcon from "@/assets/icons/map.svg";
import MinusIcon from "@/assets/icons/minus.svg";
import MuteIcon from "@/assets/icons/mute.svg";
import NextIcon from "@/assets/icons/next.svg";
import PauseIcon from "@/assets/icons/pause.svg";
import PersonsIcon from "@/assets/icons/persons.svg";
import PlayIcon from "@/assets/icons/play.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import SoundIcon from "@/assets/icons/sound.svg";
import SprayIcon from "@/assets/icons/spray.svg";
import TailIcon from "@/assets/icons/tail.svg";
import TimerIcon from "@/assets/icons/timer.svg";
import WateringCanIcon from "@/assets/icons/watering-can.svg";
import WeatherCloudSunIcon from "@/assets/icons/weather-cloud-sun.svg";
import WeatherCloudIcon from "@/assets/icons/weather-cloud.svg";
import WeatherFogIcon from "@/assets/icons/weather-fog.svg";
import WeatherMoonIcon from "@/assets/icons/weather-moon.svg";
import WeatherRainIcon from "@/assets/icons/weather-rain.svg";
import WeatherSnowIcon from "@/assets/icons/weather-snow.svg";
import WeatherSunIcon from "@/assets/icons/weather-sun.svg";
import WeatherThunderstormIcon from "@/assets/icons/weather-thunderstorm.svg";

export const ICON_COMPONENTS: Record<string, SvgIconComponent> = {
  arrow: ArrowIcon,
  dog: DogIcon,
  explicit: ExplicitIcon,
  heart: HeartIcon,
  images: ImagesIcon,
  map: MapIcon,
  minus: MinusIcon,
  mute: MuteIcon,
  next: NextIcon,
  pause: PauseIcon,
  play: PlayIcon,
  plus: PlusIcon,
  sound: SoundIcon,
  spray: SprayIcon,
  tail: TailIcon,
  persons: PersonsIcon,
  timer: TimerIcon,
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,
  "watering-can": WateringCanIcon,
  "weather-cloud": WeatherCloudIcon,
  "weather-cloud-sun": WeatherCloudSunIcon,
  "weather-fog": WeatherFogIcon,
  "weather-moon": WeatherMoonIcon,
  "weather-rain": WeatherRainIcon,
  "weather-snow": WeatherSnowIcon,
  "weather-sun": WeatherSunIcon,
  "weather-thunderstorm": WeatherThunderstormIcon,
};

const Icon: React.FC<IconProps> = memo(
  ({ name, label, className, iconClassName }) => {
    const IconComponent = ICON_COMPONENTS[name];
    if (!IconComponent) {
      return null;
    }

    const svgElement = (
      <IconComponent
        aria-hidden="true"
        focusable="false"
        className={iconClassName}
      />
    );

    return label ? (
      <span className={className}>
        {svgElement}
        <span className="sr-only">{label}</span>
      </span>
    ) : (
      svgElement
    );
  },
);

export default Icon;
