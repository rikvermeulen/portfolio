/**
 * Shared date/time formatting. Every clock, calendar date, relative timestamp,
 * and notification stamp goes through the `time` object below, so the Intl
 * plumbing (locale config, the relative-unit table) lives in exactly one place.
 */

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Ordered largest-fitting-unit table for `time.ago`. */
const RELATIVE_DIVISIONS = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
] as const;

interface CalendarDateOptions {
  /** BCP-47 locale tag; drives day/month ordering. Defaults to `"en-US"`. */
  readonly locale?: string;
  /** Month representation. Defaults to `"long"` (`"July"` vs `"Jul"`). */
  readonly month?: "long" | "short";
}

/** Wall-clock time like `"3:05 PM"` — 12-hour, zero-padded minutes. */
function clock(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * `"Weekday, <date>"` with the weekday always followed by a comma.
 *
 * @example time.date(d) // "Sunday, July 12" (en-US)
 * @example time.date(d, { locale: "en-GB", month: "short" }) // "Sunday, 12 Jul"
 */
function calendarDate(
  date: Date,
  { locale = "en-US", month = "long" }: CalendarDateOptions = {},
): string {
  const weekday = date.toLocaleDateString(locale, { weekday: "long" });
  const dayMonth = date.toLocaleDateString(locale, { day: "numeric", month });
  return `${weekday}, ${dayMonth}`;
}

/** `"2 days ago"`, `"yesterday"`, `"3 weeks ago"` — relative to now. */
function ago(date: Date): string {
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

/** Like `time.ago`, from a unix-seconds timestamp; null when missing or invalid. */
function agoFromUnix(unixSeconds?: number): string | null {
  if (!unixSeconds || unixSeconds <= 0) {
    return null;
  }
  return ago(new Date(unixSeconds * 1000));
}

/** Calendar days between two dates, ignoring the time of day. */
function calendarDayDelta(date: Date, now: Date): number {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOf(now) - startOf(date)) / 86_400_000);
}

/**
 * macOS-notification-style stamp: `"6:21 PM"` for today, `"Yesterday, 6:21 PM"`
 * for yesterday, and the calendar date (`"Sunday, July 12"`) for anything older.
 * `now` is injectable for deterministic tests.
 */
function stamp(date: Date, now: Date = new Date()): string {
  const delta = calendarDayDelta(date, now);
  if (delta <= 0) {
    return clock(date);
  }
  if (delta === 1) {
    return `Yesterday, ${clock(date)}`;
  }
  return calendarDate(date);
}

/**
 * One home for date/time display formatting.
 *
 * - `time.clock(d)`  → `"3:05 PM"`
 * - `time.date(d)`   → `"Sunday, July 12"`
 * - `time.ago(d)`    → `"2 days ago"`
 * - `time.agoFromUnix(s)` → `"2 days ago"` or null
 * - `time.stamp(d)`  → today/yesterday/date, notification-style
 */
export const time = {
  clock,
  date: calendarDate,
  ago,
  agoFromUnix,
  stamp,
} as const;
