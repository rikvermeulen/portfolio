import { supabase } from '@/lib/db';
import Photos from '@/components/Bento/types/Photos';

const albums = [{ name: 'apps' }, { name: 'map' }, { name: 'heart' }, { name: 'dog' }];

async function getData(albumName: string) {
  const { data, error } = await supabase.storage.from('photos').list(albumName);

  if (error) {
    console.error('Failed to fetch album:', error);
    return;
  }

  const fetchPublicUrl = async (file: { name: string }) => {
    const fullPath = `${albumName}/${file.name}`;
    const { data: urlData } = await supabase.storage.from('photos').getPublicUrl(fullPath);

    return urlData.publicUrl;
  };

  const urls = await Promise.all(data.map(fetchPublicUrl));

  return urls;
}

export default async function Photoss() {
  const albumData: Record<string, any> = {};
  for (const album of albums) {
    albumData[album.name] = await getData(album.name);
  }

  return <Photos albums={albumData} />;
}
