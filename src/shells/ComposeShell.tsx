"use client";

import { EllipsisVertical } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { FlagToggle, MailAvatar } from "./MailShell";
import type { AddressView, FlagProps } from "./types";

/** The reply composer shown before sending. Nothing is ever sent; the fields can't be edited. */
export function ComposeBody({
  to,
  subject,
  body,
  ...flag
}: FlagProps & { to: AddressView; subject: string; body: string }) {
  const t = useT();
  const flagged = flag.flaggedIds.includes(to.id);
  return (
    <div className="divide-y divide-slate-200 text-slate-900">
      <div className={cn("flex items-center gap-3 px-4 py-2", flagged && "bg-red-50")}>
        <span className="w-14 shrink-0 text-[15px] text-slate-500">{t("mail.to")}</span>
        <span
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1.5 rounded-full py-0.5 pr-3 pl-0.5 ring-1",
            flagged ? "bg-white ring-red-300" : "bg-slate-100 ring-slate-200",
          )}
        >
          <MailAvatar name={to.address} className="size-6 text-xs" />
          <span className="min-w-0 font-mono text-[13px] break-all">{to.address}</span>
        </span>
        <FlagToggle id={to.id} label={`${t("mail.to")} ${to.address}`} {...flag} />
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-14 shrink-0 text-[15px] text-slate-500">{t("compose.subject")}</span>
        <span className="min-w-0 flex-1 text-[15px]">{subject}</span>
      </div>
      <div className="px-4 py-4">
        <p className="min-h-32 text-[15px] leading-relaxed whitespace-pre-line">{body}</p>
        <span
          aria-hidden
          className="mt-4 inline-flex h-6 items-center rounded-full bg-slate-100 px-2 text-slate-500"
        >
          <EllipsisVertical className="size-4 rotate-90" />
        </span>
      </div>
    </div>
  );
}
