import { initialMessages, questionsAndActions } from "@/types/const.ts";
import {
  hasEnoughText,
  isValidEmail,
  isValidPhoneNumber,
} from "@/utils/validation.tsx";
import { useState } from "react";

import type { IMessage } from "@/types/types";
import type { RefObject } from "react";

import { useSound } from "./useSound.tsx";

const useChat = (
  inputRef: RefObject<HTMLInputElement | null>,
  buttonRef: RefObject<HTMLButtonElement | null>,
) => {
  const [step, setStep] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<IMessage[]>(initialMessages);
  const [userData, setUserData] = useState({
    name: "",
    reason: "",
    phone: "",
    email: "",
  });

  const { playSound } = useSound();

  const addMessage = (sender: "user" | "admin", text: string) => {
    setChat((prevChat) => [...prevChat, { sender, text }]);
  };

  const toggleInputs = (disabled: boolean) => {
    if (inputRef.current && buttonRef.current) {
      inputRef.current.disabled = disabled;
      buttonRef.current.disabled = disabled;
      inputRef.current.style.opacity = disabled ? "0.2" : "1";
    }
  };

  const validateInputAndGetError = () => {
    if (
      (step === 2 && !isValidPhoneNumber(message)) ||
      (step === 3 && !isValidEmail(message)) ||
      !hasEnoughText(message)
    ) {
      return step === 2
        ? "Please provide a valid phone number."
        : step === 3
          ? "Please provide a valid email address."
          : "Your message is too short. Please provide more details.";
    }
    return "";
  };

  const sendData = async (data: Record<string, string | number | boolean>) => {
    try {
      toggleInputs(true);
      const res = await fetch(`/api/contact`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      addMessage("admin", "Thanks 🙏 I will contact you soon");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const sendNextQuestion = () => {
    const nextStep = questionsAndActions[step + 1];
    if (nextStep?.question) {
      const nextQuestion = nextStep.question;
      toggleInputs(true);
      const questionsArray = Array.isArray(nextQuestion)
        ? nextQuestion
        : [nextQuestion];

      questionsArray.forEach((q, i) => {
        setTimeout(
          () => {
            playSound("receive");
            addMessage("admin", q);
            if (i === questionsArray.length - 1) {
              toggleInputs(false);
            }
          },
          (i + 1) * 1000,
        );
      });
    }
  };

  const processUserInputAndMoveToNextStep = () => {
    const currentStep = questionsAndActions[step];
    if (currentStep?.action) {
      const newUserData = currentStep.action(message, userData);
      setUserData(newUserData);
      if (step < questionsAndActions.length - 1) {
        setStep((prevStep) => prevStep + 1);
        sendNextQuestion();
      } else {
        sendData(newUserData);
      }
    }
  };

  const handleSendClick = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    playSound("send");
    addMessage("user", message);
    const errorMsg = validateInputAndGetError();
    if (errorMsg) {
      setTimeout(() => {
        playSound("receive");
        addMessage("admin", errorMsg);
      }, 1000);
    } else {
      processUserInputAndMoveToNextStep();
    }
    setMessage("");
  };

  const handleInputChange = (e: { target: { value: string } }) => {
    setMessage(e.target.value);
  };

  const handleInputFocus = () => {
    if (step === 0 && chat.length === 2) {
      const firstStep = questionsAndActions[0];
      if (firstStep?.question) {
        const firstQuestion = firstStep.question;
        playSound("receive");
        const questionText =
          typeof firstQuestion === "string" ? firstQuestion : firstQuestion[0];

        if (questionText) {
          setChat([
            ...chat,
            {
              sender: "admin" as const,
              text: questionText,
            },
          ]);
        }
      }
    }
  };

  return {
    step,
    message,
    chat,
    handleSendClick,
    handleInputChange,
    handleInputFocus,
  };
};

export default useChat;
