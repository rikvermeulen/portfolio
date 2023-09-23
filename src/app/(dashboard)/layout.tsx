import { Fragment, ReactNode } from 'react';

import Container from '@/components/Container';
import Grid from '@/components/Grid';
import Icon from '@/components/Icons/Icon';

export default function Layout({
  children,
  music,
  photos,
  map,
  github,
  contact,
  podcast,
  shows,
  books,
  twitter,
}: {
  children: ReactNode;
  music: ReactNode;
  photos: ReactNode;
  map: ReactNode;
  github: ReactNode;
  contact: ReactNode;
  podcast: ReactNode;
  shows: ReactNode;
  books: ReactNode;
  twitter: ReactNode;
}) {
  const bento = [music, photos, contact, map, github, podcast, shows, books];

  return (
    <main>
      <Container>
        <section className="relative py-24 md:pt-32">
          <div className="mb-2.5 hidden items-center justify-end gap-2 text-[#949494] 2xl:flex">
            <Icon type="mouse" className="shake h-3 w-3 fill-[#949494]" />
            <p className="text-sm ">Look around...</p>
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
