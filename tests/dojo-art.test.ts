import { describe, expect, it } from "vitest";
import { DOJO_ART } from "@/dojos/art";
import * as dreamJob from "@/dojos/dream-job/art/scene";
import { BAG, COINS, LEGS, LURE, SPARKS, UPPER } from "@/dojos/easy-money/art/scene";
import { DOJOS } from "@/dojos/registry";
import * as trustMeBro from "@/dojos/trust-me-bro/art/scene";

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

  it("has every Dream Job layer traced", () => {
    const { ARM, BODY, BROWS, HEAD, LEGS, PUPILS, WHITES } = dreamJob;
    for (const layer of [LEGS, ARM, BODY, HEAD, BROWS]) expect(layer.length).toBeGreaterThan(0);
    // One white and one pupil per eye, left then right.
    expect(WHITES).toHaveLength(2);
    expect(PUPILS).toHaveLength(2);
    for (const group of [...WHITES, ...PUPILS]) expect(group.length).toBeGreaterThan(0);
  });

  it("has every Trust Me Bro layer traced", () => {
    const { ARM, BACK, CUTOUT, FIST, FLOOR, HEAD, PUPILS, THUMB, WHITES } = trustMeBro;
    for (const layer of [FLOOR, BACK, CUTOUT, FIST, HEAD, ARM, THUMB]) {
      expect(layer.length).toBeGreaterThan(0);
    }
    // One white and one pupil per eye, left then right.
    expect(WHITES).toHaveLength(2);
    expect(PUPILS).toHaveLength(2);
    for (const group of [...WHITES, ...PUPILS]) expect(group.length).toBeGreaterThan(0);
    const startX = (paths: (typeof WHITES)[number]) =>
      Number(/^M(\d+)/.exec(paths[0]?.[0] ?? "")?.[1]);
    expect(startX(WHITES[0]!)).toBeLessThan(startX(WHITES[1]!));
    expect(startX(PUPILS[0]!)).toBeLessThan(startX(PUPILS[1]!));
  });

  it("writes well-formed shapes that start inside the source image", () => {
    const layers = [
      ...[BAG, UPPER, LEGS, LURE, ...COINS, ...SPARKS],
      ...[dreamJob.LEGS, dreamJob.ARM, dreamJob.BODY, dreamJob.HEAD, dreamJob.BROWS],
      ...[...dreamJob.WHITES, ...dreamJob.PUPILS],
      ...[trustMeBro.FLOOR, trustMeBro.BACK, trustMeBro.CUTOUT, trustMeBro.FIST],
      ...[trustMeBro.HEAD, trustMeBro.ARM, trustMeBro.THUMB],
      ...[...trustMeBro.WHITES, ...trustMeBro.PUPILS],
    ];
    for (const [d, fill] of layers.flat()) {
      expect(d).toMatch(/^M\d+ \d+/);
      expect(fill).toMatch(/^#[0-9a-f]{6}$/);
      const [, x, y] = /^M(\d+) (\d+)/.exec(d) ?? [];
      expect(Number(x)).toBeLessThanOrEqual(2752);
      expect(Number(y)).toBeLessThanOrEqual(1536);
    }
  });
});
