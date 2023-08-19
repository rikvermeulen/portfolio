import { FC, ReactElement } from 'react';

import { Apps, AppsFill } from './types/Apps';
import Arrow from './types/Arrow';
import { Dog, DogFill } from './types/Dog';
import Explicit from './types/Explicit';
import { Heart, HeartFill } from './types/Heart';
import { Map, MapFill } from './types/Map';
import Minus from './types/Minus';
import Mouse from './types/Mouse';
import Mute from './types/Mute';
import Next from './types/Next';
import Pause from './types/Pause';
import Play from './types/Play';
import Plus from './types/Plus';
import Sound from './types/Sound';
import Tail from './types/Tail';

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
};

interface IconProps {
  type: string;
  [x: string]: any;
}

const Icon: FC<IconProps> = ({ type = '', ...rest }): ReactElement | null => {
  const IconComp = icons[type];
  if (!type || type === '') return null;
  return <IconComp {...rest} />;
};

export default Icon;
