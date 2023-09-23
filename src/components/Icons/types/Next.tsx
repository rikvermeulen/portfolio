'use client';

import { motion, useAnimation } from 'framer-motion';

import cc from '@/lib/cc';

export default function Next({ className, ...props }: { className?: string }) {
  const controls = useAnimation();

  const handleTap = async () => {
    await controls.start('tap');
    controls.set('initial');
  };

  const inVariants = {
    initial: { scale: 0, opacity: 0 },
    tap: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.1,
        ease: 'easeInOut',
      },
    },
  };

  const nextVariants = {
    initial: { x: 0, scale: 1 },
    tap: {
      scale: 1,
      x: '-8px',
      transition: {
        duration: 0.3,
        delay: 0.1,
        ease: 'easeInOut',
      },
    },
  };

  const outVariants = {
    initial: { x: '-2px', scale: 1, opacity: 1 },
    tap: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.svg
      id="next"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22.651 22.651"
      width={22.651}
      height={22.651}
      {...props}
      className={className}
      initial="initial"
      animate={controls}
      onTap={handleTap}
    >
      <motion.path
        d="M10.443,15.4a1.438,1.438,0,0,1,0-2.329L20.551,5.849a1.392,1.392,0,0,1,2.192,1.165V21.455a1.392,1.392,0,0,1-2.192,1.165Z"
        variants={inVariants}
        className={'origin-left'}
      />
      <motion.path
        d="M10.443,15.4a1.438,1.438,0,0,1,0-2.329L20.551,5.849a1.392,1.392,0,0,1,2.192,1.165V21.455a1.392,1.392,0,0,1-2.192,1.165Z"
        variants={nextVariants}
      />
      <motion.path
        d="M4.023,15.4a1.438,1.438,0,0,1,0-2.329L14.132,5.849a1.392,1.392,0,0,1,2.192,1.165V21.455a1.392,1.392,0,0,1-2.192,1.165Z"
        variants={outVariants}
        className={'origin-right'}
      />
    </motion.svg>
  );
}
