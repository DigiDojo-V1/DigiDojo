"use client";

import type { ReactNode } from "react";
import { PhoneCall } from "lucide-react";
import { useT } from "@/i18n/hooks";

/** A white card in the side columns. */
export function RailCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-4 ring-1 ring-black/10">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** Right column from tablets up: optional screen-specific cards, how it works, and the helpline. */
export function RightRail({ children }: { children?: ReactNode }) {
  const t = useT();
  const steps = [t("chrome.how1"), t("chrome.how2"), t("chrome.how3")];
  return (
    <div className="flex flex-col gap-4">
      {children}
      <RailCard title={t("chrome.howTitle")}>
        <ol className="space-y-2.5">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-snug text-black/75">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-black/5 text-[11px] font-semibold tabular-nums">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </RailCard>
      <RailCard title={t("chrome.helpTitle")}>
        <p className="flex gap-2.5 text-sm leading-snug text-black/75">
          <PhoneCall className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
          {t("chrome.helpBody")}
        </p>
      </RailCard>
    </div>
  );
}
