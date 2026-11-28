import { describe, expect, it } from "vitest";
import { DOJO_ART } from "@/dojos/art";
import { BAG, COINS, LEGS, LURE, SPARKS, UPPER } from "@/dojos/easy-money/art/scene";
import { DOJOS } from "@/dojos/registry";

describe("dojo art", () => {
  it("only lists dojos that are on the home path", () => {
    const ids = new Set<string>(DOJOS.map((dojo) => dojo.id));
    for (const id of Object.keys(DOJO_ART)) expect(ids.has(id), id).toBe(true);
  });

  it("gives every scene a hex background", () => {
    for (const art of Object.values(DOJO_ART)) expect(art?.background).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("has every Easy Money layer traced", () => {
    for (const layer of [BAG, UPPER, LEGS, LURE]) expect(layer.length).toBeGreaterThan(0);
    expect(COINS).toHaveLength(4);
    expect(SPARKS).toHaveLength(5);
    for (const group of [...COINS, ...SPARKS]) expect(group.length).toBeGreaterThan(0);
  });
});
