'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';

import Menubutton from './buttons/MenuButton';

// classes menu
const defaultClasses = [`z-30`, `z-20`, `z-10`];

const activeClasses = [
  'translate-x-[-100%] sm:translate-x-0 menu-scroll',
  'translate-x-[-200%] sm:translate-x-[-100%] menu-scroll w-[75px] sm:w-[65px]',
  'translate-x-[-300%] sm:translate-x-[-200%] menu-scroll w-[75px] sm:w-[65px]',
];

export default function Menu({
  menu,
  isOpen,
  callbackMenu,
}: {
  menu: Array<{ label: string; url: string }>;
  isOpen: boolean;
  callbackMenu: (state: boolean) => void;
}) {
  function handleClick(state: boolean) {
    callbackMenu(state);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex"
    >
      <Menubutton
        classNode={clsx(
          isOpen ? 'w-10' : 'w-[75px]',
          'menu-scroll z-40 mr-2 justify-center sm:hidden',
        )}
        label={isOpen ? 'x' : 'Menu'}
        onClick={() => {
          handleClick(!isOpen);
        }}
      />
      {menu.map((item, key) => {
        return (
          <Menubutton
            key={key}
            classNode={clsx(`${defaultClasses[key]} mr-2`, !isOpen && `${activeClasses[key]}`)}
            href={item?.url}
            classLabel={clsx(
              !isOpen && key === 0 && 'opacity-0 sm:opacity-100',
              'transition-opacity',
            )}
            label={item?.label}
            onClick={() => {
              handleClick(!isOpen);
            }}
          />
        );
      })}
    </motion.div>
  );
}
