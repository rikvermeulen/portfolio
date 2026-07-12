import {
  formatCalendarDate,
  formatClock,
  formatRelativeTime,
} from "./datetime.ts";

describe("formatClock", () => {
  it("formats afternoon time in 12-hour form", () => {
    expect(formatClock(new Date(2026, 6, 12, 15, 5))).toBe("3:05 PM");
  });

  it("renders midnight as 12 AM and noon as 12 PM", () => {
    expect(formatClock(new Date(2026, 6, 12, 0, 0))).toBe("12:00 AM");
    expect(formatClock(new Date(2026, 6, 12, 12, 30))).toBe("12:30 PM");
  });
});

describe("formatCalendarDate", () => {
  it("defaults to en-US long month order", () => {
    expect(formatCalendarDate(new Date(2026, 6, 12))).toBe("Sunday, July 12");
  });

  it("supports en-GB short month order", () => {
    expect(
      formatCalendarDate(new Date(2026, 6, 12), {
        locale: "en-GB",
        month: "short",
      }),
    ).toBe("Sunday, 12 Jul");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 12, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("describes a past timestamp in the largest fitting unit", () => {
    expect(formatRelativeTime(new Date(2026, 6, 10, 12, 0, 0))).toBe(
      "2 days ago",
    );
    expect(formatRelativeTime(new Date(2026, 6, 12, 11, 30, 0))).toBe(
      "30 minutes ago",
    );
  });
});
