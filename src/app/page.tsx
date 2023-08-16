import type { Metadata } from 'next';

import { BentoTypes } from '@/components/Bento/types/index';
import Container from '@/components/Container';
import Grid from '@/components/Grid';
import Icon from '@/components/Icons/Icon';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to my portfolio',
};

export default function Home() {
  return (
    <main>
      <Container>
        <section className="relative py-24 md:pt-32">
          <div className="mb-2.5 hidden items-center justify-end gap-1 text-dark_grey 2xl:flex">
            <Icon type="mouse" className="h-4 w-4 fill-dark_grey" />
            <p className="text-xs ">Click around...</p>
          </div>
          <Grid>
            {BentoTypes.map((Item, index) => (
              <Item key={index} />
            ))}
          </Grid>
        </section>
      </Container>
    </main>
  );
}
