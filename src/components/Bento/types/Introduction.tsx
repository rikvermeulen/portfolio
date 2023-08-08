import Image from 'next/image';

import Bento from '@/components/Bento/Bento';

export default function Introduction() {
  return (
    <Bento size="2x1">
      <Image
        src={'/images/me.jpg'}
        alt="Rik Vermeulen"
        width={'164'}
        height={'164'}
        className=" rounded-full"
      />
      <div className="pt-6">
        <div className="font-bold md:text-3xl">
          <h2>Hey hey, I’m Rik 👋🏻</h2>
        </div>
        <div className="max-w-xl pt-2 text-dark_grey md:text-lg">
          <p>
            I’m a Creative Developer based in Rotterdam, the Netherlands. I develop full-scale
            creative digital experiences for some amazing agencies and hugely talented people. ✨
          </p>
        </div>
      </div>
    </Bento>
  );
}
