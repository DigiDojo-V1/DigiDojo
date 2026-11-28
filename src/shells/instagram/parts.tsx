"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Camera,
  Flag,
  Image as ImageIcon,
  Mic,
  Phone,
  Sticker,
  Video,
} from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import {
  Avatar,
  Bubble,
  ContactButton,
  THEMES,
  TransitionCard,
  TypingIndicator,
  type ThemeStyle,
} from "../chat-parts";
import type { ChannelTransitionView, ChatBubble, ShellContact } from "../types";

/* Pieces of the Instagram DM screen shared by the phone and desktop layouts. */

export const IG_STYLE: ThemeStyle = THEMES.instagram;

/** The contact's status line: their subtitle, or "Active now". */
export function useStatusLine(contact: ShellContact): string {
  const t = useT();
  return contact.subtitle ?? t("ig.activeNow");
}

/** Big avatar, name and "View profile" at the top of a conversation, as Instagram shows it. */
export function ProfileIntro({
  contact,
  onContactClick,
}: {
  contact: ShellContact;
  onContactClick?: () => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col items-center pt-4 pb-8 text-center">
      <Avatar
        name={contact.name}
        src={contact.avatar}
        className={cn(IG_STYLE.avatar, "text-3xl")}
        size="size-24"
      />
      <p className="mt-3 text-xl leading-tight font-semibold text-black">{contact.name}</p>
      <p className="mt-0.5 text-sm text-[#737373]">{t("ig.appName")}</p>
      {onContactClick === undefined ? (
        <span
          aria-hidden
          className="mt-4 rounded-lg bg-[#efefef] px-4 py-1.5 text-sm font-semibold text-black"
        >
          {t("ig.viewProfile")}
        </span>
      ) : (
        <button
          type="button"
          onClick={onContactClick}
          className="mt-4 rounded-lg bg-[#efefef] px-4 py-1.5 text-sm font-semibold text-black hover:bg-[#dbdbdb]"
        >
          {t("ig.viewProfile")}
        </button>
      )}
    </div>
  );
}

/** The conversation: profile intro, then the bubbles, typing dots and "Seen". */
export function InstagramMessages({
  contact,
  messages,
  typing,
  hint,
  transition,
  onContactClick,
  style = IG_STYLE,
}: {
  contact: ShellContact;
  messages: ChatBubble[];
  typing: boolean;
  hint?: string;
  transition?: ChannelTransitionView;
  onContactClick?: () => void;
  style?: ThemeStyle;
}) {
  const t = useT();
  const last = messages.at(-1);
  const seen = last?.from === "me";

  return (
    <>
      {transition !== undefined && <TransitionCard transition={transition} />}
      <ProfileIntro contact={contact} onContactClick={onContactClick} />
      {hint !== undefined && (
        <p className="mx-auto mb-2 flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-neutral-600">
          <Flag className="size-3" aria-hidden /> {hint}
        </p>
      )}
      <AnimatePresence initial={false}>
        {messages.map((m, i) => (
          <Bubble
            key={m.id}
            message={m}
            previous={messages[i - 1]}
            next={messages[i + 1]}
            lastShown={i === messages.length - 1 && !typing}
            contact={contact}
            style={style}
          />
        ))}
        {typing && <TypingIndicator key="typing" style={style} contact={contact} />}
      </AnimatePresence>
      {seen && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="-mt-0.5 mr-1 text-right text-xs text-[#737373]"
        >
          {t("ig.seen")}
        </motion.p>
      )}
    </>
  );
}

/** The phone header: back arrow, the contact, and call and video icons. */
export function InstagramMobileHeader({
  contact,
  backHref,
  onContactClick,
}: {
  contact: ShellContact;
  backHref: string;
  onContactClick?: () => void;
}) {
  const t = useT();
  const status = useStatusLine(contact);
  return (
    <header className="flex h-14 items-center gap-1 border-b border-[#dbdbdb] bg-white px-2 text-black">
      <Link
        href={backHref}
        aria-label={t("nav.back")}
        className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
      >
        <ArrowLeft className="size-6" strokeWidth={2} />
      </Link>
      <ContactButton onClick={onContactClick} label={t("chat.viewProfile")(contact.name)}>
        <span className="relative shrink-0">
          <Avatar
            name={contact.name}
            src={contact.avatar}
            className={IG_STYLE.avatar}
            size="size-8"
          />
          <span
            aria-hidden
            className="absolute right-0 bottom-0 size-2.5 rounded-full bg-[#78de45] ring-2 ring-white"
          />
        </span>
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className="block truncate text-base font-semibold">{contact.name}</span>
          <span className="block truncate text-xs text-[#737373]">{status}</span>
        </span>
      </ContactButton>
      <span className="mr-2 flex shrink-0 items-center gap-5">
        <Phone className="size-6" strokeWidth={1.75} aria-label={t("chat.call")} />
        <Video className="size-7" strokeWidth={1.75} aria-label={t("chat.videoCall")} />
      </span>
    </header>
  );
}

/** The phone's message box. Decorative: the player replies with the choices. */
export function InstagramMobileComposer() {
  const t = useT();
  return (
    <div aria-hidden className="sticky bottom-0 z-10 bg-white px-3 pt-1 pb-3">
      <div className="flex h-11 items-center gap-3 rounded-full bg-[#efefef] pr-4 pl-1.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#3797f0] text-white">
          <Camera className="size-[18px]" strokeWidth={2} />
        </span>
        <span className="flex-1 truncate text-[15px] text-[#737373]">
          {t("ig.messagePlaceholder")}
        </span>
        <Mic className="size-6 shrink-0 text-black" strokeWidth={1.75} />
        <ImageIcon className="size-6 shrink-0 text-black" strokeWidth={1.75} />
        <Sticker className="size-6 shrink-0 text-black" strokeWidth={1.75} />
      </div>
    </div>
  );
}
