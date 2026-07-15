import { socials } from "./socials.const.ts";

describe("socials", () => {
  it("exports the shared social links", () => {
    expect(socials.length).toBeGreaterThan(0);
    expect(socials.every((link) => link.name && link.icon && link.url)).toBe(
      true,
    );
  });
});
