"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { ContactProps } from "./Contact.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import Link from "@/components/Link/index.ts";
import { useOutsideClick } from "@/hooks/useOutsideClick/index.ts";
import { useResizeObserver } from "@/hooks/useResizeObserver/index.ts";
import { RADIUS } from "@/lib/radius/index.ts";
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

/**
 * Icon button that expands into the list of social links. Owns its own open
 * state, closes on outside-click and Escape, and sizes the expanded panel to
 * fit its content via CSS vars measured from the list.
 */
function SocialMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useOutsideClick(rootRef, () => setOpen(false), open);

  // Close on Escape and return focus to the toggle (Esc anywhere while open).
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Size the expanded panel to fit the list content, via CSS vars it reads.
  useResizeObserver(listRef, ({ target }) => {
    panelRef.current?.style.setProperty("--menu-w", `${target.scrollWidth}px`);
    panelRef.current?.style.setProperty("--menu-h", `${target.scrollHeight}px`);
  });

  return (
    <div
      ref={rootRef}
      data-open={open || undefined}
      className="group relative size-9 shrink-0"
    >
      <div
        ref={panelRef}
        className="absolute bottom-0 left-0 z-50 flex size-9 flex-col-reverse overflow-hidden rounded-[1.125rem] transition-[height,width,border-radius] duration-300 ease-in-out group-data-open:h-(--menu-h,11rem) group-data-open:w-(--menu-w,13rem) group-data-open:rounded-2xl group-data-open:shadow-lg"
      >
        <Glass
          {...GLASS}
          className="bg-black/10 group-data-open:backdrop-blur-sm! dark:bg-white/10"
        />
        <button
          ref={toggleRef}
          aria-controls="social-links"
          aria-expanded={open}
          aria-label={open ? "Close social links" : "Open social links"}
          onClick={() => setOpen((value) => !value)}
          type="button"
          className="focus-ring relative z-10 flex h-9 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden transition-[height] duration-300 group-data-open:h-0"
        >
          <Icon
            iconClassName="size-4 transition-[opacity,transform] duration-100 group-data-open:scale-0 group-data-open:opacity-0"
            name="plus"
          />
        </button>
        <ul
          ref={listRef}
          id="social-links"
          aria-label="Social links"
          inert={!open}
          className="relative z-10 w-max py-1.5 opacity-0 transition-opacity duration-200 group-data-open:pointer-events-auto group-data-open:opacity-100"
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
                <span className="bento-headline whitespace-nowrap">{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const Contact = ({ sizeKey, className }: ContactProps) => {
  const chatRef = useRef<HTMLDivElement>(null);
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
            radius={RADIUS.field}
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
        className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-5 pt-18 pb-15"
      >
        <p className="relative text-center text-[10px] text-ds-gray">
          <span className="font-semibold">Today: </span>
          {TODAY}
        </p>

        {chat.map((message, index) => {
          const isGrouped =
            index > 0 && chat[index - 1]?.sender === message.sender;

          return (
            <div
              key={message.id}
              className={classnames(
                message.sender === "user" && "self-end",
                isGrouped ? "mt-0.5" : "mt-3",
              )}
            >
              <ChatMessage isGrouped={isGrouped} message={message} />
            </div>
          );
        })}
      </div>

      <footer className="absolute bottom-5 z-20 flex w-full items-center gap-2 px-5">
        <SocialMenu />

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
              onChange={(event) => setInputValue(event.target.value)}
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
                "relative right-2 z-50 shrink-0 rounded-full bg-ds-blue px-2.5 py-1 text-white transition-all duration-300",
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
