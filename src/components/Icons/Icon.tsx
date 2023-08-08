import React, { FC, ReactElement } from 'react';

import Mouse from './types/Mouse';

interface Icons {
  [index: string]: FC<any>;
}

const icons: Icons = {
  mouse: Mouse,
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
