"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { FlagToggle } from "../MailShell";
import { SimulationBar } from "../SimulationBar";
import type { FlagProps, PanelFieldView, PanelView } from "../types";

/**
 * A cloud-drive style PDF preview: dark chrome, a floating page and zoom pill, and A4 pages
 * drawn as a real letter (letterhead, date, paragraphs, terms table, signature, footer).
 * Our own design in the spirit of the real thing, never a copy. Every line stays flaggable.
 */

const ZOOMS = [1, 1.25, 1.5, 2] as const;

export function PdfViewer({
  panel,
  onClose,
  ...flag
}: FlagProps & { panel: PanelView; onClose: () => void }) {
  const t = useT();
  const total = panel.sections.length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLElement | null)[]>([]);
  const [page, setPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOMS[zoomIndex]!;

  // Track the page most in view, like the counter in a real viewer.
  useEffect(() => {
    const root = scrollRef.current;
    if (root === null) return;
    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target, e.intersectionRatio);
        let best = 0;
        let bestRatio = -1;
        pageRefs.current.forEach((el, i) => {
          const r = el === null ? 0 : (ratios.get(el) ?? 0);
          if (r > bestRatio) {
            best = i;
            bestRatio = r;
          }
        });
        setPage(best + 1);
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const el of pageRefs.current) if (el !== null) observer.observe(el);
    return () => observer.disconnect();
  }, [total, zoom]);

  const goTo = (n: number) => {
    const target = pageRefs.current[n - 1];
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-full w-full max-w-[420px] flex-col bg-[#2a2a2c] text-white">
      <SimulationBar />
      <header className="flex h-14 shrink-0 items-center gap-2 bg-[#1f1f21] pr-3 pl-1">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("evidence.close")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
        >
          <X className="size-5" />
        </button>
        <span
          aria-hidden
          className="flex h-6 shrink-0 items-center rounded-[4px] bg-[#e5463b] px-1.5 text-[10px] font-bold tracking-wide"
        >
          {t("evidence.pdf.badge")}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <h2 className="truncate text-[15px] font-medium">{panel.title}</h2>
          <p className="truncate text-[11px] text-neutral-400">
            {panel.subtitle ?? t("evidence.pdf.pages")(total)}
          </p>
        </div>
      </header>
      <p className="shrink-0 bg-[#1f1f21] px-4 pb-2 text-[11px] text-neutral-300">
        {t("evidence.hint")}
      </p>

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} className="h-full overflow-auto">
          {/* Floating toolbar */}
          <div className="sticky top-0 z-10 flex justify-center px-3 pt-2 pb-1">
            <div className="flex h-11 items-center gap-1 rounded-full bg-[#1f1f21]/95 px-3 text-sm text-neutral-100 shadow-lg ring-1 ring-white/10 backdrop-blur">
              <span className="text-neutral-300">{t("evidence.pdf.pageWord")}</span>
              <span
                aria-live="polite"
                className="mx-1 flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 ring-1 ring-neutral-500"
              >
                {page}
              </span>
              <span className="text-neutral-300">/ {total}</span>
              <span aria-hidden className="mx-2 h-5 w-px bg-neutral-600" />
              <button
                type="button"
                onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                disabled={zoomIndex === 0}
                aria-label={t("evidence.pdf.zoomOut")}
                className="flex size-9 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center tabular-nums">
                {zoom === 1 ? t("evidence.pdf.fit") : `${Math.round(zoom * 100)}%`}
              </span>
              <button
                type="button"
                onClick={() => setZoomIndex((i) => Math.min(ZOOMS.length - 1, i + 1))}
                disabled={zoomIndex === ZOOMS.length - 1}
                aria-label={t("evidence.pdf.zoomIn")}
                className="flex size-9 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div style={{ zoom }} className="pb-6">
            <DocumentPages
              panel={panel}
              pageRef={(i, el) => {
                pageRefs.current[i] = el;
              }}
              {...flag}
            />
          </div>
        </div>

        {total > 1 && (
          <>
            <PageArrow
              side="left"
              label={t("evidence.pdf.prev")}
              disabled={page <= 1}
              onClick={() => goTo(page - 1)}
            />
            <PageArrow
              side="right"
              label={t("evidence.pdf.next")}
              disabled={page >= total}
              onClick={() => goTo(page + 1)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function PageArrow({
  side,
  label,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  if (disabled) return null;
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute bottom-4 z-10 flex size-11 items-center justify-center rounded-full bg-[#1f1f21]/80 text-white shadow-lg ring-1 ring-white/20 backdrop-blur",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-6" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

/** The document's pages on a grey canvas. Also used inline, without the viewer chrome. */
export function DocumentPages({
  panel,
  pageRef,
  ...flag
}: FlagProps & { panel: PanelView; pageRef?: (index: number, el: HTMLElement | null) => void }) {
  const t = useT();
  const total = panel.sections.length;
  return (
    <div className="space-y-3 bg-[#2a2a2c] px-2 py-3">
      {panel.sections.map((section, i) => (
        <article
          key={i}
          ref={(el) => pageRef?.(i, el)}
          aria-label={t("evidence.pdf.page")(i + 1, total)}
          className="flex aspect-[1/1.414] scroll-mt-28 flex-col bg-white pt-8 pr-1 pb-4 pl-6 font-sans text-[11.5px] leading-[1.5] text-neutral-900 shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
        >
          {section.heading !== undefined && (
            <h3 className="mr-10 mb-2 text-[12.5px] font-bold text-neutral-900">
              {section.heading}
            </h3>
          )}
          <PageBody fields={section.fields} {...flag} />
          <footer className="mt-auto mr-10 flex items-end justify-between gap-3 pt-6 text-[9px] text-neutral-500">
            <span className="truncate">{panel.footer ?? ""}</span>
            <span className="shrink-0">{i + 1}</span>
          </footer>
        </article>
      ))}
    </div>
  );
}

/** Consecutive term rows are drawn as one table. */
function PageBody({ fields, ...flag }: FlagProps & { fields: PanelFieldView[] }) {
  const groups: PanelFieldView[][] = [];
  for (const field of fields) {
    const last = groups.at(-1);
    if (field.look === "term" && last?.[0]?.look === "term") last.push(field);
    else groups.push([field]);
  }
  return (
    <div className="space-y-1">
      {groups.map((group) =>
        group[0]!.look === "term" ? (
          <div key={group[0]!.id} className="py-1.5">
            {group.map((field, i) => (
              <Line key={field.id} field={field} centred {...flag}>
                <div
                  className={cn(
                    "grid grid-cols-[38%_1fr] border-x border-b border-neutral-400",
                    i === 0 && "border-t",
                  )}
                >
                  <span className="border-r border-neutral-400 bg-neutral-50 px-2 py-1 font-semibold">
                    {field.label}
                  </span>
                  <span className="px-2 py-1 whitespace-pre-line">{field.value}</span>
                </div>
              </Line>
            ))}
          </div>
        ) : (
          <Line key={group[0]!.id} field={group[0]!} {...flag}>
            <FieldText field={group[0]!} />
          </Line>
        ),
      )}
    </div>
  );
}

function ariaLabel(field: PanelFieldView): string {
  return field.label === undefined ? field.value : `${field.label}: ${field.value}`;
}

/** One line on the page with its flag in the right margin. Flagged lines get a red wash. */
function Line({
  field,
  children,
  centred = false,
  ...flag
}: FlagProps & { field: PanelFieldView; children: ReactNode; centred?: boolean }) {
  const flagged = flag.flaggedIds.includes(field.id);
  return (
    <div className="relative pr-10">
      <div
        className={cn(
          "-mx-1 rounded-sm px-1 transition-colors",
          flagged && "bg-red-100/80 ring-1 ring-red-400",
        )}
      >
        {children}
      </div>
      <FlagToggle
        id={field.id}
        label={ariaLabel(field)}
        className={cn("absolute right-0 my-0", centred ? "top-1/2 -translate-y-1/2" : "-top-2.5")}
        {...flag}
      />
    </div>
  );
}

function FieldText({ field }: { field: PanelFieldView }) {
  const lines = field.value.split("\n");
  switch (field.look) {
    case "letterhead": {
      const [name, ...rest] = lines;
      return (
        <div className="mb-3 flex items-center gap-2.5 border-b-2 border-neutral-800 pb-2.5">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-sm font-bold text-white"
          >
            {initials(name ?? "")}
          </span>
          <div className="min-w-0">
            <p className="text-[15px] leading-tight font-bold tracking-wide">{name}</p>
            {rest.map((line, i) => (
              <p key={i} className="text-[9.5px] leading-snug text-neutral-600">
                {line}
              </p>
            ))}
          </div>
        </div>
      );
    }
    case "title":
      return (
        <p className="my-2 text-center text-[13px] font-bold tracking-wide underline underline-offset-2">
          {field.value}
        </p>
      );
    case "meta":
      return (
        <p className="whitespace-pre-line text-neutral-800">
          {field.label !== undefined && `${field.label}: `}
          {field.value}
        </p>
      );
    case "clause":
      return (
        <p
          className={cn(
            "flex gap-2",
            field.finePrint ? "text-[9.5px] leading-snug text-neutral-700" : "",
          )}
        >
          {field.label !== undefined && (
            <span className="shrink-0 font-semibold">{field.label}</span>
          )}
          <span className="whitespace-pre-line">{field.value}</span>
        </p>
      );
    case "signature":
    case "signed": {
      const [closing, name, ...rest] = lines;
      return (
        <div className="mt-3">
          <p>{closing}</p>
          {field.look === "signed" && name !== undefined ? (
            <p
              aria-hidden
              className="mt-1 -rotate-3 font-[cursive] text-[22px] leading-tight text-blue-900 italic"
            >
              {name}
            </p>
          ) : (
            <div aria-hidden className="h-6" />
          )}
          {name !== undefined && <p className="font-semibold">{name}</p>}
          {rest.map((line, i) => (
            <p key={i} className="text-neutral-700">
              {line}
            </p>
          ))}
        </div>
      );
    }
    case "term":
    case "paragraph":
    case undefined:
      return (
        <p
          className={cn(
            "py-0.5 whitespace-pre-line",
            field.finePrint && "text-[9.5px] leading-snug text-neutral-600",
          )}
        >
          {field.label !== undefined && <span className="font-semibold">{field.label}: </span>}
          {field.value}
        </p>
      );
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
