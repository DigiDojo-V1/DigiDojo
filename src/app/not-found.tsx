import Link from "next/link";
import { HomeShell } from "@/components/home/HomeShell";
import { BIG_BUTTON, ScreenCard } from "@/components/home/ScreenCard";
import { landingFontVars } from "@/components/landing/fonts";
import { DISPLAY } from "@/components/landing/styles";
import { T } from "@/i18n/T";
import { APP_HOME } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className={landingFontVars}>
      <HomeShell>
        <ScreenCard className="items-center text-center">
          <p className={`${DISPLAY} text-[96px] leading-none`}>404</p>
          <p className="mt-3 text-lg text-black/70">
            <T k="notFound.body" />
          </p>
          <Link href={APP_HOME} className={`${BIG_BUTTON} mt-8`}>
            <T k="nav.backToHome" />
          </Link>
        </ScreenCard>
      </HomeShell>
    </div>
  );
}
