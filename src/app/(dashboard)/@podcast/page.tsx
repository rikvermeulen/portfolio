import { getSpotifyPodcastResult } from "@/lib/spotify/podcast-service.ts";
import Podcast from "@/modules/Bentos/Podcast/index.ts";

export default async function PodcastPage() {
  const result = await getSpotifyPodcastResult();

  if (!result.ok) {
    return <Podcast episodes={[]} errorMessage={result.errorMessage} />;
  }

  return <Podcast episodes={result.data.episodes} />;
}
