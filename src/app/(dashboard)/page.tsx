import type { Metadata } from 'next';
import Image from 'next/image';

import Bento from '@/components/Bento/Bento';

export const metadata: Metadata = {
  title: 'Home - Rik Vermeulen Portfolio',
  description:
    'Rik Vermeulen - Creative Developer based in Rotterdam, the Netherlands. Explore Rik’s digital portfolio and the creative experiences he has developed through the years.',
};

export default function Home() {
  return (
    <Bento size="2x1">
      <Image
        src={'/images/me.jpg'}
        alt="Portrait of Rik Vermeulen"
        width={'164'}
        height={'164'}
        className=" rounded-full"
      />
      <div className="pt-6">
        <div className="text-xl font-bold md:text-3xl">
          <h2 className="flex gap-2">
            Hey hey, I’m Rik <div className="shake w-fit"> 👋🏻</div>
          </h2>
        </div>
        <p className="max-w-xl pt-2 text-dark_grey md:text-lg">
          I’m a Creative Developer based in Heukelum, the Netherlands. I develop full-scale creative
          digital experiences for some amazing agencies and hugely talented people. ✨
        </p>
      </div>
    </Bento>
  );
}
