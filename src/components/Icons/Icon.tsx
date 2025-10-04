import type { FC, ReactElement } from "react";

import { Apps, AppsFill } from "./types/Apps.tsx";
import Arrow from "./types/Arrow.tsx";
import { Chevron } from "./types/Chevron.tsx";
import { Close } from "./types/Close.tsx";
import Controller from "./types/Controller.tsx";
import { Dog, DogFill } from "./types/Dog.tsx";
import Explicit from "./types/Explicit.tsx";
import { Heart, HeartFill } from "./types/Heart.tsx";
import List from "./types/List.tsx";
import Loop from "./types/Loop.tsx";
import { Map, MapFill } from "./types/Map.tsx";
import Minus from "./types/Minus.tsx";
import Moon from "./types/Moon.tsx";
import Mouse from "./types/Mouse.tsx";
import Mute from "./types/Mute.tsx";
import Next from "./types/Next.tsx";
import Pause from "./types/Pause.tsx";
import Person from "./types/Person.tsx";
import Play from "./types/Play.tsx";
import Plus from "./types/Plus.tsx";
import Settings from "./types/Settings.tsx";
import Sound from "./types/Sound.tsx";
import Suitcase from "./types/Suitcase.tsx";
import Tail from "./types/Tail.tsx";
import Tooltip from "./types/Tooltip.tsx";
import Wave from "./types/Wave.tsx";

type Icons = Record<string, FC<{ className?: string }>>;

const icons: Icons = {
  mouse: Mouse,
  arrow: Arrow,
  plus: Plus,
  tail: Tail,
  map: Map,
  mapFill: MapFill,
  heart: Heart,
  heartFill: HeartFill,
  dog: Dog,
  dogFill: DogFill,
  explicit: Explicit,
  next: Next,
  play: Play,
  pause: Pause,
  mute: Mute,
  sound: Sound,
  apps: Apps,
  appsFill: AppsFill,
  minus: Minus,
  close: Close,
  loop: Loop,
  list: List,
  chevron: Chevron,
  wave: Wave,
  settings: Settings,
  suitcase: Suitcase,
  person: Person,
  moon: Moon,
  controller: Controller,
  tooltip: Tooltip,
};

interface IconProps {
  type: keyof typeof icons;
  [x: string]: unknown;
}

const Icon: FC<IconProps> = ({ type, ...rest }): ReactElement | null => {
  const IconComp = icons[type];
  if (!IconComp) {
    return null;
  }
  return <IconComp {...rest} />;
};

export default Icon;
