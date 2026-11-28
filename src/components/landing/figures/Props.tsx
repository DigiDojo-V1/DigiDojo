"use client";

import { forwardRef } from "react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { DISPLAY, MONO } from "../styles";
import { StickFigure } from "./StickFigure";

/** A phone cut-out showing a fictional "earn from home" DM, printed in grayscale. */
export function PhoneCutout({ className }: { className?: string }) {
  const t = useT();
  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-[9/18.5] w-[230px] rounded-[34px] bg-[#161616] p-[9px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] [filter:grayscale(1)_contrast(1.08)]",
        className,
      )}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[26px] bg-[#efeeeb]">
        <div className="mx-auto mt-2 h-[18px] w-[72px] rounded-full bg-[#161616]" />
        <div className="mt-2 flex items-center gap-2 border-b border-black/10 px-3 pb-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#8a8a8a] text-[11px] font-semibold text-white">
            P
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] font-semibold text-black">
              {t("landing.why.phone.contact")}
            </span>
            <span className="block text-[9px] text-black/50">{t("landing.why.phone.status")}</span>
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3 text-[10.5px] leading-snug text-black">
          <p className="max-w-[85%] self-start rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
            {t("landing.why.phone.msg1")}
          </p>
          <p className="max-w-[85%] self-start rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
            {t("landing.why.phone.msg2")}
          </p>
          <p className="max-w-[85%] self-start rounded-xl rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
            {t("landing.why.phone.msg3")}
          </p>
          <span className="mt-auto self-end rounded-full border border-black/30 px-3 py-1 text-[10px] font-medium">
            {t("landing.why.phone.reply")}
          </span>
        </div>
      </div>
    </div>
  );
}

/** A tilted sticker of a fictional recruiter profile, white border and drop shadow. */
export function ProfileSticker({ className }: { className?: string }) {
  const t = useT();
  return (
    <div
      aria-hidden
      className={cn(
        "w-[200px] rotate-[-8deg] bg-white p-[7px] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div className="bg-[#d9d6d0] [filter:grayscale(1)_contrast(1.1)]">
        <svg viewBox="0 0 120 110" className="block w-full">
          <rect width="120" height="110" fill="#cfcbc4" />
          <circle cx="60" cy="44" r="22" fill="#2b2b2b" />
          <path d="M38 40c2-16 42-18 44 2-6-6-16-10-22-10s-16 2-22 8z" fill="#111" />
          <path d="M18 110c4-26 22-38 42-38s38 12 42 38z" fill="#3a3a3a" />
          <path d="M52 74l8 12 8-12" fill="#efeeeb" />
          <path d="M46 52q14 10 28 0" stroke="#efeeeb" strokeWidth="2.5" fill="none" />
        </svg>
      </div>
      <div className="px-1.5 pt-2 pb-1 text-black">
        <p className="text-[13px] leading-tight font-semibold">
          {t("landing.pretend.sticker.name")}
        </p>
        <p className="text-[10px] text-black/55">{t("landing.pretend.sticker.role")}</p>
        <p className={`${MONO} mt-1.5 inline-flex items-center gap-1 text-[8px] text-[#2f3be0]`}>
          <span className="inline-block size-2 rounded-full bg-[#2f3be0]" />
          {t("landing.pretend.sticker.badge")}
        </p>
      </div>
    </div>
  );
}

/** A chrome spray can, nozzle top-left. */
export function SprayCan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 150" aria-hidden className={className}>
      <defs>
        <linearGradient id="land-can" x1="0" x2="1">
          <stop offset="0" stopColor="#5d5d5d" />
          <stop offset="0.22" stopColor="#e9e9e9" />
          <stop offset="0.45" stopColor="#9d9d9d" />
          <stop offset="0.8" stopColor="#d4d4d4" />
          <stop offset="1" stopColor="#555" />
        </linearGradient>
        <linearGradient id="land-cap" x1="0" x2="1">
          <stop offset="0" stopColor="#2a2a2a" />
          <stop offset="0.35" stopColor="#8a8a8a" />
          <stop offset="1" stopColor="#1e1e1e" />
        </linearGradient>
      </defs>
      <rect x="22" y="2" width="12" height="10" rx="2" fill="url(#land-cap)" />
      <rect x="15" y="10" width="26" height="9" rx="3" fill="url(#land-cap)" />
      <path
        d="M8 30c0-8 8-12 20-12s20 4 20 12v108c0 6-6 10-20 10S8 144 8 138z"
        fill="url(#land-can)"
      />
      <path d="M8 34c6 4 34 4 40 0" stroke="#777" strokeWidth="1" fill="none" />
      <path d="M8 132c6 4 34 4 40 0" stroke="#777" strokeWidth="1" fill="none" />
      <rect x="14" y="54" width="28" height="56" rx="2" fill="#ec7230" opacity="0.9" />
    </svg>
  );
}

/** The parachutist for the finale: a stick figure hanging under a blue canopy. */
export const Parachutist = forwardRef<HTMLDivElement, { canopyRef?: React.Ref<SVGGElement> }>(
  function Parachutist({ canopyRef }, ref) {
    return (
      <div ref={ref} aria-hidden className="absolute top-0 left-0 w-[64px] text-[var(--land-fg)]">
        <svg
          viewBox="0 0 64 56"
          className="absolute bottom-[38px] left-0 w-[64px] overflow-visible"
        >
          <g ref={canopyRef} style={{ transformOrigin: "32px 56px", transformBox: "view-box" }}>
            <path
              d="M4 26C4 10 18 2 32 2s28 8 28 24c-5-4-9-4-14 0-4-4-10-4-14 0-4-4-10-4-14 0-5-4-9-4-14 0z"
              fill="#2f3be0"
            />
            <path
              d="M18 26C18 14 24 4 32 2M46 26C46 14 40 4 32 2"
              stroke="#1c26b8"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M5 26 27 54M18 26 29 54M46 26 35 54M59 26 37 54"
              stroke="currentColor"
              strokeWidth="0.9"
            />
          </g>
        </svg>
        <StickFigure pose="hang" className="relative ml-[14px] w-[36px]" />
      </div>
    );
  },
);

/** One letter for headings whose letters are animated individually. */
export function Letter({ char, className }: { char: string; className?: string }) {
  return <span className={cn(DISPLAY, "inline-block whitespace-pre", className)}>{char}</span>;
}
