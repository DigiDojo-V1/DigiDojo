import { useId } from "react";
import { ArtPaths, type DojoArtProps } from "@/components/home/art";
import { cn } from "@/lib/utils";
import { ARM, BODY, BROWS, HEAD, LEGS, PUPILS, VIEW_BOX, WHITES } from "./scene";
import "./dream-job-art.css";

/** Card colour behind the scene: the background of the source illustration. */
export const DREAM_JOB_BACKGROUND = "#d6e7ee";

/**
 * A young woman hugging a giant, smirking offer letter while its other arm reaches round her back
 * and lifts the card out of her bag. Shapes are traced from the illustration by
 * `scripts/art/dream-job/build.py`; this file only arranges and animates them. Sits at the bottom
 * right of whatever box it gets.
 */
export function DreamJobArt({ paused = false, className }: DojoArtProps) {
  const uid = `dj-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <svg
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMaxYMax meet"
      overflow="visible"
      aria-hidden
      className={cn("dj-scene", paused && "dj-paused", className)}
    >
      <defs>
        {/* The glove and card, drawn again in front of her bag (the arm itself is behind her). */}
        <clipPath id={`${uid}-hand`}>
          <rect x={2298} y={545} width={300} height={330} />
        </clipPath>
        {WHITES.map((paths, i) => (
          <clipPath key={i} id={`${uid}-eye${i}`}>
            <ArtPaths paths={paths} />
          </clipPath>
        ))}
      </defs>

      <g>
        <ArtPaths paths={LEGS} />
      </g>

      {/* Everything above the legs rocks as one hug. */}
      <g className="dj-hug">
        <g className="dj-arm">
          <ArtPaths paths={ARM} />
        </g>
        <g>
          <ArtPaths paths={BODY} />
        </g>
        {WHITES.map((paths, i) => (
          <g key={i} className="dj-eye">
            <ArtPaths paths={paths} />
            <g clipPath={`url(#${uid}-eye${i})`}>
              <g className="dj-pupil">
                <ArtPaths paths={PUPILS[i] ?? []} />
              </g>
            </g>
          </g>
        ))}
        <g className="dj-brows">
          <ArtPaths paths={BROWS} />
        </g>
        <g className="dj-head">
          <ArtPaths paths={HEAD} />
        </g>
        <g clipPath={`url(#${uid}-hand)`}>
          <g className="dj-arm">
            <ArtPaths paths={ARM} />
          </g>
        </g>
      </g>
    </svg>
  );
}
