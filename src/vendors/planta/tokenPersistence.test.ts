import { readFileSync, writeFileSync } from "node:fs";

import {
  PLANTA_TOKEN_FILE,
  readPersistedTokens,
  writePersistedTokens,
} from "./tokenPersistence.ts";

jest.mock("node:fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

const readFileMock = readFileSync as jest.Mock;
const writeFileMock = writeFileSync as jest.Mock;

describe("Planta token persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads and parses a token set from the file", () => {
    readFileMock.mockReturnValue(
      JSON.stringify({
        accessToken: "a",
        refreshToken: "r",
        tokenType: "Bearer",
      }),
    );

    expect(readPersistedTokens()).toEqual({
      accessToken: "a",
      refreshToken: "r",
      tokenType: "Bearer",
    });
    expect(readFileMock).toHaveBeenCalledWith(PLANTA_TOKEN_FILE, "utf-8");
  });

  it("returns null when the file is missing", () => {
    readFileMock.mockImplementation(() => {
      throw new Error("ENOENT");
    });

    expect(readPersistedTokens()).toBeNull();
  });

  it("returns null when the file is malformed JSON", () => {
    readFileMock.mockReturnValue("{not json");

    expect(readPersistedTokens()).toBeNull();
  });

  it("returns null when the parsed object has no tokens", () => {
    readFileMock.mockReturnValue(JSON.stringify({ tokenType: "Bearer" }));

    expect(readPersistedTokens()).toBeNull();
  });

  it("returns the set when only a refresh token is present", () => {
    readFileMock.mockReturnValue(JSON.stringify({ refreshToken: "r" }));

    expect(readPersistedTokens()).toEqual({ refreshToken: "r" });
  });

  it("writes a token set as pretty JSON", () => {
    writePersistedTokens({ accessToken: "a", refreshToken: "r" });

    expect(writeFileMock).toHaveBeenCalledWith(
      PLANTA_TOKEN_FILE,
      `${JSON.stringify({ accessToken: "a", refreshToken: "r" }, null, 2)}\n`,
      "utf-8",
    );
  });

  it("swallows write errors (read-only filesystem)", () => {
    writeFileMock.mockImplementation(() => {
      throw new Error("EROFS");
    });

    expect(() => writePersistedTokens({ accessToken: "a" })).not.toThrow();
  });
});
