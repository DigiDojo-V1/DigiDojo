import type { ReactNode } from "react";

/** The contact in a shell's header, with text already in the player's language. */
export interface ShellContact {
  name: string;
  subtitle?: string;
  /** Image path under /public. */
  avatar?: string;
}

/** One message as a shell draws it. */
export interface ChatBubble {
  id: string;
  from: "them" | "me" | "system";
  /** Display name inside group chats. */
  sender?: string;
  text: string;
  /** Whether the player can tap it to flag it. The player's own replies can't be flagged. */
  flaggable: boolean;
}

/** The props every fake-app shell accepts, so the player can swap shells by `app`. */
export interface ShellProps {
  contact: ShellContact;
  messages: ChatBubble[];
  /** Show the typing indicator. */
  typing: boolean;
  /** Who is typing, for group chats. */
  typingSender?: string;
  flaggedIds: readonly string[];
  onToggleFlag: (messageId: string) => void;
  /** Where the header's back arrow goes. */
  backHref: string;
  /** Hint line above the first message, e.g. "Tap a message to flag it". */
  hint?: string;
  /** Rendered under the messages: the player's reply choices. */
  footer?: ReactNode;
}
