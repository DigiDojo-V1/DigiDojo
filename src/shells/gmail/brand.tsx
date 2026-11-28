import { Google_Sans, Roboto } from "next/font/google";
import { cn } from "@/lib/utils";

/* Gmail's logo, typefaces and attachment icons. Decorative: callers hide them from screen
 * readers. Used with permission (see CLAUDE.md). */

const googleSans = Google_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-gmail-ui",
});
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-gmail-roboto",
});

/**
 * Put on a shell's root: defines the font variables and sets Gmail's UI font. Message bodies
 * use `GMAIL_BODY_FONT` (Arial, as Gmail renders plain mail).
 */
export const GMAIL_FONT = cn(
  googleSans.variable,
  roboto.variable,
  "font-[family-name:var(--font-gmail-ui),var(--font-gmail-roboto),Roboto,Arial,sans-serif]",
);
export const GMAIL_BODY_FONT = "font-[family-name:Arial,Helvetica,sans-serif]";

/** The 2020 "M" logo, in its five colours. */
export function GmailLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="52 42 88 66" className={cn("shrink-0", className)} aria-hidden>
      <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
      <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
      <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
      <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
      <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
    </svg>
  );
}

/** The logo with the "Gmail" wordmark, as in the web app's top-left corner. */
export function GmailLockup({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={cn("flex items-center gap-2", className)}>
      <GmailLogo className="h-6 w-8" />
      <span className="text-[22px] leading-none text-[#444746]">{name}</span>
    </span>
  );
}

/**
 * Gmail shows this year's dates as "21 Nov". Data dates read "21 Nov 2026, 10:06"; anything in
 * another shape is shown as it is.
 */
export function shortMailDate(date: string): string {
  const match = /^(\d{1,2} \S+) \d{4}\b/.exec(date);
  return match?.[1] ?? date;
}

/* ------------------------------------------------------------------ */
/* Attachment file types                                               */
/* ------------------------------------------------------------------ */

export type FileKind = "pdf" | "image" | "archive" | "apk" | "file";

/** The type as the name shows it (cut-short names count by what's visible, as in a real app). */
export function fileKind(name: string): FileKind {
  const ext =
    name
      .toLowerCase()
      .replace(/[.…]+$/, "")
      .split(".")
      .pop() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "apk") return "apk";
  if (["zip", "rar", "7z"].includes(ext)) return "archive";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  return "file";
}

/** Each type's colour: the icon square and the folded corner of an attachment card. */
export const FILE_COLOUR: Record<FileKind, string> = {
  pdf: "#ea4335",
  image: "#ea4335",
  archive: "#5f6368",
  apk: "#34a853",
  file: "#4285f4",
};

/** Gmail's small square file-type icon ("PDF" in white on red, and so on). */
export function FileTypeIcon({ kind, className }: { kind: FileKind; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-4 shrink-0", className)} aria-hidden>
      <rect width="16" height="16" rx="2" fill={FILE_COLOUR[kind]} />
      {kind === "pdf" ? (
        <text
          x="8"
          y="10.6"
          textAnchor="middle"
          fill="#fff"
          fontSize="6.4"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
        >
          PDF
        </text>
      ) : kind === "image" ? (
        <path fill="#fff" d="M3.5 12 6 8.7l1.8 2.2 2.5-3.3 2.2 4.4z" />
      ) : kind === "archive" ? (
        <path
          fill="#fff"
          d="M7 3h1v1H7zm1 1h1v1H8zM7 5h1v1H7zm1 1h1v1H8zM7 7h1v1H7zm0 1.5h2V12H7z"
        />
      ) : kind === "apk" ? (
        <path
          fill="#fff"
          d="M4.5 10.5a3.5 3.5 0 0 1 7 0zm2-1.6a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m3 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M5.3 6.2l.8 1.1.4-.3-.8-1.1zm5.4 0-.8 1.1-.4-.3.8-1.1z"
        />
      ) : (
        <path fill="#fff" d="M5 3.5h4l2.5 2.5v6.5H5zm4 .5v2.5h2.5" />
      )}
    </svg>
  );
}

/** Drive's "Add to Drive" glyph: the triangle with a plus. Stroke is currentColor. */
export function AddToDriveIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8.4 3.5h6.8l6 10.4-2 3.4M8.4 3.5 2.6 13.6l3.3 5.8h7.6M8.4 3.5l6.4 10.4H5.9" />
      <path d="M19 15.5v6m-3-3h6" strokeLinecap="round" />
    </svg>
  );
}
