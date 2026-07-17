import {
  useEffect,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useTransition,
} from "react";

import type { IMessage, UserContactData } from "./Contact.types.ts";

import { playSound } from "@/utils/playSound/index.ts";

import { submitContact } from "./Contact.actions.ts";
import { initialMessages } from "./Contact.const.ts";
import { hasEnoughText, STEPS, validateStep } from "./Contact.validation.ts";

interface State {
  step: number;
  chat: IMessage[];
  isTyping: boolean;
}
type Action =
  | { type: "ADD_MESSAGE"; message: IMessage }
  | { type: "SET_TYPING"; value: boolean }
  | { type: "NEXT_STEP" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, chat: [...state.chat, action.message] };
    case "SET_TYPING":
      return { ...state, isTyping: action.value };
    case "NEXT_STEP":
      return { ...state, step: state.step + 1 };
  }
}

const INITIAL_STATE: State = {
  step: 0,
  chat: [...initialMessages],
  isTyping: false,
};

const useChat = () => {
  const [{ step, chat, isTyping }, dispatch] = useReducer(
    reducer,
    INITIAL_STATE,
  );
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optimisticChat, addOptimistic] = useOptimistic(
    chat,
    (prev, msg: IMessage) => [...prev, msg],
  );

  const idRef = useRef(initialMessages.length);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const userDataRef = useRef<UserContactData>({
    name: "",
    reason: "",
    phone: "",
    email: "",
  });

  useEffect(
    () => () => {
      timeoutsRef.current.forEach(clearTimeout);
    },
    [],
  );

  const addMessage = (sender: "user" | "admin", text: string) =>
    dispatch({
      type: "ADD_MESSAGE",
      message: { id: `msg-${idRef.current++}`, sender, text },
    });

  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(() => {
      fn();
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
    }, ms);
    timeoutsRef.current.push(id);
  };

  const scheduleQuestions = (nextStep: number) => {
    const s = STEPS[nextStep];
    if (!s) {
      return;
    }
    const questions = [s.question].flat();
    dispatch({ type: "SET_TYPING", value: true });
    questions.forEach((q, i) => {
      after((i + 1) * 1000, () => {
        playSound("receive");
        addMessage("admin", q);
        if (i === questions.length - 1) {
          dispatch({ type: "SET_TYPING", value: false });
        }
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping || isPending || !hasEnoughText(inputValue)) {
      return;
    }

    const validationError = validateStep(step, inputValue);
    playSound("send");
    addMessage("user", inputValue);
    setInputValue("");

    if (validationError) {
      after(1000, () => {
        playSound("receive");
        addMessage("admin", validationError);
      });
      return;
    }

    const s = STEPS[step];
    if (!s) {
      return;
    }

    userDataRef.current = {
      ...userDataRef.current,
      [s.field]: inputValue,
    } as UserContactData;
    const nextStep = step + 1;

    if (nextStep < STEPS.length) {
      dispatch({ type: "NEXT_STEP" });
      scheduleQuestions(nextStep);
    } else {
      const submitted = userDataRef.current;
      startTransition(async () => {
        addOptimistic({
          id: `opt-${idRef.current}`,
          sender: "admin",
          text: "Thanks 🙏 I will contact you soon",
        });
        const result = await submitContact(submitted);
        playSound("receive");
        addMessage(
          "admin",
          result.ok
            ? "Thanks 🙏 I will contact you soon"
            : "Something went wrong. Try reaching me at rik.vermeulen@greenberry.nl",
        );
      });
    }
  };

  const handleFocus = () => {
    if (step !== 0 || chat.length !== initialMessages.length) {
      return;
    }
    const firstQ = [STEPS[0]?.question].flat()[0];
    if (firstQ) {
      playSound("receive");
      addMessage("admin", firstQ);
    }
  };

  return {
    chat: optimisticChat,
    inputValue,
    isDisabled: isTyping || isPending,
    isDone: step >= STEPS.length && !isPending,
    setInputValue,
    handleSubmit,
    handleFocus,
  };
};

export default useChat;
