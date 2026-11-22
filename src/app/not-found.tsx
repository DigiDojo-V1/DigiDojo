import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { T } from "@/i18n/T";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-bold">404</p>
      <p className="text-muted-foreground">
        <T k="notFound.body" />
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        <T k="nav.backToHome" />
      </Link>
    </main>
  );
}
