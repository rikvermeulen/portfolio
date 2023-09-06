import Image from 'next/image';
import Link from 'next/link';

import Container from '@/components/Container';

export default function Header() {
  return (
    <header className="absolute top-0 z-10 w-full">
      <Container className="flex place-items-start justify-between py-4 md:py-7">
        <Link href="/" className="flex items-center gap-2 text-black">
          <Image src={'/images/logo.png'} alt="logo" width="20" height="20" />
          <p className="text-xs font-medium sm:text-sm">Rik Vermeulen</p>
        </Link>
      </Container>
    </header>
  );
}
