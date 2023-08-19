import { Fragment } from 'react';
import type { Metadata } from 'next';

import Container from '@/components/Container';
import Grid from '@/components/Grid';
import Icon from '@/components/Icons/Icon';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to my portfolio',
};

export default function Layout({
  children,
  music,
  photos,
  map,
  github,
  contact,
  podcast,
  shows,
}: {
  children: React.ReactNode;
  music: React.ReactNode;
  photos: React.ReactNode;
  map: React.ReactNode;
  github: React.ReactNode;
  contact: React.ReactNode;
  podcast: React.ReactNode;
  shows: React.ReactNode;
}) {
  const bento = [music, photos, map, github, contact, podcast, shows];

  return (
    <main>
      <Container>
        <section className="relative py-24 md:pt-32">
          <div className="mb-2.5 hidden items-center justify-end gap-1 text-dark_grey 2xl:flex">
            <Icon type="mouse" className="shake h-4 w-4 fill-dark_grey" />
            <p className="text-xs ">Click around...</p>
          </div>
          <Grid>
            {children}
            {bento.map((item, index) => (
              <Fragment key={index}>{item}</Fragment>
            ))}
          </Grid>
        </section>
      </Container>
    </main>
  );
}
