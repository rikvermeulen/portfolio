import { time } from "./datetime.ts";

describe("time.clock", () => {
  it("formats afternoon time in 12-hour form", () => {
    expect(time.clock(new Date(2026, 6, 12, 15, 5))).toBe("3:05 PM");
  });

  it("renders midnight as 12 AM and noon as 12 PM", () => {
    expect(time.clock(new Date(2026, 6, 12, 0, 0))).toBe("12:00 AM");
    expect(time.clock(new Date(2026, 6, 12, 12, 30))).toBe("12:30 PM");
  });
});

describe("time.date", () => {
  it("defaults to en-US long month order", () => {
    expect(time.date(new Date(2026, 6, 12))).toBe("Sunday, July 12");
  });

  it("supports en-GB short month order", () => {
    expect(
      time.date(new Date(2026, 6, 12), { locale: "en-GB", month: "short" }),
    ).toBe("Sunday, 12 Jul");
  });
});

describe("time.ago", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 12, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("describes a past timestamp in the largest fitting unit", () => {
    expect(time.ago(new Date(2026, 6, 10, 12, 0, 0))).toBe("2 days ago");
    expect(time.ago(new Date(2026, 6, 12, 11, 30, 0))).toBe("30 minutes ago");
  });
});

describe("time.agoFromUnix", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 12, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns null for missing or invalid timestamps", () => {
    expect(time.agoFromUnix()).toBeNull();
    expect(time.agoFromUnix(0)).toBeNull();
    expect(time.agoFromUnix(-1)).toBeNull();
  });

  it("formats a unix-seconds timestamp relative to now", () => {
    const unixSeconds = Math.floor(
      new Date(2026, 6, 10, 12, 0, 0).getTime() / 1000,
    );
    expect(time.agoFromUnix(unixSeconds)).toBe("2 days ago");
  });
});

describe("time.stamp", () => {
  const now = new Date(2026, 6, 12, 12, 0, 0);

  it("shows just the clock time for events earlier today", () => {
    expect(time.stamp(new Date(2026, 6, 12, 9, 41, 0), now)).toBe("9:41 AM");
  });

  it("prefixes yesterday with 'Yesterday,'", () => {
    expect(time.stamp(new Date(2026, 6, 11, 18, 21, 0), now)).toBe(
      "Yesterday, 6:21 PM",
    );
  });

  it("falls back to the calendar date for older events", () => {
    expect(time.stamp(new Date(2026, 6, 5, 10, 0, 0), now)).toBe(
      "Sunday, July 5",
    );
  });

  it("defaults 'now' to the current time", () => {
    jest.useFakeTimers().setSystemTime(now);
    try {
      expect(time.stamp(new Date(2026, 6, 12, 9, 41, 0))).toBe("9:41 AM");
    } finally {
      jest.useRealTimers();
    }
  });
});
