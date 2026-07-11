/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useAudioPlayer } from "./index.ts";

function createMockAudio() {
  return {
    src: "",
    volume: 1,
    currentTime: 0,
    paused: true,
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    load: jest.fn(),
  };
}

function setup(
  previewUrls = [
    "https://cdn.example.com/a.mp3",
    "https://cdn.example.com/b.mp3",
  ],
) {
  const { result } = renderHook(() => useAudioPlayer({ previewUrls }));
  const mockAudio = createMockAudio();
  // Set the ref so the hook's audio logic can run.
  Object.assign(result.current.audioRef, { current: mockAudio });
  return { result, mockAudio };
}

describe("useAudioPlayer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("starts with isPlaying false and currentIndex 0", () => {
    const { result } = renderHook(() =>
      useAudioPlayer({ previewUrls: ["a.mp3"] }),
    );
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentIndex).toBe(0);
  });

  it("calls play and sets isPlaying when playOrPause is called on a paused audio", () => {
    const { result, mockAudio } = setup();

    act(() => {
      result.current.playOrPause();
    });

    expect(mockAudio.play).toHaveBeenCalledTimes(1);
    expect(result.current.isPlaying).toBe(true);
  });

  it("fades out and pauses when playOrPause is called on playing audio", async () => {
    const { result, mockAudio } = setup();

    // Start playing
    act(() => {
      result.current.playOrPause();
    });

    // Simulate audio playing (not paused)
    mockAudio.paused = false;

    act(() => {
      result.current.playOrPause();
    });

    // Advance through the fade steps (40 steps × 10ms = 400ms)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockAudio.pause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  it("advances to the next track when goToNext is called", () => {
    const { result } = setup();

    act(() => {
      result.current.goToNext();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("wraps around to the last track when goToPrevious is called at index 0", () => {
    const { result } = setup();

    act(() => {
      result.current.goToPrevious();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("wraps next around to 0 from the last index", () => {
    const { result } = setup();

    act(() => {
      result.current.goToNext();
    });
    act(() => {
      result.current.goToNext();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("does nothing in goToNext/goToPrevious when previewUrls is empty", () => {
    const { result } = renderHook(() => useAudioPlayer({ previewUrls: [] }));

    act(() => {
      result.current.goToNext();
      result.current.goToPrevious();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("updates the audio volume when setVolume is called", () => {
    const { result, mockAudio } = setup();

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(mockAudio.volume).toBe(0.5);
    expect(result.current.volume).toBe(0.5);
  });

  it("fades out and resets currentTime when handleTimeUpdate is called past 26s", () => {
    const { result, mockAudio } = setup();
    mockAudio.currentTime = 27;

    act(() => {
      result.current.handleTimeUpdate();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockAudio.currentTime).toBe(0);
  });

  it("does nothing in handleTimeUpdate when currentTime is below cutoff", () => {
    const { result, mockAudio } = setup();
    mockAudio.currentTime = 10;

    act(() => {
      result.current.handleTimeUpdate();
    });

    expect(mockAudio.pause).not.toHaveBeenCalled();
  });

  it("sets isPlaying false when play() rejects in playOrPause", async () => {
    const { result, mockAudio } = setup();
    mockAudio.play.mockRejectedValueOnce(new Error("NotAllowedError"));

    await act(async () => {
      result.current.playOrPause();
      await Promise.resolve();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("does nothing in playOrPause when audioRef.current is null", () => {
    const { result } = renderHook(() =>
      useAudioPlayer({ previewUrls: ["a.mp3"] }),
    );
    // audioRef.current is null — not set up with a mock audio element

    act(() => {
      result.current.playOrPause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("does not throw when audioRef.current becomes null during the fadeOut tick", () => {
    const { result, mockAudio } = setup();

    // Start playing
    act(() => {
      result.current.playOrPause();
    });
    mockAudio.paused = false;

    // Trigger fadeOut by calling playOrPause while playing
    act(() => {
      result.current.playOrPause();
    });

    // Nullify the ref before the timer tick fires — tick() must handle this gracefully
    Object.assign(result.current.audioRef, { current: null });

    expect(() => {
      act(() => {
        jest.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });

  it("sets isPlaying false when the useEffect play() rejects after goToNext", async () => {
    const { result, mockAudio } = setup();

    act(() => {
      result.current.playOrPause();
    });
    expect(result.current.isPlaying).toBe(true);

    // Call 1 (playOrPause) already happened. Set up remaining calls:
    // Call 2: navigate's direct play (line 102) → resolve
    // Call 3: useEffect re-run → reject → sets isPlaying false
    mockAudio.play
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("NotAllowedError"));

    await act(async () => {
      result.current.goToNext();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("uses empty string url when currentIndex is out of bounds after previewUrls shrinks", () => {
    const { result, rerender } = renderHook(
      ({ previewUrls }: { previewUrls: string[] }) =>
        useAudioPlayer({ previewUrls }),
      { initialProps: { previewUrls: ["a.mp3", "b.mp3"] } },
    );

    const mockAudio = createMockAudio();
    Object.assign(result.current.audioRef, { current: mockAudio });

    // Navigate to index 1
    act(() => {
      result.current.goToNext();
    });
    expect(result.current.currentIndex).toBe(1);

    // Shrink the array — index 1 is now out of bounds; url = undefined ?? ""
    rerender({ previewUrls: ["a.mp3"] });

    expect(mockAudio.src).toBe("");
  });

  it("setVolume does not throw when audioRef.current is null", () => {
    const { result } = renderHook(() =>
      useAudioPlayer({ previewUrls: ["a.mp3"] }),
    );

    expect(() => {
      act(() => {
        result.current.setVolume(0.5);
      });
    }).not.toThrow();
  });

  it("sets isPlaying false when navigate's direct play() rejects", async () => {
    const { result, mockAudio } = setup();

    act(() => {
      result.current.playOrPause();
    });
    expect(result.current.isPlaying).toBe(true);

    // Make the next play() call (navigate's direct play at line 103) reject
    mockAudio.play.mockRejectedValueOnce(new Error("NotAllowedError"));

    await act(async () => {
      result.current.goToNext();
      await Promise.resolve();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("re-plays from the new index when goToNext is called while already playing", async () => {
    const { result, mockAudio } = setup();

    act(() => {
      result.current.playOrPause();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.goToNext();
    });

    // 1: playOrPause, 2: navigate's direct play (line 102), 3: useEffect re-run
    expect(mockAudio.play).toHaveBeenCalledTimes(3);
  });
});
