import { PropsWithChildren } from 'react';

import { Animate } from '@/components/AnimatePage';

export default function Layout({ children }: PropsWithChildren) {
  return <Animate>{children}</Animate>;
}
