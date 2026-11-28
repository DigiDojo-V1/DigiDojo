import { useId } from "react";
import { ArtPaths, type DojoArtProps } from "@/components/home/art";
import { cn } from "@/lib/utils";
import { BAG, COINS, LEGS, LURE, SPARKS, UPPER, VIEW_BOX } from "./scene";
import "./easy-money-art.css";

/** Card colour behind the scene: the background of the source illustration. */
export const EASY_MONEY_BACKGROUND = "#fbead1";

/**
 * A ₹ note dangling on a fishing hook, and a young player on a beanbag reaching for it. Shapes are
 * traced from the illustration by `scripts/art/easy-money/build.py`; this file only arranges and
 * animates them. Sits at the bottom right of whatever box it gets; the fishing line runs up past
 * the top of the box, so the box should clip (`overflow: hidden`) where the line should stop.
 */
export function EasyMoneyArt({ paused = false, className }: DojoArtProps) {
  const glowId = `em-glow-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <svg
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMaxYMax meet"
      overflow="visible"
      aria-hidden
      className={cn("em-scene", paused && "em-paused", className)}
    >
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#ffd66b" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ffd66b" stopOpacity={0} />
        </radialGradient>
      </defs>

      <circle className="em-glow" cx={1450} cy={480} r={260} fill={`url(#${glowId})`} />

      <g>
        <ArtPaths paths={BAG} />
      </g>
      <g className="em-upper">
        <ArtPaths paths={UPPER} />
      </g>
      <g>
        <ArtPaths paths={LEGS} />
      </g>

      {/* The line above the image, so it always reaches the top of the box. */}
      <path d="M1395-6000V4" stroke="#423237" strokeWidth={5} />

      <g className="em-lure">
        <ArtPaths paths={LURE} />
        <g transform="translate(1450 498) rotate(-12)">
          <circle r={47} fill="#357443" />
          <path
            d="M-21-28H23M-21-11H23M-7-28C17-28 17 8-9 8H-19L13 36"
            fill="none"
            stroke="#b4dca4"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      <g>
        {COINS.map((paths, i) => (
          <g key={i} className="em-coin">
            <ArtPaths paths={paths} />
          </g>
        ))}
      </g>
      <g>
        {SPARKS.map((paths, i) => (
          <g key={i} className="em-spark">
            <ArtPaths paths={paths} />
          </g>
        ))}
      </g>
    </svg>
  );
}
