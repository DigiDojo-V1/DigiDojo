"use client";

import { useRef } from "react";
import { VideoOff } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { CallTimer, useAnimationLevel } from "./parts";

/**
 * The caller's "video": a flat illustration of a uniformed officer at a desk, not a real person
 * or a real force's uniform. The mouth moves with the caller's voice. The player's own camera is
 * never used: their tile just says it's off.
 */
export function VideoFeed({
  name,
  label,
  level,
  since,
}: {
  name: string;
  label?: string;
  level?: () => number;
  since: number | null;
}) {
  const t = useT();
  const mouth = useRef<SVGRectElement>(null);
  const head = useRef<SVGGElement>(null);
  useAnimationLevel(level, (v) => {
    mouth.current?.setAttribute("height", String(2 + v * 9));
    mouth.current?.setAttribute("y", String(118 - v * 4));
    head.current?.setAttribute("transform", `translate(0 ${v * 1.5})`);
  });

  return (
    <div className="relative mx-3 overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10">
      <svg viewBox="0 0 240 260" className="block w-full" role="img" aria-label={name}>
        <defs>
          <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1e3a5f" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect width="240" height="260" fill="url(#wall)" />
        {/* A made-up wall crest: a plain shield, no real emblem. */}
        <g opacity="0.35" transform="translate(178 22)">
          <path d="M20 0 L40 8 V24 C40 36 30 44 20 48 C10 44 0 36 0 24 V8 Z" fill="#cbd5e1" />
          <circle cx="20" cy="22" r="7" fill="#1e3a5f" />
        </g>
        <rect x="16" y="30" width="70" height="44" rx="3" fill="#334155" opacity="0.5" />
        <g ref={head}>
          {/* Shoulders and uniform. */}
          <path d="M40 260 C44 196 76 172 120 172 C164 172 196 196 200 260 Z" fill="#334a63" />
          <path d="M104 174 L120 206 L136 174 Z" fill="#e2e8f0" />
          <rect x="72" y="196" width="22" height="5" rx="1" fill="#facc15" opacity="0.8" />
          <rect x="146" y="196" width="22" height="5" rx="1" fill="#facc15" opacity="0.8" />
          {/* Neck and face. */}
          <rect x="108" y="140" width="24" height="36" rx="8" fill="#b07a55" />
          <ellipse cx="120" cy="112" rx="34" ry="40" fill="#c58b62" />
          <circle cx="107" cy="106" r="3.5" fill="#1f2937" />
          <circle cx="133" cy="106" r="3.5" fill="#1f2937" />
          <path
            d="M100 96 h14 M126 96 h14"
            stroke="#3f2a1d"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M108 124 q12 4 24 0"
            stroke="#3f2a1d"
            strokeWidth="4"
            fill="none"
            opacity="0.8"
          />
          <rect ref={mouth} x="113" y="118" width="14" height="2" rx="2" fill="#6b2f2a" />
          {/* Peaked cap. */}
          <path d="M82 84 C84 56 156 56 158 84 Z" fill="#1e2f45" />
          <rect x="80" y="80" width="80" height="9" rx="4" fill="#0f1b2b" />
          <circle cx="120" cy="70" r="6" fill="#facc15" opacity="0.85" />
        </g>
        {/* Desk edge. */}
        <rect x="0" y="244" width="240" height="16" fill="#3b2f2a" />
      </svg>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 text-xs font-semibold">
        <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5">
          <span className="size-2 animate-pulse rounded-full bg-red-500" /> {t("call.rec")}
        </span>
        <span className="rounded-full bg-black/40 px-2 py-0.5 tabular-nums">
          <CallTimer since={since} />
        </span>
      </div>
      <div className="absolute bottom-2.5 left-2.5 max-w-[60%] rounded-lg bg-black/45 px-2 py-1 leading-tight">
        <p className="truncate text-sm font-semibold">{name}</p>
        {label !== undefined && <p className="truncate text-[11px] text-white/70">{label}</p>}
      </div>
      <div className="absolute right-2.5 bottom-2.5 flex h-24 w-[4.5rem] flex-col items-center justify-center gap-1 rounded-lg bg-slate-800 text-center text-[10px] leading-tight text-white/60 ring-1 ring-white/15">
        <VideoOff className="size-4" aria-hidden />
        {t("call.cameraOff")}
      </div>
    </div>
  );
}
