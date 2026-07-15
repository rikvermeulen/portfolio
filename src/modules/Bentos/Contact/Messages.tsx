"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { ChatMessageProps, MessageBubbleProps } from "./Contact.types.ts";

import Icon from "@/components/Icon/index.ts";
import classnames from "@/utils/classnames/index.ts";

import {
  CHAT_SENDER,
  INITIAL_MESSAGE_ID_PREFIX,
  MESSAGE_VARIANT,
} from "./Contact.const.ts";

function MessageBubble({
  children,
  variant,
  showTail = true,
  className,
}: MessageBubbleProps) {
  const styles = MESSAGE_VARIANT[variant];

  return (
    <div
      className={classnames(
        "relative w-fit max-w-55 rounded-3xl px-3 py-2 text-sm md:max-w-xs",
        styles.bubble,
        className,
      )}
    >
      {showTail && (
        <Icon
          iconClassName={classnames(styles.tailPosition, styles.tailFill)}
          name="tail"
        />
      )}
      {children}
    </div>
  );
}

function DeliveryStatus({ active }: { readonly active: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    const timer = setTimeout(() => setIsVisible(true), 400);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <p
      className={classnames(
        "bento-body mt-1 self-end text-ds-gray transition-[opacity,transform] duration-200",
        isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0",
      )}
    >
      Delivered
    </p>
  );
}

function IncomingMessage({
  message,
  isGrouped,
}: Pick<ChatMessageProps, "message" | "isGrouped">) {
  return (
    <div className="flex w-full gap-2">
      {!isGrouped && (
        <Image
          alt={CHAT_SENDER.avatarAlt}
          height={40}
          src={CHAT_SENDER.avatarSrc}
          width={40}
          className="mt-4 w-8 self-start rounded-full md:w-10"
        />
      )}

      <div>
        {!isGrouped && (
          <p className="bento-body ml-3 text-ds-gray">{CHAT_SENDER.name}</p>
        )}
        <MessageBubble
          showTail={!isGrouped}
          variant="incoming"
          className={isGrouped ? "relative -top-3 ml-10 md:ml-12" : undefined}
        >
          {message.text}
        </MessageBubble>
      </div>
    </div>
  );
}

function OutgoingMessage({ message }: Pick<ChatMessageProps, "message">) {
  const isInitial = message.id.startsWith(INITIAL_MESSAGE_ID_PREFIX);

  return (
    <div className="flex w-full flex-col">
      <MessageBubble variant="outgoing" className="max-w-xs self-end">
        {message.text}
      </MessageBubble>
      <DeliveryStatus active={!isInitial} />
    </div>
  );
}

export function ChatMessage({ message, isGrouped }: ChatMessageProps) {
  if (message.sender === "user") {
    return <OutgoingMessage message={message} />;
  }

  return <IncomingMessage isGrouped={isGrouped} message={message} />;
}
