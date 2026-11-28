"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";

/**
 * An iPhone showing a LinkedIn message thread: a fake "HR" offering easy money.
 *
 * The phone is drawn at real iPhone points (433 × 892 including the frame, a 393 × 852 screen)
 * and scales to whatever width `className` gives it. It does that by redefining Tailwind's
 * `--spacing` as one design point (1/433 of the phone's width), so `w-393` means 393 points
 * and `p-16` means 16 points at any size. Font sizes and radii use `pt()` for the same unit.
 */
const pt = (n: number) => `calc(var(--spacing) * ${n})`;

const IOS_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** LinkedIn's palette. */
const LI = {
  blue: "#0a66c2",
  text: "rgba(0,0,0,0.9)",
  muted: "rgba(0,0,0,0.6)",
  faint: "rgba(0,0,0,0.08)",
  green: "#01754f",
  hiring: "#7445d9",
  field: "#f4f2ee",
};

const METAL =
  "linear-gradient(135deg, #5b5b5e 0%, #2a2a2c 18%, #3d3d40 50%, #1f1f21 82%, #56565a 100%)";

export function LinkedInPhone({ className }: { className?: string }) {
  const t = useT();
  return (
    <div
      aria-hidden
      className={cn("@container relative aspect-[433/892] w-[230px] select-none", className)}
    >
      <div className="absolute inset-0 [--spacing:calc(100cqw/433)]">
        <SideButtons />
        {/* Titanium band, then the black glass border, then the screen. */}
        <div
          className="absolute inset-0 p-3 shadow-[0_40px_70px_-25px_rgba(0,0,0,0.55),0_10px_20px_-10px_rgba(0,0,0,0.35)]"
          style={{ borderRadius: pt(72), background: METAL }}
        >
          <div
            className="h-full bg-[#050505] p-17 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            style={{ borderRadius: pt(69) }}
          >
            <div
              className="relative flex h-full flex-col overflow-hidden bg-white antialiased"
              style={{ borderRadius: pt(54), fontFamily: IOS_FONT, color: LI.text }}
            >
              <StatusBar />
              <span className="absolute top-11 left-1/2 h-37 w-125 -translate-x-1/2 rounded-full bg-black" />
              <NavBar
                name={t("landing.why.phone.contact")}
                status={t("landing.why.phone.status")}
              />
              <div className="flex min-h-0 flex-1 flex-col px-16">
                <ProfileIntro
                  name={t("landing.why.phone.contact")}
                  degree={t("landing.why.phone.degree")}
                  headline={t("landing.why.phone.headline")}
                  hiring={t("landing.why.phone.hiring")}
                />
                <DateDivider label={t("landing.why.phone.today")} />
                <MessageGroup
                  name={t("landing.why.phone.contact")}
                  time={t("landing.why.phone.time")}
                  messages={[
                    t("landing.why.phone.msg1"),
                    t("landing.why.phone.msg2"),
                    t("landing.why.phone.msg3"),
                  ]}
                />
              </div>
              <SmartReplies
                replies={[
                  t("landing.why.phone.reply"),
                  t("landing.why.phone.reply2"),
                  t("landing.why.phone.reply3"),
                ]}
              />
              <Composer placeholder={t("landing.why.phone.placeholder")} />
              <div className="relative h-34 shrink-0">
                <span className="absolute bottom-8 left-1/2 h-5 w-134 -translate-x-1/2 rounded-full bg-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Action button and volume keys on the left, side button on the right. */
function SideButtons() {
  const key = (style: CSSProperties) => (
    <span className="absolute w-6" style={{ background: METAL, borderRadius: pt(2), ...style }} />
  );
  return (
    <>
      {key({ left: pt(-4), top: pt(170), height: pt(32) })}
      {key({ left: pt(-4), top: pt(230), height: pt(62) })}
      {key({ left: pt(-4), top: pt(305), height: pt(62) })}
      {key({ right: pt(-4), top: pt(270), height: pt(100) })}
    </>
  );
}

/** The iOS status bar: time on the left, signal, Wi-Fi and battery on the right. */
function StatusBar() {
  return (
    <div className="relative flex h-54 shrink-0 items-center justify-between pt-6 pr-28 pl-46">
      <span className="font-semibold tracking-[-0.01em]" style={{ fontSize: pt(17) }}>
        9:41
      </span>
      <span className="flex items-center gap-6">
        <svg viewBox="0 0 18 12" className="h-12 w-18" fill="currentColor">
          <rect x="0" y="7.5" width="3" height="4.5" rx="0.9" />
          <rect x="5" y="5" width="3" height="7" rx="0.9" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="0.9" />
          <rect x="15" y="0" width="3" height="12" rx="0.9" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-12 w-16" fill="currentColor">
          <path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 8 .9C5.2.9 2.6 2 .8 3.8L2 5c1.6-1.5 3.7-2.4 6-2.4Z" />
          <path d="M8 6.1c1.3 0 2.5.5 3.5 1.4l1.2-1.2A6.7 6.7 0 0 0 8 4.4c-1.8 0-3.5.7-4.7 1.9l1.2 1.2c1-.9 2.2-1.4 3.5-1.4Z" />
          <path d="M10.2 8.9 8 11.1 5.8 8.9A3.1 3.1 0 0 1 8 8c.9 0 1.6.3 2.2.9Z" />
        </svg>
        <svg viewBox="0 0 27 13" className="h-13 w-27">
          <rect
            x="0.5"
            y="0.5"
            width="23"
            height="12"
            rx="3.8"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
          />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path
            d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </span>
    </div>
  );
}

/** LinkedIn's thread header: back arrow, name with presence, then more and video. */
function NavBar({ name, status }: { name: string; status: string }) {
  return (
    <div
      className="flex h-52 shrink-0 items-center gap-10 border-b px-14"
      style={{ borderColor: LI.faint }}
    >
      <Icon>
        <path d="M9 4 2 12l7 8M2.5 12H22" />
      </Icon>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate font-semibold" style={{ fontSize: pt(16) }}>
          {name}
        </p>
        <p className="flex items-center gap-4" style={{ fontSize: pt(12), color: LI.muted }}>
          <span className="size-7 rounded-full" style={{ background: LI.green }} />
          {status}
        </p>
      </div>
      <Icon>
        <circle cx="5" cy="12" r="1.2" fill="currentColor" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        <circle cx="19" cy="12" r="1.2" fill="currentColor" />
      </Icon>
      <Icon>
        <rect x="2" y="6" width="14" height="12" rx="2" />
        <path d="m16 10.5 6-3.5v10l-6-3.5" />
      </Icon>
    </div>
  );
}

/** A 24-point line icon in LinkedIn's grey. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-24 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: LI.muted }}
    >
      {children}
    </svg>
  );
}

/** The card at the top of a new thread: photo with the #HIRING frame, name, degree, headline. */
function ProfileIntro({
  name,
  degree,
  headline,
  hiring,
}: {
  name: string;
  degree: string;
  headline: string;
  hiring: string;
}) {
  return (
    <div className="pt-18 pb-4">
      <Portrait className="size-80" hiring={hiring} />
      <p className="mt-10 leading-tight" style={{ fontSize: pt(18) }}>
        <span className="font-semibold">{name}</span>
        <span style={{ color: LI.muted, fontSize: pt(15) }}> · {degree}</span>
      </p>
      <p className="mt-4 leading-snug" style={{ fontSize: pt(14), color: LI.muted }}>
        {headline}
      </p>
    </div>
  );
}

/** "TODAY" between hairlines. */
function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-14 flex items-center gap-10">
      <span className="h-px flex-1" style={{ background: LI.faint }} />
      <span
        className="font-semibold tracking-[0.04em] uppercase"
        style={{ fontSize: pt(12), color: LI.muted }}
      >
        {label}
      </span>
      <span className="h-px flex-1" style={{ background: LI.faint }} />
    </div>
  );
}

/** LinkedIn threads have no bubbles: an avatar, the name and time, then plain lines of text. */
function MessageGroup({
  name,
  time,
  messages,
}: {
  name: string;
  time: string;
  messages: string[];
}) {
  return (
    <div className="flex gap-10">
      <div className="relative size-40 shrink-0">
        <Portrait className="size-40" />
        <span
          className="absolute right-0 bottom-0 size-12 rounded-full border-2 border-white"
          style={{ background: LI.green }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="leading-tight">
          <span className="font-semibold" style={{ fontSize: pt(15) }}>
            {name}
          </span>
          <span style={{ fontSize: pt(13), color: LI.muted }}> · {time}</span>
        </p>
        {messages.map((m) => (
          <p key={m} className="mt-6 leading-[1.4]" style={{ fontSize: pt(15) }}>
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Smart replies: blue outlined pills above the composer. */
function SmartReplies({ replies }: { replies: string[] }) {
  return (
    <div className="flex shrink-0 gap-8 overflow-hidden px-16 pb-12">
      {replies.map((r) => (
        <span
          key={r}
          className="shrink-0 rounded-full border px-14 py-6 font-semibold whitespace-nowrap"
          style={{ borderColor: LI.blue, color: LI.blue, fontSize: pt(15) }}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

/** Attach, "Write a message…", voice. */
function Composer({ placeholder }: { placeholder: string }) {
  return (
    <div
      className="flex shrink-0 items-center gap-10 border-t px-12 py-8"
      style={{ borderColor: LI.faint }}
    >
      <Icon>
        <circle cx="12" cy="12" r="9.5" />
        <path d="M12 7.5v9M7.5 12h9" />
      </Icon>
      <span
        className="flex h-40 flex-1 items-center px-12"
        style={{
          background: LI.field,
          borderRadius: pt(8),
          fontSize: pt(15),
          color: LI.muted,
        }}
      >
        {placeholder}
      </span>
      <Icon>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
      </Icon>
    </div>
  );
}

/** A fictional profile photo; with `hiring`, LinkedIn's purple #HIRING frame. */
function Portrait({ className, hiring }: { className?: string; hiring?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={cn("block shrink-0", className)}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <path id={`${id}-arc`} d="M 5.83 66.07 A 47 47 0 0 0 80.21 86" />
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="100" height="100" fill="#d7e3ea" />
        <path
          d="M24 50c-2-24 12-34 26-34s28 10 26 34c-1 14 2 24 6 32H18c4-8 7-18 6-32Z"
          fill="#2b1d18"
        />
        <path d="M42 62h16v14H42z" fill="#b97d57" />
        <path d="M12 100c2-16 16-26 38-26s36 10 38 26Z" fill="#33536b" />
        <path d="M40 74l10 12 10-12" fill="#f1ece4" />
        <ellipse cx="50" cy="46" rx="15" ry="18" fill="#c98e66" />
        <path
          d="M34 44c0-14 8-22 18-22 9 0 15 6 15 16-6-6-14-8-20-8-5 4-9 9-13 14Z"
          fill="#2b1d18"
        />
        <path
          d="M44 55q6 4 12 0"
          stroke="#7a3f2c"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      {hiring && (
        <>
          <path
            d="M 8.65 65.05 A 44 44 0 0 0 78.28 83.7"
            fill="none"
            stroke={LI.hiring}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <text fill="white" fontSize="8.5" fontWeight="700" letterSpacing="0.6">
            <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
              {hiring}
            </textPath>
          </text>
        </>
      )}
    </svg>
  );
}
