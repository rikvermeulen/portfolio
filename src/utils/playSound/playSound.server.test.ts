/**
 * @jest-environment node
 */

// In Node, typeof window === "undefined", so playSound should return early.
it("does nothing in a server environment", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { playSound } = require("./playSound.ts") as {
    playSound: (fileName: string) => void;
  };
  expect(() => playSound("send")).not.toThrow();
});
