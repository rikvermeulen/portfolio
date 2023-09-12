'use client';

import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { IMessage } from '@/types';
import { DateTime } from 'luxon';

import { AdminMessage, UserMessage } from '@/components/form/Messages';
import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';
import FormattedDate from '@/utils/FormattedDate';
import { useSound } from '@/utils/sound';
import { hasEnoughText, isValidEmail, isValidPhoneNumber } from '@/utils/validation';
import { initialMessages, questionsAndActions, socials } from '@/content/messages/content';

import Bento from '../Bento';

const disableInputs = (inputRef: any, buttonRef: any, disabled: boolean) => {
  if (inputRef.current && buttonRef.current) {
    inputRef.current.disabled = disabled;
    buttonRef.current.disabled = disabled;
    inputRef.current.style.opacity = disabled ? '0.2' : '1';
  }
};

export default function Message() {
  // State
  const [step, setStep] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [chat, setChat] = useState<IMessage[]>(initialMessages);
  const [userData, setUserData] = useState({ name: '', reason: '', phone: '', email: '' });

  // Refs
  const chatRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sounds
  const { playSound } = useSound();

  const initialChatLength = 2;

  const toggleInputs = (disabled: boolean) => {
    disableInputs(inputRef, buttonRef, disabled);
  };

  const date = DateTime.utc().toString();
  const formattedCreationDate = FormattedDate(date);

  const sendData = async (data: any) => {
    try {
      const res = await fetch(`/api/message`, { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) throw new Error();

      addAdminMessage('Thanks 🙏 I will contact you soon');
      toggleInputs(true);
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  };

  const addAdminMessage = (text: string) => {
    toggleInputs(true);
    setChat((prevChat) => [...prevChat, { sender: 'admin', text }]);
    toggleInputs(false);
  };

  useEffect(() => {
    if (chatRef.current) {
      const chatEl = chatRef.current;
      chatEl.style.scrollBehavior = 'smooth';
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }, [chat]);

  const handleInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    setMessage(e.target.value);
  };

  const handleInputFocus = () => {
    if (step === 0 && chat.length === 2) {
      const firstQuestion = questionsAndActions[0].question;
      playSound('receive');
      setChat([
        ...chat,
        {
          sender: 'admin',
          text: typeof firstQuestion === 'string' ? firstQuestion : firstQuestion[0],
        },
      ]);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (event.button !== 0) return;

    if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
      setShowMenu(false);
    }
  };

  const handlMenuClick = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (showMenu) {
      setShowMenu(false);
      document.removeEventListener('mousedown', handleClickOutside);
    } else {
      setShowMenu(true);
      document.addEventListener('mousedown', handleClickOutside);
    }
  };

  const handleSendClick = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    playSound('send');
    addUserMessageToChat();

    if (isInvalidInput()) {
      sendErrorMessage();
    } else {
      processUserInputAndMoveToNextStep();
    }

    setMessage('');
  };

  const addUserMessageToChat = () => {
    setChat((prevChat) => [...prevChat, { sender: 'user', text: message }]);
  };

  const isInvalidInput = () => {
    return (
      (step === 2 && !isValidPhoneNumber(message)) ||
      (step === 3 && !isValidEmail(message)) ||
      !hasEnoughText(message)
    );
  };

  const sendErrorMessage = () => {
    const errorMessage = getErrorMessage();

    setTimeout(() => {
      playSound('receive');
      addAdminMessage(errorMessage);
    }, 1000);
  };

  const getErrorMessage = () => {
    if (step === 2) return 'Please provide a valid phone number.';
    if (step === 3) return 'Please provide a valid email address.';
    return 'Your message is too short. Please provide more details.';
  };

  const processUserInputAndMoveToNextStep = () => {
    const { action } = questionsAndActions[step];
    const newUserData = action(message, userData);

    setUserData(newUserData);

    if (step < questionsAndActions.length - 1) {
      setStep((prevStep) => prevStep + 1);
      sendNextQuestion();
    } else {
      sendData(newUserData);
    }
  };

  const sendNextQuestion = () => {
    const nextQuestion = questionsAndActions[step + 1].question;

    if (Array.isArray(nextQuestion)) {
      nextQuestion.forEach((q, i) => addAdminMessageWithDelay(q, (i + 1) * 1000));
    } else {
      addAdminMessageWithDelay(nextQuestion, 1000);
    }
  };

  const addAdminMessageWithDelay = (message: string, delay: number) => {
    toggleInputs(true);
    setTimeout(() => {
      playSound('receive');
      addAdminMessage(message);
      toggleInputs(false);
    }, delay);
  };

  const chatContent = useMemo(
    () =>
      chat.map((message, index) => {
        const isSameSender = index > 0 && chat[index - 1].sender === message.sender;

        const messageClass =
          index === chat.length - 1 && index >= initialChatLength
            ? 'animate-message'
            : 'static-message';

        return (
          <div
            key={index}
            className={`${message.sender !== 'admin' ? 'self-end' : ''} ${messageClass}`}
          >
            {message.sender === 'admin' ? (
              <AdminMessage key={index} message={message} isSameSender={isSameSender} />
            ) : (
              <UserMessage key={index} message={message} index={index} />
            )}
          </div>
        );
      }),
    [chat],
  );

  return (
    <Bento size="2x1" className="bento relative flex max-h-[346px] flex-col">
      <div
        className={`absolute z-0 h-full w-full bg-white/70 backdrop-blur-md transition-opacity duration-300 ${
          showMenu ? 'z-30 opacity-100' : 'opacity-0'
        }`}
      ></div>
      <header className="h-11 w-full border-b border-solid border-[#ECECEC] bg-[#EBECEB]/40 backdrop-blur-xl"></header>
      <div
        ref={chatRef}
        className="chat flex flex-col gap-4 px-5 pb-20 pt-5 transition-all"
        style={{ overflowY: 'scroll', height: '100%', position: 'relative', zIndex: 1 }}
      >
        <p className="relative -top-3 flex w-full justify-center text-[10px] text-dark_grey">
          <span className="font-bold">Today: </span>
          &nbsp;{formattedCreationDate}
        </p>
        {chatContent}
      </div>
      <ul
        className={cc(
          showMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none',
          'absolute bottom-4 left-5 z-40 duration-300 ease-in-out transition-[transform,opacity] origin-bottom-left',
        )}
        ref={menuRef}
      >
        {socials.map((social, index) => (
          <li
            key={index}
            className={cc('mb-4 transition-transform duration-[350ms] ease-in-out')}
            style={{
              transform: showMenu
                ? `translateY(0)`
                : `translateY(${-1 * (socials.length - 1 - index) * -40}px)`,
            }}
          >
            <a href={social.url} className="flex gap-4" target="_blank">
              <Image
                src={`/images/icons/${social.icon}.png`}
                className="rounded-full border border-solid border-[#EAEBED]"
                alt={social.name}
                priority
                width={24}
                height={24}
              />
              <p>{social.name}</p>
            </a>
          </li>
        ))}
      </ul>
      <div className="absolute bottom-0 z-20 flex w-full gap-3 bg-white/70 px-5 pb-5 pt-2 backdrop-blur-xl">
        <button
          className={cc(
            'flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEBED] fill-[#848484] p-3 transition-[background,transform] duration-300 hover:bg-[#dadbdd] active:scale-90',
          )}
          onClick={handlMenuClick}
          id="socials"
          aria-label="Socials menu"
        >
          <Icon type="plus" className="w-3" />
        </button>
        <form className="flex w-full">
          {step < questionsAndActions.length && (
            <div className="flex max-h-9 w-full rounded-full border border-solid border-[#EAEBED]">
              <input
                ref={inputRef}
                className="mx-3 w-full bg-transparent text-base outline-none sm:text-sm"
                placeholder="Type your response here..."
                value={message}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
              />
              <button
                ref={buttonRef}
                className={`flex rounded-full p-1 transition-opacity duration-300 ${
                  !hasEnoughText(message) ? 'cursor-not-allowed opacity-50' : ''
                }`}
                type="submit"
                aria-label="Send Message"
                onClick={handleSendClick}
                disabled={!hasEnoughText(message)}
              >
                <Icon type="arrow" className="w-[26px]" />
              </button>
            </div>
          )}
        </form>
      </div>
    </Bento>
  );
}
