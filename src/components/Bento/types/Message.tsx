'use client';

import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { IMessage } from '@/types';

import { AdminMessage, UserMessage } from '@/components/form/messages';
import Icon from '@/components/Icons/Icon';
import { hasEnoughText, isValidEmail, isValidPhoneNumber } from '@/utils/validation';
import { initialMessages, questionsAndActions } from '@/content/messages/content';

import Bento from '../Bento';

export default function Message() {
  const [step, setStep] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [chat, setChat] = useState<IMessage[]>(initialMessages);
  const [userData, setUserData] = useState({ name: '', reason: '', phone: '', email: '' });
  const chatRef = useRef<HTMLDivElement>(null);

  const initialChatLength = 2;

  const sendData = async (data: any) => {
    try {
      const res = await fetch(`/api/send`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setChat((prevChat) => [
          ...prevChat,
          { sender: 'admin', text: 'Thanks 🙏 I will contact you soon' },
        ]);
      } else {
        alert('An error occurred. Please try again later.');
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  };

  const sendAdminMessage = (text: string) => {
    setChat((prevChat) => [...prevChat, { sender: 'admin', text }]);
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
      setChat([
        ...chat,
        {
          sender: 'admin',
          text: typeof firstQuestion === 'string' ? firstQuestion : firstQuestion[0],
        },
      ]);
    }
  };

  const handleSendClick = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Add user message to chat immediately
    setChat((prevChat) => [...prevChat, { sender: 'user', text: message }]);

    if (
      (step === 2 && !isValidPhoneNumber(message)) ||
      (step === 3 && !isValidEmail(message)) ||
      !hasEnoughText(message)
    ) {
      let errorMessage = 'Your message is too short. Please provide more details.';
      if (step === 2) errorMessage = 'Please provide a valid phone number.';
      if (step === 3) errorMessage = 'Please provide a valid email address.';

      setTimeout(() => {
        sendAdminMessage(errorMessage);
      }, 5000); // delay by 5 seconds
    } else {
      const questionAndAction = questionsAndActions[step];
      const newUserData = questionAndAction.action(message, userData);
      setUserData(newUserData);

      if (step < questionsAndActions.length - 1) {
        setStep((prevStep) => prevStep + 1);

        const nextQuestion = questionsAndActions[step + 1].question;

        const addAdminMessageWithDelay = (message: string, delay: number) => {
          setTimeout(() => {
            setChat((prevChat) => [...prevChat, { sender: 'admin', text: message }]);
          }, delay);
        };

        if (Array.isArray(nextQuestion)) {
          nextQuestion.forEach((q, i) => {
            addAdminMessageWithDelay(q, (i + 1) * 1500);
          });
        } else {
          addAdminMessageWithDelay(nextQuestion, 1500);
        }
      } else {
        sendData(newUserData);
      }
    }

    setMessage('');
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
              <UserMessage key={index} message={message} />
            )}
          </div>
        );
      }),
    [chat],
  );

  return (
    <Bento size="2x1" className="bento relative flex max-h-[346px] flex-col">
      <header className="h-11 w-full border-b border-solid border-[#ECECEC] bg-[#EBECEB]/40 backdrop-blur-xl"></header>
      <div
        ref={chatRef}
        className="chat flex flex-col gap-4 px-5 pb-20 pt-5 transition-all"
        style={{ overflowY: 'scroll', height: '100%' }}
      >
        {chatContent}
      </div>
      <div className="absolute bottom-0 flex w-full gap-3 bg-white/70 px-5 pb-5 pt-2 backdrop-blur-xl">
        <Link
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEBED] fill-[#848484] p-3"
          href="/"
        >
          <Icon type="plus" className="w-3" />
        </Link>
        <form className="flex w-full">
          {step < questionsAndActions.length && (
            <div className="flex max-h-9 w-full rounded-full border border-solid border-[#EAEBED]">
              <input
                className="mx-3 w-full bg-transparent text-base outline-none sm:text-sm"
                placeholder="Type your response here..."
                value={message}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
              />
              <button
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
