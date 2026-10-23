import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import type { IMessage, UserContactData } from "./Contact.types.ts";

import { playSound } from "@/utils/playSound/index.ts";

import { submitContact } from "./Contact.actions.ts";
import { initialMessages } from "./Contact.const.ts";
import { hasEnoughText, STEPS, validateStep } from "./Contact.validation.ts";

const CONFIRMATION = "Thanks 🙏 I will contact you soon";
const FAILURE =
  "Something went wrong. Try reaching me at rik.vermeulen@greenberry.nl";

const EMPTY_DATA: UserContactData = {
  name: "",
  reason: "",
  phone: "",
  email: "",
};

const useChat = () => {
  const [chat, setChat] = useState<IMessage[]>([...initialMessages]);
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optimisticChat, addOptimistic] = useOptimistic(
    chat,
    (prev, message: IMessage) => [...prev, message],
  );

  const idRef = useRef(initialMessages.length);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const userDataRef = useRef<UserContactData>({ ...EMPTY_DATA });

  // Cancel any pending "typing" timeouts when the tile unmounts.
  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const addMessage = (sender: IMessage["sender"], text: string) => {
    setChat((prev) => [
      ...prev,
      { id: `msg-${idRef.current++}`, sender, text },
    ]);
  };

  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
  };

  // Stream a step's admin question(s) one per second, toggling the typing
  // indicator around the batch.
  const askQuestions = (nextStep: number) => {
    const questions = [STEPS[nextStep]?.question ?? []].flat();
    if (questions.length === 0) {
      return;
    }

    setIsTyping(true);
    questions.forEach((question, index) => {
      after((index + 1) * 1000, () => {
        playSound("receive");
        addMessage("admin", question);
        if (index === questions.length - 1) {
          setIsTyping(false);
        }
      });
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isTyping || isPending || !hasEnoughText(inputValue)) {
      return;
    }

    const answer = inputValue;
    playSound("send");
    addMessage("user", answer);
    setInputValue("");

    const validationError = validateStep(step, answer);
    if (validationError) {
      after(1000, () => {
        playSound("receive");
        addMessage("admin", validationError);
      });
      return;
    }

    const current = STEPS[step];
    if (!current) {
      return;
    }
    userDataRef.current = { ...userDataRef.current, [current.field]: answer };

    const nextStep = step + 1;
    if (nextStep < STEPS.length) {
      setStep(nextStep);
      askQuestions(nextStep);
      return;
    }

    // Final step: submit, showing the confirmation optimistically while the
    // server action runs, then reconciling with the real outcome.
    const submission = userDataRef.current;
    startTransition(async () => {
      addOptimistic({ id: `opt-${idRef.current}`, sender: "admin", text: CONFIRMATION }); // prettier-ignore
      const result = await submitContact(submission);
      playSound("receive");
      addMessage("admin", result.ok ? CONFIRMATION : FAILURE);
    });
  };

  // Opens the conversation the first time the visitor focuses the input.
  const handleFocus = () => {
    if (step !== 0 || chat.length !== initialMessages.length) {
      return;
    }
    const firstQuestion = [STEPS[0]?.question].flat()[0];
    if (firstQuestion) {
      playSound("receive");
      addMessage("admin", firstQuestion);
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
