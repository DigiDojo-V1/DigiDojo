import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-neutral-200">
        {/* Phone-width column: full width on mobile, centred 420px on desktop. */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col bg-background shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
