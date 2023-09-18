'use client';

import { Children, createContext, FunctionComponent, ReactNode, useContext, useState } from 'react';
import { motion } from 'framer-motion';

import cc from '@/lib/cc';

interface BentoProps {
  children: ReactNode;
  className?: string;
  size: string;
  hasScreens?: boolean;
  defaultScreen?: number;
  [key: string]: any;
}

const BentoContext = createContext({
  activateScreen: (index: number) => {},
});

const Bento: FunctionComponent<BentoProps> = ({
  className,
  size,
  children,
  hasScreens = false,
  defaultScreen = 0,
  ...props
}) => {
  const [activeScreen, setActiveScreen] = useState<number | null>(defaultScreen);

  if (!hasScreens) {
    return (
      <div data-bento={size} className={cc(className, 'h-full w-full')} {...props}>
        {children}
      </div>
    );
  }

  return (
    <BentoContext.Provider value={{ activateScreen: setActiveScreen }}>
      <div data-bento={size} className={cc(className, 'h-full w-full flex')} {...props}>
        {Children.map(children, (child: React.ReactNode, index: number) => (
          <motion.div
            key={index}
            initial={{ x: '100%' }}
            animate={{ x: activeScreen === index ? '0%' : '100%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            {child}
          </motion.div>
        ))}
      </div>
    </BentoContext.Provider>
  );
};

export const ActivateButton: FunctionComponent<{ screenIndex: number; children: ReactNode }> = ({
  screenIndex,
  children,
}) => {
  const { activateScreen } = useContext(BentoContext);

  return <button onClick={() => activateScreen(screenIndex)}>{children}</button>;
};

export default Bento;
