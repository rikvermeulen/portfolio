import Link from 'next/link';

import { MainMenu } from '@/types/const';

import Container from '@/components/Container';
import Pill from '@/components/Pill';

export default function Footer() {
  return (
    <footer className="relative z-50">
      <div className="fixed bottom-5 -z-10 flex w-full items-center justify-center">
        <Pill items={MainMenu} />
      </div>
      <Container className="z-50">
        <div className="mb-8 hidden justify-between font-medium text-black lg:flex">
          <p className="text-sm">©2023 Rik Vermeulen</p>
          <Link className="cursor-pointer text-sm" href="/imprint">
            Imprint & Privacy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
