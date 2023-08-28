'use client';

import { PropsWithChildren, useContext, useRef } from 'react';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

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

export function Animate({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // const onTheRight = { y: '100%', background: '#000' };
  // const inTheCenter = { y: 0, background: '#fff' };
  // const onTheLeft = { y: '0', background: 'red', borderRadius: '40px', scale: 0.9 };

  // const transition = { duration: 1.0, ease: 'easeInOut' };

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={pathname}
        // initial={onTheRight}
        // animate={inTheCenter}
        // exit={onTheLeft}
        // transition={transition}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
