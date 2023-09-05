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

type ProjectProps = {
  id: string;
  slug: string;
  title: string;
  description: string;
  role: string;
};

export default function Work() {
  return (
    <main className="h-screen">
      <Container>
        <section className="relative pb-24 pt-16 md:pt-32">
          <Grid>
            {allProjects.map((project) => (
              <Bento size="2x2" className="bento relative z-0 bg-gray-100 p-5" key={project._id}>
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
                          width={40}
                          height={40}
                        />
                        <h2 className="text-2xl mix-blend-difference">{project.title}</h2>
                      </div>
                      <p className="mt-3 max-w-sm mix-blend-difference">{project.description}</p>
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
        </section>
      </Container>
    </main>
  );
}
