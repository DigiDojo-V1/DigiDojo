export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Placement {
  top: number;
  left: number;
  side: "below" | "above";
}

/**
 * Where to put a popover of `size` next to `anchor`, inside a `bounds` area (all in viewport
 * pixels). Prefers below the anchor, flips above when there's more room there, and is always
 * clamped inside the bounds with a `margin`.
 */
export function placePopover(
  anchor: Box,
  size: { width: number; height: number },
  bounds: Box,
  gap = 8,
  margin = 12,
): Placement {
  const minTop = bounds.top + margin;
  const maxTop = bounds.top + bounds.height - margin - size.height;
  const spaceBelow = bounds.top + bounds.height - (anchor.top + anchor.height) - gap - margin;
  const spaceAbove = anchor.top - bounds.top - gap - margin;

  const side = spaceBelow >= size.height || spaceBelow >= spaceAbove ? "below" : "above";
  const rawTop =
    side === "below" ? anchor.top + anchor.height + gap : anchor.top - gap - size.height;
  const top = Math.max(minTop, Math.min(rawTop, maxTop));

  const minLeft = bounds.left + margin;
  const maxLeft = bounds.left + bounds.width - margin - size.width;
  const left = Math.max(minLeft, Math.min(anchor.left, maxLeft));

  return { top, left, side };
}
