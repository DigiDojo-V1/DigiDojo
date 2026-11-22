import { CircleSlash, ShieldAlert, ShieldCheck, ShieldX, type LucideIcon } from "lucide-react";
import type { OutcomeResult } from "./schema";

/** Icon and colours per outcome. The label is the UI string `outcome.<result>`. */
export const OUTCOME_STYLE: Record<
  OutcomeResult,
  { icon: LucideIcon; tone: string; soft: string }
> = {
  safe: {
    icon: ShieldCheck,
    tone: "text-emerald-700",
    soft: "bg-emerald-50 ring-emerald-200",
  },
  loss: {
    icon: ShieldX,
    tone: "text-red-700",
    soft: "bg-red-50 ring-red-200",
  },
  "partial-loss": {
    icon: ShieldAlert,
    tone: "text-amber-700",
    soft: "bg-amber-50 ring-amber-200",
  },
  "missed-opportunity": {
    icon: CircleSlash,
    tone: "text-sky-700",
    soft: "bg-sky-50 ring-sky-200",
  },
};
