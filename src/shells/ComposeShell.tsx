"use client";

import { useT } from "@/i18n/hooks";
import { FlagToggle } from "./MailShell";
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
    <div className="divide-y">
      <div
        className={
          flagged
            ? "flex items-center gap-2 bg-red-50 px-4 py-2"
            : "flex items-center gap-2 px-4 py-2"
        }
      >
        <span className="w-16 text-sm text-neutral-500">{t("mail.to")}</span>
        <span className="min-w-0 flex-1 font-mono text-[13px] break-all">{to.address}</span>
        <FlagToggle id={to.id} label={`${t("mail.to")} ${to.address}`} {...flag} />
      </div>
      <div className="flex gap-2 px-4 py-2 text-sm">
        <span className="w-16 text-neutral-500">{t("compose.subject")}</span>
        <span className="min-w-0 flex-1">{subject}</span>
      </div>
      <p className="px-4 py-3 text-[15px] whitespace-pre-line">{body}</p>
    </div>
  );
}
