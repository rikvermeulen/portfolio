"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { ContactProps } from "./Contact.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import Link from "@/components/Link/index.ts";
import { useOutsideClick } from "@/hooks/useOutsideClick/index.ts";
import { socials } from "@/lib/socials/index.ts";
import classnames from "@/utils/classnames/index.ts";
import { time } from "@/utils/datetime/index.ts";

import { hasEnoughText } from "./Contact.validation.ts";
import { ChatMessage } from "./Messages.tsx";
import useChat from "./useChat.ts";

const TODAY = time.date(new Date());

const GLASS = {
  intensity: 2,
  radius: 18,
  tint: "adaptive" as const,
  className: "bg-black/10 dark:bg-white/10",
};

const Contact = ({ sizeKey, className }: ContactProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    chat,
    inputValue,
    isDisabled,
    isDone,
    setInputValue,
    handleSubmit,
    handleFocus,
  } = useChat();

  const canSend = hasEnoughText(inputValue) && !isDisabled;

  useOutsideClick(menuRef, () => setShowMenu(false), showMenu);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  return (
    <Bento
      app="contact"
      sizes={bentos[sizeKey].sizes}
      className={classnames(
        "relative isolate flex flex-col border border-ds-border bg-white dark:border-ds-border-dark dark:bg-black",
        className,
      )}
    >
      <header className="absolute top-0 left-0 isolate z-50 mt-4 flex w-full flex-col items-center">
        <Image
          alt="Rik Vermeulen"
          height={32}
          src="/images/profile.png"
          width={32}
          className="z-10 rounded-full"
        />
        <div className="bento-eyebrow relative -top-1 flex gap-2 rounded-lg px-3 py-1">
          Rik Vermeulen
          <Glass
            intensity={0.5}
            radius={10}
            className="-z-10 bg-black/10 dark:bg-white/20"
          />
        </div>
      </header>
      <div
        ref={chatRef}
        aria-label="Conversation with Rik"
        aria-live="polite"
        aria-relevant="additions"
        role="log"
        className="no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto px-5 pt-20 pb-20"
      >
        <p className="relative text-center text-[10px] text-ds-gray">
          <span className="font-semibold">Today: </span>
          {TODAY}
        </p>

        {chat.map((message, index) => (
          <div
            key={message.id}
            className={message.sender === "user" ? "self-end" : undefined}
          >
            <ChatMessage
              isGrouped={
                index > 0 && chat[index - 1]?.sender === message.sender
              }
              message={message}
            />
          </div>
        ))}
      </div>

      <footer className="absolute bottom-5 z-20 flex w-full items-center gap-2 px-5">
        <div
          ref={menuRef}
          data-open={showMenu || undefined}
          className="group relative size-9 shrink-0"
        >
          <div className="absolute bottom-0 left-0 z-50 flex h-9 w-9 flex-col-reverse overflow-hidden rounded-[1.125rem] transition-[height,width,border-radius] duration-300 ease-in-out group-data-open:h-43 group-data-open:w-52 group-data-open:rounded-2xl group-data-open:shadow-lg">
            <Glass
              {...GLASS}
              className="bg-black/10 group-data-open:backdrop-blur-sm! dark:bg-white/10"
            />
            <button
              aria-expanded={showMenu}
              aria-label={showMenu ? "Close social links" : "Open social links"}
              onClick={() => setShowMenu((open) => !open)}
              type="button"
              className="focus-ring relative z-10 flex h-9 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden transition-[height] duration-300 group-data-open:h-0"
            >
              <Icon
                iconClassName="size-4 transition-[opacity,transform] duration-100 group-data-open:scale-0 group-data-open:opacity-0"
                name="plus"
              />
            </button>
            <ul
              aria-label="Social links"
              className="relative z-10 py-1.5 opacity-0 transition-opacity duration-200 group-data-open:pointer-events-auto group-data-open:opacity-100"
            >
              {socials.map(({ name, icon, url }) => (
                <li key={name}>
                  <Link
                    href={url}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                  >
                    <Image
                      alt={name}
                      height={24}
                      src={`/images/icons/socials/${icon}.png`}
                      width={24}
                      className="rounded-xl"
                    />
                    <span className="bento-headline">{name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!isDone && (
          <form
            aria-label="Contact form"
            onSubmit={handleSubmit}
            className="relative flex h-9 flex-1 items-center overflow-hidden rounded-full"
          >
            <Glass {...GLASS} />
            <input
              aria-label="Message input"
              disabled={isDisabled}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleFocus}
              placeholder="Type your response here…"
              value={inputValue}
              className="focus-ring bento-body relative z-10 mx-3 w-full bg-transparent disabled:opacity-30"
            />
            <button
              aria-label="Send message"
              disabled={!canSend}
              type="submit"
              className={classnames(
                "relative right-2 z-50 shrink-0 rounded-full bg-ds-blue px-2.5 py-1 transition-all duration-300",
                canSend
                  ? "scale-100 cursor-pointer opacity-100"
                  : "scale-70 cursor-not-allowed opacity-0",
              )}
            >
              <Icon iconClassName="size-3.5" name="arrow" />
            </button>
          </form>
        )}
      </footer>
    </Bento>
  );
};

export default Contact;
