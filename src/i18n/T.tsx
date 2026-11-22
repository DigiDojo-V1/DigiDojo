"use client";

import type { LocalizedText } from "@/engine/schema";
import { useT, useText } from "./hooks";
import type { UiDict, UiKey } from "./ui";

type ArgsOf<K extends UiKey> = UiDict[K] extends (...args: infer A) => string ? A : never;

/**
 * A UI string as a tiny client component, so server components (pages) can show text in the
 * player's language without becoming client components themselves.
 * `<T k="dojo.empty" />`, or `<T k="home.scenarioCount" args={[3]} />` for strings with arguments.
 */
export function T<K extends UiKey>({ k, args }: { k: K; args?: ArgsOf<K> }) {
  const value: unknown = useT()(k);
  if (typeof value === "function") {
    return <>{(value as (...a: readonly unknown[]) => string)(...(args ?? []))}</>;
  }
  return <>{value as string}</>;
}

/** Scenario or dojo text as a tiny client component, for server components. `<L text={dojo.name} />` */
export function L({ text }: { text: LocalizedText }) {
  return <>{useText()(text)}</>;
}
