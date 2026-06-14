/**
 * @jest-environment jsdom
 */

let playSound: (fileName: string) => void;
let MockAudio: jest.Mock;
let mockPlay: jest.Mock;
let mockCloneNode: jest.Mock;

beforeEach(() => {
  // Reset module registry so the pool starts empty for every test
  jest.resetModules();

  mockPlay = jest.fn().mockResolvedValue(undefined);
  mockCloneNode = jest.fn().mockReturnValue({ play: mockPlay });
  MockAudio = jest
    .fn()
    .mockImplementation(() => ({ cloneNode: mockCloneNode }));

  Object.defineProperty(window, "Audio", { writable: true, value: MockAudio });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ({ playSound } = require("./playSound.ts"));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("playSound", () => {
  test("constructs an Audio element with the correct path on first call", () => {
    playSound("send");

    expect(MockAudio).toHaveBeenCalledWith("/sounds/send.mp3");
  });

  test("clones the pooled element and calls play", () => {
    playSound("send");

    expect(mockCloneNode).toHaveBeenCalledWith(true);
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  test("reuses the pool for the same file — constructor called only once", () => {
    playSound("receive");
    playSound("receive");
    playSound("receive");

    expect(MockAudio).toHaveBeenCalledTimes(1);
    expect(mockPlay).toHaveBeenCalledTimes(3);
  });

  test("creates separate pool entries for different file names", () => {
    playSound("send");
    playSound("receive");

    expect(MockAudio).toHaveBeenCalledTimes(2);
    expect(MockAudio).toHaveBeenCalledWith("/sounds/send.mp3");
    expect(MockAudio).toHaveBeenCalledWith("/sounds/receive.mp3");
  });

  test("does not throw when play() rejects", async () => {
    mockPlay.mockRejectedValueOnce(new Error("NotAllowedError"));

    expect(() => playSound("send")).not.toThrow();
    // Let the rejected promise settle without an unhandled rejection
    await Promise.resolve();
  });

  test("does not throw when the Audio constructor throws", () => {
    MockAudio.mockImplementationOnce(() => {
      throw new Error("Audio unavailable");
    });

    expect(() => playSound("send")).not.toThrow();
  });
});
