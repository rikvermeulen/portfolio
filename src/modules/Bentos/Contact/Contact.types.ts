import type { MessageVariant } from "./Contact.const.ts";
import type { BentoSizedProps } from "@/components/Bento/index.ts";

export interface IMessage {
  readonly id: string;
  readonly sender: "admin" | "user";
  readonly text: string;
}

export interface UserContactData {
  name: string;
  reason: string;
  phone: string;
  email: string;
}

export interface ContactProps extends BentoSizedProps {
  readonly className?: string;
}

export interface ChatMessageProps {
  readonly message: IMessage;
  readonly isGrouped: boolean;
}

export interface MessageBubbleProps {
  readonly children: React.ReactNode;
  readonly variant: MessageVariant;
  readonly showTail?: boolean;
  readonly className?: string;
}
