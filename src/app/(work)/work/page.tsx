import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { allProjects } from '@/contentlayer/generated';

import Bento from '@/components/Bento/Bento';
import Container from '@/components/Container';
import Grid from '@/components/Grid';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Welcome to my portfolio',
};

const BREAKPOINTS = {
  768: { columns: 2, cellGap: 16 },
  1536: { columns: 4, cellGap: 16 },
};

export default function Work() {
  return (
    <main className="h-full">
      <Container>
        <section className="relative mx-auto max-w-[710px] pb-24 pt-16 md:pt-32 2xl:max-w-none">
          <Grid breakpoints={BREAKPOINTS} className="xl:!grid-cols-2 2xl:!grid-cols-4">
            {allProjects.map((project) => (
              <Bento
                size="1x1 md:2x2"
                className="bento relative z-0 max-w-[710px] bg-gray-100 p-5 transition-transform duration-300 hover:scale-[1.005]"
                key={project._id}
              >
                <Link href={project.slug}>
                  <div className="absolute inset-0 -z-10">
                    <Image
                      src={`/images/projects/${project.title}/cover.png`}
                      className={`h-full w-full object-cover`}
                      alt="media"
                      width={710}
                      height={710}
                    />
                  </div>
                  <div className="flex h-full flex-col justify-between">
                    <div className="text-white">
                      <div className="flex items-center gap-3 font-bold">
                        <Image
                          src={`/images/projects/${project.title}/logo.png`}
                          className={`rounded-md drop-shadow-md transition-transform duration-300 ease-in-out hover:scale-105`}
                          alt="media"
                          width={32}
                          height={32}
                        />
                        <h2 className="text-xl mix-blend-difference md:text-2xl">
                          {project.title}
                        </h2>
                      </div>
                      <p className="mt-3 max-w-sm text-xs mix-blend-difference md:text-base">
                        {project.description}
                      </p>
                    </div>
                    <div className="text-white mix-blend-difference">
                      <p className="font-bold ">My role</p>
                      <p className="text-sm ">{project.role}</p>
                    </div>
                  </div>
                </Link>
              </Bento>
            ))}
          </Grid>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-bold">More projects</h2>
            <p className="text-sm "> Coming soon...</p>
          </div>
        </section>
      </Container>
    </main>
  );
}
