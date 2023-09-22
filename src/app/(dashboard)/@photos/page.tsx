import Photos from '@/components/Bento/types/Photos';

import { getSupabaseClient } from '@/lib/db';

const albums = [{ name: 'apps' }, { name: 'map' }, { name: 'heart' }, { name: 'dog' }];

async function getData(albumName: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from('photos').list(albumName);

  if (error) {
    console.error('Failed to fetch album:', error);
    return [];
  }

  const fetchPublicUrl = async (file: { name: string }) => {
    const fullPath = `${albumName}/${file.name}`;
    const { data: urlData } = await supabase.storage.from('photos').getPublicUrl(fullPath);

    return urlData?.publicUrl;
  };

  return Promise.all(data.map(fetchPublicUrl));
}

export default async function Photoss() {
  const albumPromises = albums.map(async (album) => {
    const data = await getData(album.name);
    return { name: album.name, data };
  });

  const resolvedAlbums = await Promise.all(albumPromises);

  const albumData: Record<string, any> = {};
  resolvedAlbums.forEach((album) => {
    albumData[album.name] = album.data;
  });

  return <Photos albums={albumData} />;
}
