"use client";

import { AnimatePresence, motion } from "motion/react";
import { FileText, MessageCircle, MessageSquareText, X } from "lucide-react";
import { useT } from "@/i18n/hooks";

export interface PhoneNotice {
  id: string;
  app: "sms" | "whatsapp";
  sender: string;
  text: string;
  /** A file the player can open. */
  fileName?: string;
}

/** Banners that drop in from the top of the phone during a call: an OTP text, a "warrant" PDF. */
export function PhoneNotifications({
  notices,
  onOpen,
  onDismiss,
}: {
  notices: readonly PhoneNotice[];
  onOpen: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const t = useT();
  return (
    <div className="pointer-events-none sticky top-10 z-50 -mb-px h-0">
      <div className="space-y-2 px-2">
        <AnimatePresence>
          {notices.map((notice) => {
            const Icon = notice.app === "sms" ? MessageSquareText : MessageCircle;
            return (
              <motion.div
                key={notice.id}
                layout
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                role="status"
                className="pointer-events-auto rounded-2xl bg-white/95 p-3 text-slate-900 shadow-xl ring-1 ring-black/10 backdrop-blur"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon className="size-3.5" aria-hidden />
                  <span className="font-medium">{t(`call.notification.${notice.app}`)}</span>
                  <span>· {t("call.notification.now")}</span>
                  <button
                    type="button"
                    onClick={() => onDismiss(notice.id)}
                    aria-label={t("flag.close")}
                    className="ml-auto flex size-8 items-center justify-center rounded-full hover:bg-black/5"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <p className="text-sm font-semibold">{notice.sender}</p>
                <p className="mt-0.5 text-sm leading-snug">{notice.text}</p>
                {notice.fileName !== undefined && (
                  <button
                    type="button"
                    onClick={() => onOpen(notice.id)}
                    className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-xl bg-slate-100 px-3 text-left text-sm font-medium hover:bg-slate-200"
                  >
                    <FileText className="size-5 shrink-0 text-red-600" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{notice.fileName}</span>
                    <span className="text-xs text-blue-700">{t("call.notification.open")}</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
