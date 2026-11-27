"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { PhoneFrame } from "./PhoneFrame";
import { SimulationBar } from "./SimulationBar";
import type { ShellProps } from "./types";

/** Shared body for shells that aren't built yet. Still shows the choices so scenarios can be played. */
export function ComingSoonShell({ name, backHref, footer }: ShellProps & { name: string }) {
  const t = useT();
  return (
    <PhoneFrame>
      <div className="flex min-h-dvh flex-col bg-neutral-100 lg:min-h-full lg:flex-1">
        <SimulationBar />
        <header className="flex h-14 items-center gap-2 border-b bg-white px-2">
          <Link
            href={backHref}
            aria-label={t("nav.back")}
            className="rounded-full p-1.5 hover:bg-neutral-100"
          >
            <ChevronLeft className="size-5" />
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-muted-foreground">
          {t("shell.comingSoon")(name)}
        </div>
        {footer}
      </div>
    </PhoneFrame>
  );
}
