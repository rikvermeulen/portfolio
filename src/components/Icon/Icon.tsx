import { memo } from "react";

import type { IconProps, SvgIconComponent } from "./Icon.types.ts";

import ArrowUpRightIcon from "@/assets/icons/arrow-up-right.svg?react";
import ArrowIcon from "@/assets/icons/arrow.svg?react";
import BellIcon from "@/assets/icons/bell.svg?react";
import BrushIcon from "@/assets/icons/brush.svg?react";
import CheckIcon from "@/assets/icons/check.svg?react";
import ChevronDownIcon from "@/assets/icons/chevron.down.svg?react";
import ChevronUpIcon from "@/assets/icons/chevron.up.svg?react";
import DogIcon from "@/assets/icons/dog.svg?react";
import ExplicitIcon from "@/assets/icons/explicit.svg?react";
import FlowerIcon from "@/assets/icons/flower.svg?react";
import HeartIcon from "@/assets/icons/heart.svg?react";
import ImagesIcon from "@/assets/icons/images.svg?react";
import MapIcon from "@/assets/icons/map.svg?react";
import MinusIcon from "@/assets/icons/minus.svg?react";
import MuteIcon from "@/assets/icons/mute.svg?react";
import NextIcon from "@/assets/icons/next.svg?react";
import PauseIcon from "@/assets/icons/pause.svg?react";
import PersonsIcon from "@/assets/icons/persons.svg?react";
import PlayIcon from "@/assets/icons/play.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import RefreshIcon from "@/assets/icons/refresh.svg?react";
import ShareIcon from "@/assets/icons/share.svg?react";
import SoundIcon from "@/assets/icons/sound.svg?react";
import SprayIcon from "@/assets/icons/spray.svg?react";
import SteamIcon from "@/assets/icons/steam.svg?react";
import TailIcon from "@/assets/icons/tail.svg?react";
import TimerIcon from "@/assets/icons/timer.svg?react";
import TrowelIcon from "@/assets/icons/trowel.svg?react";
import WateringCanIcon from "@/assets/icons/watering-can.svg?react";
import WeatherCloudSunIcon from "@/assets/icons/weather-cloud-sun.svg?react";
import WeatherCloudIcon from "@/assets/icons/weather-cloud.svg?react";
import WeatherFogIcon from "@/assets/icons/weather-fog.svg?react";
import WeatherMoonIcon from "@/assets/icons/weather-moon.svg?react";
import WeatherRainIcon from "@/assets/icons/weather-rain.svg?react";
import WeatherSnowIcon from "@/assets/icons/weather-snow.svg?react";
import WeatherSunIcon from "@/assets/icons/weather-sun.svg?react";
import WeatherThunderstormIcon from "@/assets/icons/weather-thunderstorm.svg?react";
import XboxIcon from "@/assets/icons/xbox.svg?react";

const ICON_COMPONENTS: Record<string, SvgIconComponent> = {
  arrow: ArrowIcon,
  arrowUpRight: ArrowUpRightIcon,
  bell: BellIcon,
  brush: BrushIcon,
  check: CheckIcon,
  dog: DogIcon,
  explicit: ExplicitIcon,
  flower: FlowerIcon,
  heart: HeartIcon,
  images: ImagesIcon,
  map: MapIcon,
  minus: MinusIcon,
  mute: MuteIcon,
  next: NextIcon,
  pause: PauseIcon,
  play: PlayIcon,
  plus: PlusIcon,
  refresh: RefreshIcon,
  share: ShareIcon,
  sound: SoundIcon,
  spray: SprayIcon,
  steam: SteamIcon,
  xbox: XboxIcon,
  tail: TailIcon,
  persons: PersonsIcon,
  timer: TimerIcon,
  trowel: TrowelIcon,
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
