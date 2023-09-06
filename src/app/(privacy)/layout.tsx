import { PropsWithChildren } from 'react';

import { Animate } from '@/components/Animate';

export default function Layout({ children }: PropsWithChildren) {
  return <Animate>{children}</Animate>;
}
