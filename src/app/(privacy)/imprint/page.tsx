import { notFound } from 'next/navigation';
import { allPrivacies } from '@/contentlayer/generated';

import Container from '@/components/Container';
import { Mdx } from '@/components/Md/mdx-components';

async function getImprint() {
  const post = allPrivacies.find((post) => post.slugAsParams === 'imprint');

  if (!post) {
    null;
  }

  return post;
}

const Imprint = async () => {
  const imprint = await getImprint();

  if (!imprint) {
    notFound();
  }
  return (
    <main className="py-24 md:pt-32">
      <div className=" mx-auto w-full max-w-xl text-center">
        <h2 className="mb-2 text-2xl font-medium lg:text-4xl">{imprint.name}</h2>
        <p className="mb-2 text-2xl font-medium lg:text-4xl">{imprint.address}</p>
        <a className="mb-2 text-2xl font-medium lg:text-4xl">{imprint.mail}</a>
        <p className="mt-8 text-sm">
          Code & Design:{' '}
          <span className="ml-2 rounded-md bg-gray-100 px-2 py-1">Rik Vermeulen</span>
        </p>
      </div>
      <Container>
        <section className="mx-auto mt-8 max-w-3xl">
          <Mdx code={imprint.body.code} />
        </section>
      </Container>
    </main>
  );
};

export default Imprint;
