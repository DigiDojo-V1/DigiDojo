"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { House, ShieldCheck } from "lucide-react";
import { useT, useText } from "@/i18n/hooks";
import { LanguageToggle } from "@/i18n/LanguageToggle";
import { cn } from "@/lib/utils";
import { useDojoSummaries } from "./chrome-data";
import { ProgressCard } from "./ProgressCard";
import { RightRail } from "./RightRail";

/**
 * The frame around DigiDojo's own screens (home, dojo, primer, outcome, debrief).
 * - Phones: one 420 px column, exactly as before. Each screen keeps its own `TopBar`.
 * - Tablets (`md`): a top nav, the screen, and a right rail.
 * - Desktop (`lg`): a professional-network-style three-column grid: progress card, screen, right rail.
 * Screens hide their `TopBar` and outer padding from `md` up (`md:hidden`, `md:p-0`).
 */
export function AppChrome({
  children,
  left,
  right,
}: {
  children: ReactNode;
  /** Left column on desktop. Defaults to the progress card. */
  left?: ReactNode;
  /** Right rail from tablets up. Defaults to how it works + the helpline. */
  right?: ReactNode;
}) {
  return (
    <div className="min-h-dvh md:bg-[#f4f2ee]">
      <DesktopNav />
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col bg-background shadow-xl",
          "md:grid md:min-h-0 md:max-w-[960px] md:grid-cols-[minmax(0,1fr)_280px] md:items-start md:gap-6 md:bg-transparent md:px-6 md:py-6 md:shadow-none",
          "lg:max-w-[1128px] lg:grid-cols-[225px_minmax(0,1fr)_300px]",
        )}
      >
        <aside className="hidden lg:sticky lg:top-[76px] lg:block">{left ?? <ProgressCard />}</aside>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        <aside className="hidden md:sticky md:top-[76px] md:block">{right ?? <RightRail />}</aside>
      </div>
    </div>
  );
}

/** The bar across the top on wide screens: brand on the left, home and the dojos, language. */
function DesktopNav() {
  const t = useT();
  const text = useText();
  const pathname = usePathname();
  const dojos = useDojoSummaries();

  return (
    <header className="sticky top-0 z-40 hidden h-[52px] border-b border-black/10 bg-white md:block">
      <div className="mx-auto flex h-full max-w-[1128px] items-center gap-4 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={t("home.title")}>
          <span className="flex size-[34px] items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight">{t("home.title")}</span>
        </Link>
        <nav aria-label={t("chrome.nav")} className="ml-auto flex h-full items-stretch">
          <NavItem href="/" active={pathname === "/"} label={t("chrome.home")}>
            <House className="size-6" aria-hidden />
          </NavItem>
          {dojos.map((dojo) => (
            <NavItem
              key={dojo.id}
              href={`/dojo/${dojo.id}`}
              active={pathname.startsWith(`/dojo/${dojo.id}`)}
              label={text(dojo.name)}
            >
              <span
                aria-hidden
                className="flex size-6 items-center justify-center rounded-full border-2 border-current text-[11px] font-bold"
              >
                {dojo.order}
              </span>
            </NavItem>
          ))}
        </nav>
        <span aria-hidden className="h-8 w-px bg-black/10" />
        <LanguageToggle />
      </div>
    </header>
  );
}

function NavItem({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-[72px] flex-col items-center justify-center gap-0.5 text-black/60 transition-colors hover:text-black/90 lg:w-[88px]",
        active && "text-black/90 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-black/90",
      )}
    >
      {children}
      <span className="max-w-full truncate px-1 text-xs leading-none">{label}</span>
    </Link>
  );
}
