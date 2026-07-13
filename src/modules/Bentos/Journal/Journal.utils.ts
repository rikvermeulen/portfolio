import { time } from "@/utils/datetime/index.ts";

import { journalQuestions } from "./Journal.questions.ts";

/** Cumulative days before each month in a non-leap year. */
const DAYS_BEFORE_MONTH = [
  0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
] as const;

/**
 * Maps a calendar date to a stable question index (0–364) so every date
 * shows the same question year after year. Feb 29 reuses Feb 28's slot.
 */
export const getQuestionIndexForDate = (date: Date): number => {
  const month = date.getMonth();
  const day = month === 1 ? Math.min(date.getDate(), 28) : date.getDate();
  /* istanbul ignore next — month is always 0–11 from getMonth(), so the ?? 0 fallback is unreachable */
  return (DAYS_BEFORE_MONTH[month] ?? 0) + day - 1;
};

export const getQuestionForDate = (date: Date): string =>
  /* istanbul ignore next — index is always a valid 0–364 slot, so the ?? "" fallback is unreachable */
  journalQuestions[getQuestionIndexForDate(date)] ?? "";

/** A random index different from `currentIndex`, for the shuffle button. */
export const getRandomQuestionIndex = (currentIndex: number): number => {
  const offset = 1 + Math.floor(Math.random() * (journalQuestions.length - 1));
  return (currentIndex + offset) % journalQuestions.length;
};

/** "Sunday, 12 Jul" — en-GB day/month order with an explicit comma. */
export const formatQuestionDate = (date: Date): string =>
  time.date(date, { locale: "en-GB", month: "short" });
