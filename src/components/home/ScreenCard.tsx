"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { MONO } from "@/components/landing/styles";
import { cn } from "@/lib/utils";

/**
 * One white card in the middle of `HomeShell`, for the screens around a scenario (intro, how to
 * play, outcome, debrief) and the 404. `narrow` is centred on the screen; `wide` is for long
 * screens that scroll, like the debrief.
 */
export function ScreenCard({
  children,
  width = "narrow",
  className,
}: {
  children: ReactNode;
  width?: "narrow" | "wide";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center pt-2 pb-4 md:pb-8",
        width === "narrow" && "justify-center",
      )}
    >
      <section
        className={cn(
          "flex w-full flex-col rounded-[28px] bg-white p-5 ring-1 ring-black/10 sm:p-8 md:p-10",
          width === "narrow" ? "max-w-[560px]" : "max-w-[760px]",
          className,
        )}
      >
        {children}
      </section>
    </div>
  );
}

/** Chevron and a small mono label, at the top left of a card. */
export function CardBack({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={`${MONO} -ml-2 flex h-8 items-center gap-1 self-start rounded-full pr-3 pl-1 text-black/55 transition hover:bg-black/5 hover:text-black/80`}
    >
      <ChevronLeft aria-hidden className="size-4" />
      {label}
    </Link>
  );
}

/** The big black pill button used to start or move on. */
export const BIG_BUTTON =
  "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#121212] px-7 text-base font-semibold text-[#f3f1ec] transition hover:bg-black active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40 disabled:opacity-50";

/** The outline pill that sits next to or under `BIG_BUTTON`. */
export const OUTLINE_BUTTON =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold ring-1 ring-black/20 transition hover:bg-black/5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40";
