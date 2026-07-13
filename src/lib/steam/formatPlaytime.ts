/** Steam playtime label like `"45 min"` or `"70 hrs"`; null when missing or zero. */
export function formatPlaytime(minutes?: number): string | null {
  if (!minutes || minutes <= 0) {
    return null;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 1) {
    return `${minutes} min`;
  }
  return `${hours.toLocaleString()} ${hours === 1 ? "hr" : "hrs"}`;
}
