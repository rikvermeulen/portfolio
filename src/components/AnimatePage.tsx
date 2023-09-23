'use client';

import { PropsWithChildren, useContext, useRef } from 'react';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

interface AnimationValues {
  onTheRight?: object;
  inTheCenter?: object;
  onTheLeft?: object;
  transition?: object;
}

interface AnimatePageProps {
  animationValues?: AnimationValues;
}

export function useLayoutRouterContext() {
  return useContext(LayoutRouterContext);
}

function FrozenRouter(props: PropsWithChildren<{}>) {
  const context = useLayoutRouterContext();
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>{props.children}</LayoutRouterContext.Provider>
  );
}

export function AnimatePage({
  children,
  animationValues = {
    onTheRight: {},
    inTheCenter: {},
    onTheLeft: {},
    transition: {},
  },
}: PropsWithChildren<AnimatePageProps>) {
  const pathname = usePathname();

  const { onTheRight, inTheCenter, onTheLeft, transition } = animationValues;

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={pathname}
        initial={onTheRight}
        animate={inTheCenter}
        exit={onTheLeft}
        transition={transition}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
