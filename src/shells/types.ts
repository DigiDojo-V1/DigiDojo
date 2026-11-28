import type { ReactNode } from "react";
import type { DocumentLook, ProfileSlot, ThreadApp } from "@/engine/schema";

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
  /** Whether the player can highlight words in it. The player's own replies can't be flagged. */
  flaggable: boolean;
  /** Display time, e.g. "09:14". */
  time?: string;
  /** Draw it as a voice note; `text` is the transcript. */
  voiceNote?: {
    durationSec: number;
    /** Generated audio for it, when the server can make one. Otherwise the browser's voice reads it. */
    src?: string;
  };
}

/** The props every fake-app shell accepts, so the player can swap shells by `app`. */
export interface ShellProps {
  contact: ShellContact;
  messages: ChatBubble[];
  /** Show the typing indicator. */
  typing: boolean;
  /** Who is typing, for group chats. */
  typingSender?: string;
  /** Where the header's back arrow goes. */
  backHref: string;
  /** Hint line above the first message, e.g. "Tap a message to flag it". */
  hint?: string;
  /** Rendered under the header: e.g. "View profile" and "Check company page" buttons. */
  toolbar?: ReactNode;
  /** Rendered under the messages: the player's reply choices. */
  footer?: ReactNode;
  /** Tapping the contact in the header, e.g. to open their profile. */
  onContactClick?: () => void;
  /** A second pane next to the messages, behind a switch (the split layout). */
  aside?: AsidePane;
  /** The chat moved here from another app: shown as a card above the first message. */
  transition?: ChannelTransitionView;
}

/** The second pane of a split chat. */
export interface AsidePane {
  /** Switch label, e.g. "Recruiter & company". */
  label: string;
  /** How many items are flagged inside the pane. */
  flaggedCount: number;
  content: ReactNode;
}

/** "This conversation moved from X to Y". */
export interface ChannelTransitionView {
  fromApp: ThreadApp;
  toApp: ThreadApp;
  /** Who moved the conversation, in the player's language. */
  fromName: string;
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
  /** Paragraphs, each a highlightable text. */
  body: { targetId: string; text: string }[];
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
  variant?: "official-record";
  title: string;
  subtitle?: string;
  /** Documents only: running page footer. */
  footer?: string;
  sections: {
    heading?: string;
    fields: PanelFieldView[];
  }[];
}

/** One line of a panel. */
export interface PanelFieldView {
  id: string;
  label?: string;
  value: string;
  finePrint: boolean;
  /** Profile header placement. */
  slot?: ProfileSlot;
  /** How a document line is drawn. */
  look?: DocumentLook;
}
