import { FC, ReactElement } from 'react';

import { Apps, AppsFill } from './types/Apps';
import Arrow from './types/Arrow';
import { Chevron } from './types/Chevron';
import { Close } from './types/Close';
import Controller from './types/Controller';
import DarkMode from './types/DarkMode';
import { Dog, DogFill } from './types/Dog';
import Explicit from './types/Explicit';
import { Heart, HeartFill } from './types/Heart';
import List from './types/List';
import Loop from './types/Loop';
import { Map, MapFill } from './types/Map';
import Minus from './types/Minus';
import Moon from './types/Moon';
import Mouse from './types/Mouse';
import Mute from './types/Mute';
import Next from './types/Next';
import Pause from './types/Pause';
import Person from './types/Person';
import Play from './types/Play';
import Plus from './types/Plus';
import Settings from './types/Settings';
import Sound from './types/Sound';
import Suitcase from './types/Suitcase';
import Tail from './types/Tail';
import Tooltip from './types/Tooltip';
import Wave from './types/Wave';

interface Icons {
  [index: string]: FC<any>;
}

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
  darkmode: DarkMode,
};

interface IconProps {
  type: keyof typeof icons;
  [x: string]: any;
}

const Icon: FC<IconProps> = ({ type, ...rest }): ReactElement | null => {
  const IconComp = icons[type];
  if (!IconComp) return null;
  return <IconComp {...rest} />;
};

export default Icon;
