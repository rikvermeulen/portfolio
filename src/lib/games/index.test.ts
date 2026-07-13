import * as games from "./index.ts";

jest.mock("@env", () => ({
  get env() {
    return {};
  },
}));

describe("games barrel", () => {
  it("re-exports the public API", () => {
    expect(typeof games.getGamesResult).toBe("function");
    expect(typeof games.formatPlaytime).toBe("function");
  });
});
