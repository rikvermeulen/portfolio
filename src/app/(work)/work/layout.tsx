import { PropsWithChildren } from 'react';

import { AnimatePage } from '@/components/AnimatePage';

const animationValues = {
  onTheRight: { y: '100%' },
  inTheCenter: { y: 0 },
  onTheLeft: { y: 0, scale: 0.9, opacity: 0.5 },
  transition: { duration: 0.8, ease: 'easeInOut' },
};

export default function Layout({ children }: PropsWithChildren) {
  return <AnimatePage animationValues={animationValues}>{children}</AnimatePage>;
}
