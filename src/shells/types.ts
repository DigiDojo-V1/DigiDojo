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
  /** The message in phrases, each flaggable on its own if it has an id. */
  segments?: TextSegment[];
}

/** A phrase inside a message or email paragraph. */
export interface TextSegment {
  id?: string;
  text: string;
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
  /** Rendered under the header: e.g. "View profile" and "Check company page" buttons. */
  toolbar?: ReactNode;
  /** Rendered under the messages: the player's reply choices. */
  footer?: ReactNode;
}

/** Tap-to-flag wiring every evidence shell takes. */
export interface FlagProps {
  flaggedIds: readonly string[];
  onToggleFlag: (id: string) => void;
}

/** An email address the player can inspect. */
export interface AddressView {
  id: string;
  address: string;
}

/** One email, with text already in the player's language. */
export interface MailView {
  displayName: string;
  from: AddressView;
  /** Show the From address without tapping the sender. */
  showFromAddress: boolean;
  replyTo?: AddressView;
  to: AddressView;
  date: string;
  subject: string;
  preview: string;
  /** Paragraphs of phrases. */
  body: TextSegment[][];
  attachments: {
    id: string;
    shownName: string;
    fullName: string;
    actualType: string;
    sizeLabel?: string;
    /** Evidence panel that previews it. */
    documentId?: string;
  }[];
  links: { id: string; text: string; actualUrl: string }[];
}

/** A profile, company page, web page or PDF, with text already in the player's language. */
export interface PanelView {
  id: string;
  kind: "profile" | "company" | "web-page" | "document";
  title: string;
  subtitle?: string;
  sections: {
    heading?: string;
    fields: { id: string; label?: string; value: string; finePrint: boolean }[];
  }[];
}
