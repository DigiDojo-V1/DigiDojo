import Link from "next/link";
import { AppChrome } from "@/components/layout/AppChrome";
import { TopBar } from "@/components/TopBar";
import { buttonVariants } from "@/components/ui/button";
import { T } from "@/i18n/T";
import { APP_HOME } from "@/lib/routes";

export default function NotFound() {
  return (
    <AppChrome>
      <main className="flex flex-1 flex-col p-5 md:rounded-lg md:bg-white md:py-16 md:ring-1 md:ring-black/10">
        <TopBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-5xl font-bold">404</p>
          <p className="text-muted-foreground">
            <T k="notFound.body" />
          </p>
          <Link href={APP_HOME} className={buttonVariants({ variant: "outline" })}>
            <T k="nav.backToHome" />
          </Link>
        </div>
      </main>
    </AppChrome>
  );
}
