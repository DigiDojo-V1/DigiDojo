"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Minus,
  Plus,
  Printer,
  X,
} from "lucide-react";
import { useT } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { FileTypeIcon, GMAIL_FONT } from "../gmail/brand";
import { FlagToggle } from "../MailShell";
import { SimulationBar } from "../SimulationBar";
import type { FlagProps, PanelFieldView, PanelView } from "../types";

/**
 * The Google Drive PDF preview that opens over Gmail: a dark overlay, the file name with a
 * File / View / Tools / Help menu, a page and zoom toolbar, page thumbnails on the left, and
 * A4 pages drawn as a real letter (letterhead, date, paragraphs, terms table, signature,
 * footer). Used with permission (see CLAUDE.md). Every line on the page stays flaggable; the
 * menu and the download, print and full-screen buttons are decorative.
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

  const toolButton =
    "flex size-10 shrink-0 items-center justify-center rounded-full text-[#e3e3e3] hover:bg-white/10 disabled:opacity-40";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-[#1f1f1f] text-white lg:bg-transparent",
        GMAIL_FONT,
      )}
    >
      <SimulationBar />
      <header className="flex h-16 shrink-0 items-center gap-3 pr-3 pl-1 lg:h-[76px] lg:pr-4 lg:pl-2">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("evidence.close")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
        >
          <X className="size-6" />
        </button>
        <FileTypeIcon kind="pdf" className="size-7" />
        <div className="min-w-0 flex-1 leading-tight">
          <h2 className="truncate text-lg">{panel.title}</h2>
          <p aria-hidden className="mt-1 hidden gap-5 text-sm text-[#e3e3e3] lg:flex">
            <span>{t("evidence.pdf.menu.file")}</span>
            <span>{t("evidence.pdf.menu.view")}</span>
            <span>{t("evidence.pdf.menu.tools")}</span>
            <span>{t("evidence.pdf.menu.help")}</span>
          </p>
          <p className="truncate text-xs text-[#c4c7c5] lg:hidden">
            {panel.subtitle ?? t("evidence.pdf.pages")(total)}
          </p>
        </div>
        <span
          aria-hidden
          className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-[#8e918f] pr-3 pl-5 text-sm font-medium lg:flex"
        >
          {t("evidence.pdf.editWith")} <ChevronDown className="size-4" />
        </span>
      </header>
      <p className="shrink-0 px-4 pb-2 text-[11px] text-[#c4c7c5]">{t("evidence.hint")}</p>

      {/* Page and zoom toolbar */}
      <div className="mx-2 flex h-12 shrink-0 items-center gap-1 rounded-xl bg-[#333537] px-3 text-sm text-[#e3e3e3] lg:mx-3 lg:h-14 lg:rounded-2xl lg:px-5">
        <span>{t("evidence.pdf.pageWord")}</span>
        <span
          aria-live="polite"
          className="mx-1.5 flex h-7 min-w-7 items-center justify-center rounded-md bg-[#1f1f1f] px-1.5 ring-1 ring-[#8e918f]"
        >
          {page}
        </span>
        <span>/ {total}</span>
        <span aria-hidden className="mx-3 h-6 w-px bg-[#5f6368]" />
        <span aria-hidden className="hidden items-center sm:flex">
          <span className={toolButton} title={t("evidence.pdf.download")}>
            <Download className="size-5" />
          </span>
          <span className={toolButton} title={t("evidence.pdf.print")}>
            <Printer className="size-5" />
          </span>
          <span className={toolButton} title={t("evidence.pdf.fullscreen")}>
            <Maximize className="size-5" />
          </span>
          <span className="mx-3 h-6 w-px bg-[#5f6368]" />
        </span>
        <button
          type="button"
          onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
          disabled={zoomIndex === 0}
          aria-label={t("evidence.pdf.zoomOut")}
          className={toolButton}
        >
          <Minus className="size-5" />
        </button>
        <span className="flex w-16 items-center justify-center gap-0.5 tabular-nums">
          {Math.round(zoom * 100)}% <ChevronDown className="size-4" aria-hidden />
        </span>
        <button
          type="button"
          onClick={() => setZoomIndex((i) => Math.min(ZOOMS.length - 1, i + 1))}
          disabled={zoomIndex === ZOOMS.length - 1}
          aria-label={t("evidence.pdf.zoomIn")}
          className={toolButton}
        >
          <Plus className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Page thumbnails (desktop) */}
        <div className="hidden w-[132px] shrink-0 flex-col gap-4 overflow-y-auto py-4 pr-3 pl-2 lg:flex">
          {panel.sections.map((section, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i + 1)}
              aria-label={t("evidence.pdf.page")(i + 1, total)}
              className="flex items-start gap-2 text-xs text-[#e3e3e3]"
            >
              <span className="w-3 text-right">{i + 1}</span>
              <span
                className={cn(
                  "flex-1 rounded-md p-1",
                  page === i + 1 ? "ring-2 ring-[#a8c7fa]" : "ring-1 ring-transparent",
                )}
              >
                <Thumbnail heading={section.heading !== undefined} />
              </span>
            </button>
          ))}
        </div>

        <div ref={scrollRef} className="min-w-0 flex-1 overflow-auto">
          <div style={{ zoom }} className="mx-auto max-w-[840px] pb-6">
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

/** A page thumbnail: a small white sheet with a letterhead and lines. */
function Thumbnail({ heading }: { heading: boolean }) {
  return (
    <span aria-hidden className="block aspect-[1/1.414] bg-white px-2 pt-2.5">
      {heading && <span className="mb-1.5 block h-1 w-8 bg-[#3c4043]" />}
      {[90, 70, 84, 60, 88, 76, 66, 90, 54, 80].map((w, i) => (
        <span key={i} className="mt-1 block h-[2px] bg-[#c4c7c5]" style={{ width: `${w}%` }} />
      ))}
    </span>
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
        "absolute bottom-4 z-10 flex size-11 items-center justify-center rounded-full bg-[#333537]/90 text-white shadow-lg ring-1 ring-white/20 backdrop-blur",
        side === "left" ? "left-3 lg:left-[144px]" : "right-3",
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
    <div className="space-y-3 px-2 py-3 lg:space-y-4 lg:px-6 lg:py-4">
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
