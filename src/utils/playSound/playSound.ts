const pool: Record<string, HTMLAudioElement> = {};

export function playSound(fileName: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (!pool[fileName]) {
      pool[fileName] = new Audio(`/sounds/${fileName}.mp3`);
    }
    (pool[fileName]!.cloneNode(true) as HTMLAudioElement)
      .play()
      .catch((_error: unknown) => {
        // Silently fail — sounds are optional UX
      });
  } catch {
    // Audio API unavailable
  }
}
