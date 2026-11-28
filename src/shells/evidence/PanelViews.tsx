"use client";

import type { ReactNode } from "react";
import { Briefcase, Building2, Globe, Landmark, Lock, MapPin, RotateCw, Users } from "lucide-react";
import type { ProfileSlot } from "@/engine/schema";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { FlagToggle } from "../MailShell";
import type { FlagProps, PanelFieldView, PanelView } from "../types";
import { DocumentPages } from "./PdfViewer";

/**
 * How each kind of evidence panel looks: a profile, a company page, an official record,
 * a careers web page or a PDF. Our own designs in the spirit of the real thing, never copies.
 * Every field stays flaggable with its own 44 px flag control.
 */
export function PanelBody({ panel, ...flag }: FlagProps & { panel: PanelView }) {
  if (panel.variant === "official-record") return <RecordCard panel={panel} {...flag} />;
  switch (panel.kind) {
    case "profile":
      return <ProfileView panel={panel} {...flag} />;
    case "company":
      return <CompanyView panel={panel} {...flag} />;
    case "web-page":
      return <WebPageView panel={panel} {...flag} />;
    case "document":
      return (
        <div className="bg-[#2a2a2c]">
          <DocumentPages panel={panel} {...flag} />
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

function ariaLabel(field: PanelFieldView): string {
  return field.label === undefined ? field.value : `${field.label}: ${field.value}`;
}

/** A line with its flag control. Flagged lines get a red tint. */
function FlaggableRow({
  field,
  children,
  className,
  ...flag
}: FlagProps & { field: PanelFieldView; children: ReactNode; className?: string }) {
  const flagged = flag.flaggedIds.includes(field.id);
  return (
    <div
      className={cn(
        "flex items-start gap-1 rounded-lg px-2 py-2 transition-colors",
        flagged && "bg-red-50 ring-1 ring-red-300",
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <FlagToggle id={field.id} label={ariaLabel(field)} className="mt-0.5" {...flag} />
    </div>
  );
}

function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /^[\p{L}\p{N}]/u.test(w));
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/** A stable pick from a list, so the same panel always gets the same banner. */
function pick<T>(seed: string, options: readonly T[]): T {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return options[hash % options.length]!;
}

const BANNERS = [
  "bg-gradient-to-r from-indigo-300 via-sky-200 to-teal-200",
  "bg-gradient-to-r from-slate-300 via-indigo-200 to-sky-200",
  "bg-gradient-to-r from-teal-200 via-sky-200 to-indigo-300",
] as const;

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("bg-white px-2 py-3 shadow-sm ring-1 ring-slate-200", className)}>
      {children}
    </section>
  );
}

function CardHeading({ children }: { children: ReactNode }) {
  return <h3 className="px-2 pb-1 text-lg font-semibold text-slate-900">{children}</h3>;
}

/** "Company — Role — dates" becomes a bold first line and muted lines under it. */
function EntryLines({ value }: { value: string }) {
  const parts = value.split(" — ");
  if (parts.length < 2) return <p className="text-[15px] whitespace-pre-line">{value}</p>;
  const [first, ...rest] = parts;
  return (
    <>
      <p className="text-[15px] font-semibold text-slate-900">{first}</p>
      {rest.map((line, i) => (
        <p key={i} className={cn("text-sm", i === 0 ? "text-slate-800" : "text-slate-500")}>
          {line}
        </p>
      ))}
    </>
  );
}

/** A labelled line: small grey label, value under it. */
function LabelledValue({ field }: { field: PanelFieldView }) {
  return (
    <>
      {field.label !== undefined && (
        <span className="block text-xs text-slate-500">{field.label}</span>
      )}
      <span
        className={cn("block whitespace-pre-line", field.finePrint ? "text-[11px]" : "text-sm")}
      >
        {field.value}
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

const SLOT_ORDER: readonly ProfileSlot[] = ["name", "headline", "location", "connections"];

function ProfileView({ panel, ...flag }: FlagProps & { panel: PanelView }) {
  const t = useT();
  const fields = panel.sections.flatMap((s) => s.fields);
  const slotted = SLOT_ORDER.flatMap((slot) => fields.filter((f) => f.slot === slot));
  const nameField = slotted.find((f) => f.slot === "name");

  return (
    <div className="space-y-2 bg-slate-100 pb-4">
      <Card className="px-0 pt-0">
        <div aria-hidden className={cn("h-24", pick(panel.id, BANNERS))} />
        <div
          aria-hidden
          className="-mt-11 ml-4 flex size-[88px] items-center justify-center rounded-full bg-indigo-100 text-3xl font-semibold text-indigo-800 ring-4 ring-white"
        >
          {initials(nameField?.value ?? panel.title)}
        </div>
        <div className="mt-1 px-2">
          {slotted.length === 0 ? (
            <div className="px-2 py-1">
              <h2 className="text-xl font-bold text-slate-900">{panel.title}</h2>
              {panel.subtitle !== undefined && (
                <p className="text-[15px] text-slate-800">{panel.subtitle}</p>
              )}
            </div>
          ) : (
            slotted.map((field) => (
              <FlaggableRow key={field.id} field={field} className="py-1" {...flag}>
                <ProfileSlotLine field={field} />
              </FlaggableRow>
            ))
          )}
        </div>
      </Card>

      {panel.sections.map((section, i) => {
        const rest = section.fields.filter((f) => f.slot === undefined);
        if (rest.length === 0) return null;
        const heading = section.heading ?? (i === 0 ? t("evidence.intro") : undefined);
        return (
          <Card key={i}>
            {heading !== undefined && <CardHeading>{heading}</CardHeading>}
            <div className="divide-y divide-slate-100">
              {rest.map((field) => (
                <FlaggableRow key={field.id} field={field} {...flag}>
                  {field.label !== undefined ? (
                    <LabelledValue field={field} />
                  ) : field.value.includes(" — ") ? (
                    <div className="flex gap-3">
                      <span
                        aria-hidden
                        className="flex size-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-600 ring-1 ring-slate-200"
                      >
                        {initials(field.value.split(" — ")[0]!) || <Building2 className="size-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <EntryLines value={field.value} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[15px] leading-relaxed whitespace-pre-line text-slate-800">
                      {field.value}
                    </p>
                  )}
                </FlaggableRow>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ProfileSlotLine({ field }: { field: PanelFieldView }) {
  switch (field.slot) {
    case "name":
      return <h2 className="text-xl leading-tight font-bold text-slate-900">{field.value}</h2>;
    case "headline":
      return <p className="text-[15px] leading-snug text-slate-800">{field.value}</p>;
    case "location":
      return (
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="size-3.5 shrink-0" aria-hidden /> {field.value}
        </p>
      );
    case "connections":
      return (
        <p className="flex items-center gap-1 text-sm font-semibold text-indigo-700">
          <Users className="size-3.5 shrink-0" aria-hidden /> {field.value}
        </p>
      );
    case undefined:
      return <LabelledValue field={field} />;
  }
}

/* ------------------------------------------------------------------ */
/* Company page and official record                                    */
/* ------------------------------------------------------------------ */

function looksLikeHost(value: string): boolean {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(value.trim());
}

function CompanyView({ panel, ...flag }: FlagProps & { panel: PanelView }) {
  const t = useT();
  return (
    <div className="space-y-2 bg-slate-100 pb-4">
      <Card className="px-0 pt-0">
        <div aria-hidden className={cn("h-16", pick(panel.id, BANNERS))} />
        <div
          aria-hidden
          className="-mt-8 ml-4 flex size-16 items-center justify-center rounded-lg bg-white text-xl font-bold text-indigo-800 shadow ring-1 ring-slate-200"
        >
          {initials(panel.title)}
        </div>
        <div className="px-4 pt-2 pb-1">
          <h2 className="text-xl leading-tight font-bold text-slate-900">{panel.title}</h2>
          {panel.subtitle !== undefined && (
            <p className="text-sm text-slate-500">{panel.subtitle}</p>
          )}
        </div>
      </Card>
      {panel.sections.map((section, i) => (
        <Card key={i}>
          <CardHeading>{section.heading ?? t("evidence.company.about")}</CardHeading>
          <div className="divide-y divide-slate-100">
            {section.fields.map((field) => (
              <FlaggableRow key={field.id} field={field} {...flag}>
                {field.label !== undefined && (
                  <span className="block text-xs text-slate-500">{field.label}</span>
                )}
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[15px]",
                    looksLikeHost(field.value) && "font-semibold text-indigo-700",
                  )}
                >
                  {looksLikeHost(field.value) && (
                    <Globe className="size-3.5 shrink-0" aria-hidden />
                  )}
                  {field.value}
                </span>
              </FlaggableRow>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function RecordCard({ panel, ...flag }: FlagProps & { panel: PanelView }) {
  const t = useT();
  return (
    <div className="bg-slate-100 p-3">
      <section className="rounded-md border-4 border-double border-amber-300 bg-amber-50 p-3 shadow-sm">
        <div className="flex items-start gap-2.5 border-b border-amber-200 pb-2.5">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900"
          >
            <Landmark className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-widest text-amber-900 uppercase">
              {t("evidence.record.heading")}
            </p>
            <h2 className="text-base leading-snug font-semibold text-neutral-900">{panel.title}</h2>
            <p className="text-[11px] text-amber-800">{t("evidence.record.note")}</p>
          </div>
        </div>
        {panel.sections.map((section, i) => (
          <div key={i} className="mt-2 space-y-1">
            {section.heading !== undefined && (
              <h3 className="text-xs font-semibold text-amber-900 uppercase">{section.heading}</h3>
            )}
            {section.fields.map((field) => (
              <FlaggableRow key={field.id} field={field} {...flag}>
                {field.label !== undefined && (
                  <span className="block text-[11px] tracking-wide text-amber-800 uppercase">
                    {field.label}
                  </span>
                )}
                <span className="block font-mono text-sm text-neutral-900">{field.value}</span>
              </FlaggableRow>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Careers web page                                                    */
/* ------------------------------------------------------------------ */

function WebPageView({ panel, ...flag }: FlagProps & { panel: PanelView }) {
  const t = useT();
  return (
    <div className="bg-slate-100 p-3">
      <div className="overflow-hidden rounded-xl shadow ring-1 ring-slate-300">
        <div className="flex items-center gap-2 bg-slate-200 px-2.5 py-2">
          <div
            className="flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white px-3 text-sm text-slate-700"
            aria-label={`${t("evidence.browser.address")}: ${panel.title}`}
          >
            <Lock className="size-3.5 shrink-0 text-emerald-700" aria-hidden />
            <span className="sr-only">{t("evidence.browser.secure")}</span>
            <span className="truncate">{panel.title}</span>
          </div>
          <RotateCw className="size-4 shrink-0 text-slate-500" aria-hidden />
        </div>
        <div className="bg-white">
          {panel.subtitle !== undefined && (
            <div className="bg-indigo-800 px-4 py-5 text-white">
              <p className="text-lg leading-snug font-semibold">{panel.subtitle}</p>
            </div>
          )}
          <div className="space-y-3 p-3">
            {panel.sections.map((section, i) => (
              <section key={i} className="space-y-2">
                {section.heading !== undefined && (
                  <h3 className="px-1 text-base font-semibold text-slate-900">{section.heading}</h3>
                )}
                {section.fields.map((field) => (
                  <FlaggableRow
                    key={field.id}
                    field={field}
                    className="rounded-xl p-3 ring-1 ring-slate-200"
                    {...flag}
                  >
                    <div className="flex gap-3">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"
                      >
                        <Briefcase className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {field.label !== undefined && (
                          <p className="text-[15px] leading-snug font-semibold text-indigo-800">
                            {field.label}
                          </p>
                        )}
                        <p className="mt-0.5 text-sm text-slate-600">{field.value}</p>
                      </div>
                    </div>
                  </FlaggableRow>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
