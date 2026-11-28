import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChromeDataProvider } from "@/components/layout/chrome-data";
import { dojoSummaries } from "@/components/layout/dojo-summaries";
import { HtmlLang } from "@/i18n/HtmlLang";
import { DEFAULT_LOCALE, HTML_LANG } from "@/i18n/locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DigiDojo: Scam Season",
  description: "Practise against real scams inside fake versions of the apps they happen in.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={HTML_LANG[DEFAULT_LOCALE]}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-neutral-200">
        <HtmlLang />
        {/* Each screen picks its own frame: HomeShell for DigiDojo's pages, PlayerFrame for the fake apps. */}
        <ChromeDataProvider dojos={dojoSummaries()}>{children}</ChromeDataProvider>
      </body>
    </html>
  );
}
