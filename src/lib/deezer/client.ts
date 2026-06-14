const DEEZER_API = "https://api.deezer.com";

export async function searchDeezerPreview(
  name: string,
  artist: string,
): Promise<string | null> {
  const q = encodeURIComponent(`${name} ${artist}`);

  const response = await fetch(`${DEEZER_API}/search?q=${q}&limit=1`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    data?: { preview?: string }[];
  };

  return data.data?.[0]?.preview ?? null;
}
