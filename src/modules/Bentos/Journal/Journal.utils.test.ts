import { journalQuestions } from "./Journal.const.ts";
import {
  formatQuestionDate,
  getQuestionForDate,
  getQuestionIndexForDate,
  getRandomQuestionIndex,
} from "./Journal.utils.ts";

describe("journalQuestions", () => {
  it("contains exactly 365 unique questions", () => {
    expect(journalQuestions).toHaveLength(365);
    expect(new Set(journalQuestions).size).toBe(365);
  });
});

describe("getQuestionIndexForDate", () => {
  it("maps Jan 1 to the first question", () => {
    expect(getQuestionIndexForDate(new Date(2026, 0, 1))).toBe(0);
  });

  it("maps Dec 31 to the last question", () => {
    expect(getQuestionIndexForDate(new Date(2026, 11, 31))).toBe(364);
  });

  it("maps the same calendar date to the same index across years", () => {
    expect(getQuestionIndexForDate(new Date(2026, 6, 12))).toBe(
      getQuestionIndexForDate(new Date(2031, 6, 12)),
    );
  });

  it("maps Feb 29 to Feb 28's slot in leap years", () => {
    const feb28 = getQuestionIndexForDate(new Date(2028, 1, 28));
    const feb29 = getQuestionIndexForDate(new Date(2028, 1, 29));
    expect(feb29).toBe(feb28);
  });

  it("keeps March 1 stable regardless of leap years", () => {
    expect(getQuestionIndexForDate(new Date(2028, 2, 1))).toBe(
      getQuestionIndexForDate(new Date(2026, 2, 1)),
    );
  });
});

describe("getQuestionForDate", () => {
  it("returns the question at the date's index", () => {
    expect(getQuestionForDate(new Date(2026, 0, 1))).toBe(journalQuestions[0]);
  });
});

describe("getRandomQuestionIndex", () => {
  it("never returns the current index and stays in range", () => {
    for (let i = 0; i < 50; i += 1) {
      const next = getRandomQuestionIndex(200);
      expect(next).not.toBe(200);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(journalQuestions.length);
    }
  });
});

describe("formatQuestionDate", () => {
  it("formats as 'Sunday, 12 Jul'", () => {
    expect(formatQuestionDate(new Date(2026, 6, 12))).toBe("Sunday, 12 Jul");
  });
});
