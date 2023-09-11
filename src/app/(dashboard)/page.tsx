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
    <Bento size="1x1 md:2x1 2xl:2x2" className="" resize>
      <Image
        src={'/images/me.jpg'}
        alt="Portrait of Rik Vermeulen"
        width={'184'}
        height={'184'}
        className=" w-40 rounded-full 2xl:w-auto"
      />
      <div className="pt-8">
        <h2 className="flex gap-2 text-xl font-bold md:text-[32px]">
          Hey hey, I’m Rik <div className="shake w-fit cursor-pointer"> 👋🏻</div>
        </h2>
        <p className="max-w-xl pt-3 text-dark_grey md:text-xl">
          I’m a Creative Developer based in Heukelum, the Netherlands. I develop full-scale creative
          digital experiences for some amazing agencies and hugely talented people. ✨
        </p>
      </div>
      <div className="hidden pt-6 2xl:block">
        <p className="pt-2 text-dark_grey md:text-xl">
          🐙 Coding:{' '}
          <a href="https://github.com/rikvermeulen" target="_blank">
            @rikvermeulen
          </a>
        </p>
        <p className="pt-1 text-dark_grey md:text-xl">
          💌 Hello? <a href="mailto:hello@rikvermeulen.com">hello@rikvermeulen.com</a>
        </p>
      </div>
    </Bento>
  );
}
