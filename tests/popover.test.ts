import { describe, expect, it } from "vitest";
import { placePopover } from "@/lib/popover";

const bounds = { top: 0, left: 0, width: 1000, height: 800 };
const size = { width: 360, height: 300 };

describe("placePopover", () => {
  it("goes below the anchor when there is room", () => {
    const p = placePopover({ top: 100, left: 200, width: 120, height: 20 }, size, bounds);
    expect(p).toEqual({ top: 128, left: 200, side: "below" });
  });

  it("flips above when the anchor is near the bottom", () => {
    const p = placePopover({ top: 700, left: 200, width: 120, height: 20 }, size, bounds);
    expect(p.side).toBe("above");
    expect(p.top).toBe(700 - 8 - 300);
  });

  it("stays inside the bounds horizontally", () => {
    const p = placePopover({ top: 100, left: 900, width: 80, height: 20 }, size, bounds);
    expect(p.left).toBe(1000 - 12 - 360);
  });

  it("clamps to the top margin when neither side fits", () => {
    const tall = { width: 360, height: 780 };
    const p = placePopover({ top: 300, left: 10, width: 80, height: 20 }, tall, bounds);
    expect(p.top).toBe(12);
    expect(p.left).toBe(12);
  });
});
