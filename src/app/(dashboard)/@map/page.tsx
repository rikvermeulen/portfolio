import dynamic from 'next/dynamic';

const FindMe = dynamic(() => import('@/components/Bento/types/FindMe'));

export default async function Map() {
  return <FindMe />;
}
