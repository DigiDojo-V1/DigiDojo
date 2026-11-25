"use client";

import { Check } from "lucide-react";
import { useHydrated, useProgressStore } from "@/engine/store";
import { useT } from "@/i18n/hooks";
import { cn } from "cn";
import { ChannelIcon } from "./ChannelIcon";
import type { Channel } from "./channels";

/**
 * The icon square on a scenario card. Outlined until the scenario is done, then filled
 * black with a small check.
 */
export function ScenarioTile({ channel, scenarioKey }: { channel: Channel; scenarioKey: string }) {
  const t = useT();
  const hydrated = useHydrated();
  const done = useProgressStore((s) => s.completed[scenarioKey] === true) && hydrated;

  return (
    <span
      className={cn(
        "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
        done
          ? "bg-primary text-primary-foreground"
          : "bg-background text-foreground ring-1 ring-foreground/15",
      )}
    >
      <ChannelIcon channel={channel} aria-hidden className="size-5" strokeWidth={1.75} />
      {done && (
        <span className="absolute -right-1 -bottom-1 flex size-4.5 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-foreground">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
      <span className="sr-only">{t(done ? "progress.completed" : "progress.notCompleted")}</span>
    </span>
  );
}
