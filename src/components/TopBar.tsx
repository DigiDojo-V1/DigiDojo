"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { LanguageToggle } from "@/i18n/LanguageToggle";
import { cn } from "@/lib/utils";

interface TopBarProps {
  /** Optional back arrow on the left. */
  back?: { href: string; label: "nav.backToHome" | "nav.backToDojo" };
  className?: string;
}

/**
 * The row at the top of every non-simulation screen on phones: back arrow on the left, language on
 * the right. From tablets up, `AppChrome`'s top nav takes over.
 */
export function TopBar({ back, className }: TopBarProps) {
  const t = useT();
  return (
    <div className={cn("flex h-9 items-center justify-between gap-2 md:hidden", className)}>
      {back !== undefined ? (
        <Link
          href={back.href}
          aria-label={t(back.label)}
          className="-ml-1.5 rounded-full p-1.5 hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <span />
      )}
      <LanguageToggle />
    </div>
  );
}
