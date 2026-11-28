import type { ComponentType } from "react";
import type { DojoArtProps } from "@/components/home/art";
import type { DojoId } from "@/engine/schema";
import { EASY_MONEY_BACKGROUND, EasyMoneyArt } from "./easy-money/art/EasyMoneyArt";

export interface DojoArt {
  /** The animated scene. */
  Scene: ComponentType<DojoArtProps>;
  /** The slide's background colour, matched to the scene. */
  background: string;
}

/**
 * The home carousel's illustration for each dojo, by dojo id. A dojo without an entry gets the
 * plain card. Lead edits only, like the registry.
 */
export const DOJO_ART: Readonly<Partial<Record<DojoId, DojoArt>>> = {
  "easy-money": { Scene: EasyMoneyArt, background: EASY_MONEY_BACKGROUND },
};

/** The art for a dojo id, if it has any. */
export function dojoArt(dojoId: string): DojoArt | undefined {
  return (DOJO_ART as Readonly<Partial<Record<string, DojoArt>>>)[dojoId];
}
