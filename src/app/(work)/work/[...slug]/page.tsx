import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allProjects } from '@/contentlayer/generated';

import { ButtonPrimary } from '@/components/Button';
import Container from '@/components/Container';
import { Mdx } from '@/components/mdx-components';

export async function generateMetadata({ params }: ProjectProps): Promise<Metadata> {
  const project = await getProjectFromParams(params);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.description,
  };
}

interface ProjectProps {
  params: {
    slug: string[];
  };
}

async function getProjectFromParams(params: ProjectProps['params']) {
  const slug = params?.slug?.join('/');
  const post = allProjects.find((post) => post.slugAsParams === slug);

  if (!post) {
    null;
  }

  return post;
}

export default async function Project({ params }: ProjectProps) {
  const project = await getProjectFromParams(params);

  if (!project) {
    notFound();
  }

  return (
    <main className="bg-white py-24 md:pt-32">
      <Container>
        <article className="relative mx-auto max-w-4xl">
          <div className=" mb-8 border-b border-solid border-primary pb-3">
            <h1 className="mb-2 text-[40px] font-bold">{project.title}</h1>
            {project.description && <p className="mt-0 text-xl text-[#777]">{project.subtitle}</p>}
          </div>
          <div className="grid grid-cols-7 gap-10">
            <div className="order-2 col-span-7 grid grid-cols-1 gap-6 sm:grid-cols-3 md:col-span-2 md:grid-cols-1">
              <div className="col-span-1">
                <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">My role</p>
                <p className="text-base leading-loose">{project.role}</p>
              </div>
              <div className="col-span-1">
                <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">Tools</p>
                <p className="text-base leading-loose">{project.tools}</p>
              </div>
              <div className="col-span-1">
                <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">Timeline</p>
                <p className="text-base leading-loose">{project.timeline}</p>
              </div>
            </div>
            <div className="order-1 col-span-7 md:order-3 md:col-span-5">
              <div className="mb-6">
                <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">Description</p>
                <p className="text-base leading-loose">{project.description}</p>
              </div>
              <div className="mb-6">
                <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">Context</p>
                <p className="mb-8 text-base leading-loose">{project.context}</p>
                {project.website && (
                  <ButtonPrimary label="View on Github" href={project.website} external />
                )}
              </div>
            </div>
          </div>
        </article>
      </Container>
      <Container>
        <section className="mx-auto max-w-4xl">
          <Mdx code={project.body.code} />
        </section>
      </Container>
    </main>
  );
}
