import { CircleSlash, ShieldAlert, ShieldCheck, ShieldX, type LucideIcon } from "lucide-react";
import type { OutcomeResult } from "./schema";

export const OUTCOME_STYLE: Record<
  OutcomeResult,
  { label: string; icon: LucideIcon; tone: string; soft: string }
> = {
  safe: {
    label: "Safe",
    icon: ShieldCheck,
    tone: "text-emerald-700",
    soft: "bg-emerald-50 ring-emerald-200",
  },
  loss: {
    label: "Money lost",
    icon: ShieldX,
    tone: "text-red-700",
    soft: "bg-red-50 ring-red-200",
  },
  "partial-loss": {
    label: "Partial loss",
    icon: ShieldAlert,
    tone: "text-amber-700",
    soft: "bg-amber-50 ring-amber-200",
  },
  "missed-opportunity": {
    label: "Missed opportunity",
    icon: CircleSlash,
    tone: "text-sky-700",
    soft: "bg-sky-50 ring-sky-200",
  },
};
