import { formatPlaytime } from "./formatPlaytime.ts";

describe("formatPlaytime", () => {
  it("returns null for missing or zero minutes", () => {
    expect(formatPlaytime()).toBeNull();
    expect(formatPlaytime(0)).toBeNull();
  });

  it("shows minutes under one hour", () => {
    expect(formatPlaytime(45)).toBe("45 min");
  });

  it("shows hours at one hour or more", () => {
    expect(formatPlaytime(60)).toBe("1 hr");
    expect(formatPlaytime(120)).toBe("2 hrs");
    expect(formatPlaytime(4200)).toBe("70 hrs");
  });
});
