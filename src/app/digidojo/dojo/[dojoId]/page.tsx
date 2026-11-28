import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DojoView } from "@/components/dojo/DojoView";
import { HomeShell } from "@/components/home/HomeShell";
import { landingFontVars } from "@/components/landing/fonts";
import { DOJOS, getDojo } from "@/dojos/registry";
import { scenarioKey } from "@/engine/keys";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import { scenarioHref } from "@/lib/routes";

/** Only ids in the registry exist. Anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return DOJOS.map((dojo) => ({ dojoId: dojo.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/digidojo/dojo/[dojoId]">): Promise<Metadata> {
  const { dojoId } = await params;
  const dojo = getDojo(dojoId);
  const name = dojo === undefined ? "Dojo" : resolveText(dojo.name, DEFAULT_LOCALE);
  return { title: `${name} · DigiDojo` };
}

export default async function DojoPage({ params }: PageProps<"/digidojo/dojo/[dojoId]">) {
  const { dojoId } = await params;
  const dojo = getDojo(dojoId);
  if (dojo === undefined) notFound();

  return (
    <div className={landingFontVars}>
      <HomeShell>
        <DojoView
          order={dojo.order}
          name={dojo.name}
          tagline={dojo.tagline}
          takeaways={dojo.takeaways}
          scenarios={dojo.scenarios.map((s) => ({
            key: scenarioKey(dojo.id, s.id),
            href: scenarioHref(dojo.id, s.id),
            title: s.title,
            summary: s.summary,
            image: s.image,
          }))}
        />
      </HomeShell>
    </div>
  );
}
