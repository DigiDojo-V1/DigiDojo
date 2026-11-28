import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/* Telegram's logo, its default chat wallpaper, bubble tails and letter avatars.
 * Decorative: callers hide them from screen readers. Used with permission (see CLAUDE.md). */

/** The paper plane, cut from the 24 × 24 logo. */
const PLANE_PATH =
  "M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z";

/** The full-colour logo: a blue circle with the white paper plane. */
export function TelegramLogo({ className }: { className?: string }) {
  const id = `tg-logo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#2AABEE" />
          <stop offset="1" stopColor="#229ED9" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill={`url(#${id})`} />
      <path d={PLANE_PATH} fill="#fff" />
    </svg>
  );
}

/** The one-colour logo (circle with the plane cut out), for icon slots that use currentColor. */
export function TelegramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d={`M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z${PLANE_PATH}`} />
    </svg>
  );
}

/** Telegram's curved bubble tail, drawn beside the bubble's bottom corner. Fill is currentColor. */
export function BubbleTail({ side, className }: { side: "left" | "right"; className?: string }) {
  return (
    <svg
      viewBox="0 0 7 17"
      aria-hidden
      className={cn(
        "absolute bottom-0 h-[17px] w-[7px]",
        side === "right" ? "left-[calc(100%-1px)]" : "right-[calc(100%-1px)] -scale-x-100",
        className,
      )}
    >
      <path
        fill="currentColor"
        d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 0 1 6 17z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Default wallpaper: the green gradient with the doodle pattern        */
/* ------------------------------------------------------------------ */

const DOODLES = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180' fill='none' stroke='#2d5a33' stroke-opacity='.16' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'>
<path d='M14 34 42 20l-8 28-7-11Zm13 3 15-17'/>
<path d='M118 40c-7-5-13-9-13-14a6 6 0 0 1 13-3 6 6 0 0 1 13 3c0 5-6 9-13 14Z'/>
<path d='m70 66 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1Z'/>
<circle cx='150' cy='92' r='9'/><path d='M146 90h0m8 0h0m-9 5c2 3 7 3 9 0'/>
<path d='M30 128v-20l16-4v18'/><circle cx='26' cy='128' r='4'/><circle cx='42' cy='122' r='4'/>
<path d='M98 142h26a7 7 0 0 0-2-13.6 9 9 0 0 0-17-2.4A7 7 0 0 0 98 142Z'/>
<path d='M150 150l6-12 6 12m-10-4h8'/>
<path d='M60 160c5-6 10-6 15 0s10 6 15 0'/>
<rect x='92' y='72' width='16' height='12' rx='2'/><circle cx='100' cy='78' r='3'/>
<path d='M8 80h0m168-60h0M84 12h0m90 120h0M50 96h0M130 168h0'/>
<path d='M160 26l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z'/>
</svg>`;

/** Background for the message area: put it on the element behind the scrolling messages. */
export const TELEGRAM_WALLPAPER: CSSProperties = {
  backgroundColor: "#a8c78d",
  backgroundImage: [
    `url("data:image/svg+xml,${encodeURIComponent(DOODLES)}")`,
    "radial-gradient(circle at 12% 8%, #dbddbb 0, transparent 60%)",
    "radial-gradient(circle at 92% 22%, #d5d88d 0, transparent 55%)",
    "radial-gradient(circle at 10% 92%, #88b884 0, transparent 60%)",
    "radial-gradient(circle at 88% 88%, #6ba587 0, transparent 60%)",
  ].join(", "),
  backgroundSize: "180px 180px, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
};

/* ------------------------------------------------------------------ */
/* Letter avatars and name colours                                      */
/* ------------------------------------------------------------------ */

/** Telegram's seven peer colours: avatar gradients and the matching name colour in groups. */
const PEERS = [
  { from: "#FF885E", to: "#FF516A", name: "#CC5049" },
  { from: "#FFCD6A", to: "#FFA85C", name: "#D67722" },
  { from: "#82B1FF", to: "#665FFF", name: "#955CDB" },
  { from: "#A0DE7E", to: "#54CB68", name: "#40A920" },
  { from: "#53EDD6", to: "#28C9B7", name: "#309EBA" },
  { from: "#72D5FD", to: "#2A9EF1", name: "#368AD9" },
  { from: "#E0A2F3", to: "#D669ED", name: "#C7508B" },
] as const;

function peerFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PEERS[hash % PEERS.length];
}

/** The colour of a sender's name in a group. */
export function peerNameColor(name: string): string {
  return peerFor(name).name;
}

/** Up to two initials, from the first and last words that start with a letter or digit. */
function initials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((w) => w.length > 0);
  const first = words[0]?.charAt(0) ?? "";
  const last = words.length > 1 ? (words.at(-1)?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

/** A photo, or Telegram's gradient circle with initials. */
export function TelegramAvatar({
  name,
  src,
  size,
  text,
}: {
  name: string;
  src?: string;
  /** Tailwind size class, e.g. "size-10". */
  size: string;
  /** Tailwind text size for the initials. */
  text: string;
}) {
  if (src !== undefined) {
    // Scenario avatars are local files in /public, so a plain img is fine here.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn(size, "shrink-0 rounded-full object-cover")} />;
  }
  const peer = peerFor(name);
  return (
    <span
      aria-hidden
      className={cn(
        size,
        text,
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
      )}
      style={{ backgroundImage: `linear-gradient(180deg, ${peer.from}, ${peer.to})` }}
    >
      {initials(name)}
    </span>
  );
}
