/**
 * @jest-environment jsdom
 */

import type { FormEvent } from "react";

import { playSound } from "@/utils/playSound/index.ts";
import { act, renderHook } from "@testing-library/react";

import { submitContact } from "./Contact.actions.ts";
import { initialMessages } from "./Contact.const.ts";
import useChat from "./useChat.ts";

// Real validation logic is kept (validateStep / hasEnoughText), but STEPS is
// exposed through a getter so individual tests can shrink or sparse it to reach
// the hook's defensive guards, which are otherwise unreachable via real STEPS.
const actualValidation = jest.requireActual<
  typeof import("./Contact.validation.ts")
>("./Contact.validation.ts");

let mockSteps: (typeof actualValidation.STEPS)[number][] = [
  ...actualValidation.STEPS,
];

jest.mock("./Contact.validation.ts", () => {
  const actual = jest.requireActual("./Contact.validation.ts");
  return {
    ...actual,
    get STEPS() {
      return mockSteps;
    },
  };
});

jest.mock("@/utils/playSound/index.ts", () => ({ playSound: jest.fn() }));
jest.mock("./Contact.actions.ts", () => ({ submitContact: jest.fn() }));

const mockPlaySound = playSound as jest.Mock;
const mockSubmitContact = submitContact as jest.Mock;

const makeEvent = () => ({ preventDefault: jest.fn() }) as unknown as FormEvent;

const flush = async () => {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
};

beforeEach(() => {
  jest.useFakeTimers();
  mockSteps = [...actualValidation.STEPS];
  mockPlaySound.mockReset();
  mockSubmitContact.mockReset();
  mockSubmitContact.mockResolvedValue({ ok: true });
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe("useChat", () => {
  it("exposes the initial chat, empty input and idle flags", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.chat).toHaveLength(initialMessages.length);
    expect(result.current.inputValue).toBe("");
    expect(result.current.isDisabled).toBe(false);
    expect(result.current.isDone).toBe(false);
  });

  it("handleFocus opens the conversation once, then no-ops when the chat has grown", () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.handleFocus());

    expect(mockPlaySound).toHaveBeenCalledWith("receive");
    expect(result.current.chat).toHaveLength(initialMessages.length + 1);
    expect(result.current.chat.at(-1)).toMatchObject({
      sender: "admin",
      text: "What is your name?",
    });

    // chat.length !== initialMessages.length → guard returns early.
    act(() => result.current.handleFocus());
    expect(result.current.chat).toHaveLength(initialMessages.length + 1);
  });

  it("handleFocus does nothing when the first question is empty", () => {
    mockSteps = [];
    const { result } = renderHook(() => useChat());

    act(() => result.current.handleFocus());

    expect(mockPlaySound).not.toHaveBeenCalled();
    expect(result.current.chat).toHaveLength(initialMessages.length);
  });

  it("advances a step, schedules the multi-part questions and toggles typing", () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.setInputValue("Rik"));
    act(() => result.current.handleSubmit(makeEvent()));

    expect(mockPlaySound).toHaveBeenCalledWith("send");
    expect(result.current.inputValue).toBe("");
    expect(result.current.chat.at(-1)).toMatchObject({
      sender: "user",
      text: "Rik",
    });
    // scheduleQuestions dispatched SET_TYPING true synchronously.
    expect(result.current.isDisabled).toBe(true);

    // handleFocus now returns early because step !== 0.
    const lengthAfterSubmit = result.current.chat.length;
    act(() => result.current.handleFocus());
    expect(result.current.chat).toHaveLength(lengthAfterSubmit);

    // First question (i === 0, not the last) keeps typing on.
    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.chat.at(-1)).toMatchObject({
      sender: "admin",
      text: "Nice to meet you 👋",
    });
    expect(result.current.isDisabled).toBe(true);

    // Last question (i === questions.length - 1) turns typing off.
    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.chat.at(-1)).toMatchObject({
      sender: "admin",
      text: "So what did you want to talk about?",
    });
    expect(result.current.isDisabled).toBe(false);
    expect(mockPlaySound).toHaveBeenCalledWith("receive");
  });

  it("ignores submits with too little text", () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.setInputValue("a"));
    act(() => result.current.handleSubmit(makeEvent()));

    expect(mockPlaySound).not.toHaveBeenCalled();
    expect(result.current.chat).toHaveLength(initialMessages.length);
  });

  it("ignores submits while the admin is still typing", () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.setInputValue("Rik"));
    act(() => result.current.handleSubmit(makeEvent()));
    expect(result.current.isDisabled).toBe(true);

    const lengthWhileTyping = result.current.chat.length;
    act(() => result.current.setInputValue("A valid message"));
    act(() => result.current.handleSubmit(makeEvent()));

    expect(result.current.chat).toHaveLength(lengthWhileTyping);
  });

  it("replies with the validation error when the answer is invalid", () => {
    const { result } = renderHook(() => useChat());

    // step 0 → 1 (name)
    act(() => result.current.setInputValue("Rik"));
    act(() => result.current.handleSubmit(makeEvent()));
    act(() => jest.advanceTimersByTime(2000));

    // step 1 → 2 (reason)
    act(() => result.current.setInputValue("Just chatting"));
    act(() => result.current.handleSubmit(makeEvent()));
    act(() => jest.advanceTimersByTime(2000));

    // step 2 (phone) with an invalid value → error branch.
    act(() => result.current.setInputValue("ab"));
    act(() => result.current.handleSubmit(makeEvent()));
    act(() => jest.advanceTimersByTime(1000));

    expect(result.current.chat.at(-1)).toMatchObject({
      sender: "admin",
      text: "Please provide a valid phone number.",
    });
  });

  it("submits the form and confirms on success", async () => {
    mockSteps = [actualValidation.STEPS[0]!];
    mockSubmitContact.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useChat());

    act(() => result.current.setInputValue("Rik"));
    await act(async () => {
      result.current.handleSubmit(makeEvent());
      await flush();
    });

    expect(mockSubmitContact).toHaveBeenCalledTimes(1);
    expect(mockPlaySound).toHaveBeenCalledWith("receive");
    expect(result.current.chat.some((m) => m.text.includes("Thanks"))).toBe(
      true,
    );
  });

  it("submits the form and shows a fallback on failure", async () => {
    mockSteps = [actualValidation.STEPS[0]!];
    mockSubmitContact.mockResolvedValue({ ok: false });
    const { result } = renderHook(() => useChat());

    act(() => result.current.setInputValue("Rik"));
    await act(async () => {
      result.current.handleSubmit(makeEvent());
      await flush();
    });

    expect(
      result.current.chat.some((m) => m.text.includes("Something went wrong")),
    ).toBe(true);
  });

  it("stops when the current step no longer exists (defensive guard)", () => {
    mockSteps = [];
    const { result } = renderHook(() => useChat());

    act(() => result.current.setInputValue("Rik"));
    act(() => result.current.handleSubmit(makeEvent()));

    // The user message is added before the guard, but no further step runs.
    expect(result.current.chat.at(-1)).toMatchObject({
      sender: "user",
      text: "Rik",
    });
    expect(result.current.chat).toHaveLength(initialMessages.length + 1);
    // step (0) >= STEPS.length (0) && !isPending → isDone true.
    expect(result.current.isDone).toBe(true);
  });

  it("skips scheduling when the next step is missing (defensive guard)", () => {
    mockSteps = [actualValidation.STEPS[0]!];
    mockSteps.length = 3; // sparse: indices 1 and 2 are holes.
    const { result } = renderHook(() => useChat());

    act(() => result.current.setInputValue("Rik"));
    act(() => result.current.handleSubmit(makeEvent()));

    // Advanced to step 1, but scheduleQuestions bailed on the missing step.
    expect(result.current.isDisabled).toBe(false);
    expect(result.current.chat).toHaveLength(initialMessages.length + 1);
  });

  it("clears pending timeouts on unmount", () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, "clearTimeout");
    const { result, unmount } = renderHook(() => useChat());

    act(() => result.current.setInputValue("Rik"));
    act(() => result.current.handleSubmit(makeEvent()));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
