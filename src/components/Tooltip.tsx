import { FC, ReactNode } from 'react';

import Icon from './Icons/Icon';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

const Tooltip: FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="group relative z-50 flex cursor-pointer">
      {children}
      <span className="absolute -bottom-full left-1/2 z-50 flex w-max translate-x-[-50%] scale-50 justify-center self-center justify-self-center rounded-xl bg-black/50 px-3 py-1 text-sm font-medium text-white opacity-0 shadow-sm backdrop-blur-lg transition-[opacity,transform] duration-300 group-hover:scale-100 group-hover:opacity-100">
        <Icon type="tooltip" className="absolute top-[-19px] w-6 fill-black/50" />
        {content}
      </span>
    </div>
  );
};

export default Tooltip;
