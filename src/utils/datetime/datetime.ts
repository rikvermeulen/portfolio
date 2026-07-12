/**
 * Shared date/time formatting. Bentos and widgets that need to render a clock,
 * a calendar date, or a relative timestamp all go through here so the plumbing
 * (Intl config, division tables, padding) lives in one place.
 */

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Ordered largest-fitting-unit table for {@link formatRelativeTime}. */
const RELATIVE_DIVISIONS = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
] as const;

/** Wall-clock time like `"3:05 PM"` — 12-hour, zero-padded minutes. */
export function formatClock(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

interface CalendarDateOptions {
  /** BCP-47 locale tag; drives day/month ordering. Defaults to `"en-US"`. */
  readonly locale?: string;
  /** Month representation. Defaults to `"long"` (`"July"` vs `"Jul"`). */
  readonly month?: "long" | "short";
}

/**
 * `"Weekday, <date>"` with the weekday always followed by a comma.
 *
 * @example formatCalendarDate(d) // "Sunday, July 12" (en-US)
 * @example formatCalendarDate(d, { locale: "en-GB", month: "short" }) // "Sunday, 12 Jul"
 */
export function formatCalendarDate(
  date: Date,
  { locale = "en-US", month = "long" }: CalendarDateOptions = {},
): string {
  const weekday = date.toLocaleDateString(locale, { weekday: "long" });
  const dayMonth = date.toLocaleDateString(locale, { day: "numeric", month });
  return `${weekday}, ${dayMonth}`;
}

/** `"2 days ago"`, `"yesterday"`, `"3 weeks ago"` — relative to now. */
export function formatRelativeTime(date: Date): string {
  let value = (date.getTime() - Date.now()) / 1000;
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(value) < division.amount) {
      return relativeTime.format(Math.round(value), division.unit);
    }
    value /= division.amount;
  }
  /* istanbul ignore next — the final division's infinite bound always matches, so the loop always returns first */
  return relativeTime.format(Math.round(value), "year");
}
