import { getSpotifyMusicResult } from "@/lib/spotify/service.ts";
import { Music } from "@/modules/Bentos/index.ts";

export default async function MusicPage() {
  const result = await getSpotifyMusicResult();

  if (!result.ok) {
    return <Music errorMessage={result.errorMessage} tracks={[]} />;
  }

  return <Music tracks={result.data.tracks} />;
}
