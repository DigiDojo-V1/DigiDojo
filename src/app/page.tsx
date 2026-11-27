import { T } from "@/i18n/T";

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-5">
      <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
        <T k="landing.title" />
      </h1>
    </main>
  );
}
