import Image from 'next/image';
import Link from 'next/link';

import Container from '@/components/Container';

export default function Header() {
  return (
    <header className="absolute top-0 z-10 w-full">
      <Container className="flex place-items-start justify-between py-4 md:py-7">
        <div className="flex items-center gap-2 text-black">
          <Link href="/">
            <Image src={'/images/logo.png'} alt="logo" width="20" height="20" />
          </Link>
          <p className="text-sm">Rik Vermeulen</p>
        </div>
      </Container>
    </header>
  );
}
