import { FC, ReactElement } from 'react';

import Apps from './types/Apps';
import Arrow from './types/Arrow';
import Dog from './types/Dog';
import Explicit from './types/Explicit';
import Heart from './types/Heart';
import Map from './types/Map';
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
  heart: Heart,
  dog: Dog,
  explicit: Explicit,
  next: Next,
  play: Play,
  pause: Pause,
  mute: Mute,
  sound: Sound,
  apps: Apps,
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
