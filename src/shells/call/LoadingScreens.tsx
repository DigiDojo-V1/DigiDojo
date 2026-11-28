"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { Check, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CallerAvatar, CallFrame } from "./parts";

export interface LoadingStep {
  icon: LucideIcon;
  label: string;
}

/**
 * A full call screen while something slow happens: the caller's avatar with rings going out,
 * a title, and a checklist of steps. `current` is the step under way; earlier ones show as done.
 */
export function CallLoadingScreen({
  name,
  title,
  subtitle,
  steps,
  current,
  footer,
}: {
  name: string;
  title: string;
  subtitle?: string;
  steps: LoadingStep[];
  current: number;
  footer?: React.ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <CallFrame>
        <div
          role="status"
          aria-live="polite"
          className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center"
        >
          <div className="relative flex size-40 items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute inset-6 rounded-full border border-sky-300/50"
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
              />
            ))}
            <CallerAvatar name={name} />
          </div>
          <div>
            <p className="text-xl font-semibold">{title}</p>
            {subtitle !== undefined && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          </div>
          <ol className="w-full max-w-72 space-y-2.5 text-left text-sm">
            {steps.map((step, i) => {
              const done = i < current;
              const active = i === current;
              const Icon = step.icon;
              return (
                <li
                  key={step.label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                    active ? "bg-white/10 text-white" : done ? "text-white/80" : "text-white/40",
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center">
                    {done ? (
                      <Check className="size-4 text-emerald-400" aria-hidden />
                    ) : active ? (
                      <Loader2 className="size-4 animate-spin text-sky-300" aria-hidden />
                    ) : (
                      <Icon className="size-4" aria-hidden />
                    )}
                  </span>
                  <span>{step.label}</span>
                </li>
              );
            })}
          </ol>
        </div>
        {footer !== undefined && <div className="px-6 pt-2 pb-8">{footer}</div>}
      </CallFrame>
    </MotionConfig>
  );
}

/** Moves through `count` steps one every `everyMs`, stopping on the last, for work with no progress events. */
export function useTimedStep(count: number, everyMs = 1300): number {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(count - 1, s + 1)), everyMs);
    return () => clearInterval(timer);
  }, [count, everyMs]);
  return step;
}
