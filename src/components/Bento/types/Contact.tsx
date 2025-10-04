"use client";

import Bento from "@/components/Bento/Bento.tsx";
import { AdminMessage, UserMessage } from "@/components/Contact/Messages.tsx";
import Icon from "@/components/Icons/Icon.tsx";
import useChat from "@/hooks/useChat.tsx";
import cc from "@/lib/cc.ts";
import { questionsAndActions, socials } from "@/types/const.ts";
import FormattedDate from "@/utils/FormattedDate.tsx";
import { hasEnoughText } from "@/utils/validation.tsx";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export default function Contact() {
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Refs
  const chatRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    step,
    message,
    chat,
    handleSendClick,
    handleInputChange,
    handleInputFocus,
  } = useChat(inputRef, buttonRef);

  const initialChatLength = 2;

  const date = DateTime.utc().toString();
  const formattedCreationDate = FormattedDate(date);

  useEffect(() => {
    if (chatRef.current) {
      const chatEl = chatRef.current;
      chatEl.style.scrollBehavior = "smooth";
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }, [chat]);

  const handleClickOutside = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }

    if (
      menuRef.current &&
      !(menuRef.current as HTMLElement).contains(event.target as Node)
    ) {
      setShowMenu(false);
    }
  };

  const handlMenuClick = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (showMenu) {
      setShowMenu(false);
      document.removeEventListener("mousedown", handleClickOutside);
    } else {
      setShowMenu(true);
      document.addEventListener("mousedown", handleClickOutside);
    }
  };

  const chatContent = useMemo(
    () =>
      chat.map((message, index) => {
        const isSameSender =
          index > 0 && chat[index - 1]?.sender === message.sender;

        const messageClass =
          index === chat.length - 1 && index >= initialChatLength
            ? "animate-message"
            : "static-message";

        return (
          <div
            key={`message-${message.sender}-${message.text.slice(0, 5)}-${Math.random()}`}
            className={`${message.sender !== "admin" ? "self-end" : ""} ${messageClass}`}
          >
            {message.sender === "admin" ? (
              <AdminMessage isSameSender={isSameSender} message={message} />
            ) : (
              <UserMessage index={index} message={message} />
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
          showMenu ? "z-30 opacity-100" : "opacity-0"
        }`}
      ></div>
      <header className="h-11 w-full border-b border-solid border-[#ECECEC] bg-[#EBECEB]/40 backdrop-blur-xl"></header>
      <div
        ref={chatRef}
        style={{
          overflowY: "scroll",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
        className="chat no-scrollbar flex flex-col gap-4 px-5 pt-5 pb-20 transition-all"
      >
        <p className="relative -top-3 flex w-full justify-center text-2xs text-dark_grey">
          <span className="font-bold">Today: </span>
          &nbsp;{formattedCreationDate}
        </p>
        {chatContent}
      </div>
      <ul
        ref={menuRef}
        className={cc(
          showMenu
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-50 opacity-0",
          "absolute bottom-4 left-5 z-40 origin-bottom-left transition-[transform,opacity] duration-300 ease-in-out",
        )}
      >
        {socials.map((social, index) => (
          <li
            key={`social-${social.name}`}
            style={{
              transform: showMenu
                ? `translateY(0)`
                : `translateY(${-1 * (socials.length - 1 - index) * -40}px)`,
            }}
            className={cc("mb-4 transition-transform duration-350 ease-in-out")}
          >
            <a
              href={social.url}
              target="_blank"
              className="flex origin-center gap-4 transition-transform hover:scale-105"
            >
              <Image
                alt={social.name}
                height={24}
                priority
                src={`/images/icons/socials/${social.icon}.png`}
                width={24}
                className="rounded-full border border-solid border-[#EAEBED]"
              />
              <p>{social.name}</p>
            </a>
          </li>
        ))}
      </ul>
      <div className="absolute bottom-0 z-20 flex w-full gap-3 bg-white/70 px-5 pt-2 pb-5 backdrop-blur-xl">
        <button
          id="socials"
          aria-label="Socials menu"
          onClick={handlMenuClick}
          className={cc(
            "flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEBED] fill-[#848484] p-3 transition-[background,transform] duration-300 hover:bg-[#dadbdd] active:scale-90",
          )}
        >
          <Icon type="plus" className="w-3" />
        </button>
        <form className="flex w-full">
          {step < questionsAndActions.length && (
            <div className="flex max-h-9 w-full rounded-full border border-solid border-[#EAEBED]">
              <input
                ref={inputRef}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Type your response here..."
                value={message}
                className="mx-3 w-full bg-transparent text-base outline-hidden sm:text-sm"
              />
              <button
                ref={buttonRef}
                aria-label="Send Message"
                disabled={!hasEnoughText(message)}
                onClick={handleSendClick}
                type="submit"
                className={`flex rounded-full p-1 transition-opacity duration-300 ${
                  !hasEnoughText(message) ? "cursor-not-allowed opacity-50" : ""
                }`}
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
