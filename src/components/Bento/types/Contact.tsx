'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { DateTime } from 'luxon';

import { questionsAndActions, socials } from '@/types/const';

import Bento from '@/components/Bento/Bento';
import { AdminMessage, UserMessage } from '@/components/Contact/Messages';
import Icon from '@/components/Icons/Icon';

import useChat from '@/hooks/useChat';
import cc from '@/lib/cc';
import FormattedDate from '@/utils/FormattedDate';
import { hasEnoughText } from '@/utils/validation';

export default function Contact() {
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Refs
  const chatRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { step, message, chat, handleSendClick, handleInputChange, handleInputFocus } = useChat(
    inputRef,
    buttonRef,
  );

  const initialChatLength = 2;

  const date = DateTime.utc().toString();
  const formattedCreationDate = FormattedDate(date);

  useEffect(() => {
    if (chatRef.current) {
      const chatEl = chatRef.current;
      chatEl.style.scrollBehavior = 'smooth';
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }, [chat]);

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
        className="chat no-scrollbar flex flex-col gap-4 px-5 pb-20 pt-5 transition-all"
        style={{ overflowY: 'scroll', height: '100%', position: 'relative', zIndex: 1 }}
      >
        <p className="relative -top-3 flex w-full justify-center text-2xs text-dark_grey">
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
            <a
              href={social.url}
              className="flex origin-center gap-4 transition-transform hover:scale-105"
              target="_blank"
            >
              <Image
                src={`/images/icons/socials/${social.icon}.png`}
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
