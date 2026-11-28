import { useId } from "react";
import { ArtPaths, type DojoArtProps } from "@/components/home/art";
import { cn } from "@/lib/utils";
import { ARM, BACK, CUTOUT, FIST, FLOOR, HEAD, PUPILS, THUMB, VIEW_BOX, WHITES } from "./scene";
import "./trust-me-bro-art.css";

/** Card colour behind the scene: the background of the source illustration. */
export const TRUST_ME_BRO_BACKGROUND = "#e6ddf2";

/** The string from the scammer's can, through the hole in the wall, to the user's can (at rest). */
const STRING = "M1827 643Q1875 632 1923 610Q1968 599 2013 580";
const STRING_COLOUR = "#4b3b56";
/** The pay button on the user's phone. */
const PAY = { cx: 2257, cy: 843, r: 17 };

/**
 * A phone call through a wall: in the shade, a hooded scammer talks into a tin can behind a
 * cut-out of a friend's grinning face; the string carries his voice through the wall to a young
 * man who laughs along, thumb hovering over pay. Shapes are traced from the illustration by
 * `scripts/art/trust-me-bro/build.py`; the string, its blips and the pay button are drawn here.
 * Sits at the bottom right of whatever box it gets.
 */
export function TrustMeBroArt({ paused = false, className }: DojoArtProps) {
  const uid = `tmb-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <svg
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMaxYMax meet"
      overflow="visible"
      aria-hidden
      className={cn("tmb-scene", paused && "tmb-paused", className)}
    >
      <defs>
        {WHITES.map((paths, i) => (
          <clipPath key={i} id={`${uid}-eye${i}`}>
            <ArtPaths paths={paths} />
          </clipPath>
        ))}
      </defs>

      <g>
        <ArtPaths paths={FLOOR} />
        <ArtPaths paths={BACK} />
      </g>

      {/* The scammer's eyes: pupils dart inside the whites. */}
      {WHITES.map((paths, i) => (
        <g key={i}>
          <ArtPaths paths={paths} />
          <g clipPath={`url(#${uid}-eye${i})`}>
            <g className="tmb-pupil">
              <ArtPaths paths={PUPILS[i] ?? []} />
            </g>
          </g>
        </g>
      ))}

      {/* The call: the string, and blips (a dark bead with a light core) running down it. */}
      <path
        className="tmb-line"
        d={STRING}
        fill="none"
        stroke={STRING_COLOUR}
        strokeWidth={7}
        strokeLinecap="round"
      />
      {[1, 2, 3].map((n) => (
        <g key={n} className={`tmb-blip-${n}`}>
          {[
            { stroke: STRING_COLOUR, width: 17 },
            { stroke: "#fff4d6", width: 10 },
          ].map(({ stroke, width }) => (
            <path
              key={stroke}
              className="tmb-blip"
              d={STRING}
              pathLength={100}
              fill="none"
              stroke={stroke}
              strokeWidth={width}
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}

      <g className="tmb-puppet">
        <ArtPaths paths={CUTOUT} />
      </g>
      <g>
        <ArtPaths paths={FIST} />
      </g>

      <g className="tmb-head">
        <ArtPaths paths={HEAD} />
      </g>
      <g>
        <ArtPaths paths={ARM} />
      </g>

      {/* Pay: the ring goes out when the thumb taps. */}
      <circle className="tmb-ring" {...PAY} fill="none" stroke="#5fd08a" strokeWidth={4} />
      <g className="tmb-pay">
        <circle {...PAY} fill="#3cb96a" />
        <circle {...PAY} r={PAY.r - 1.5} fill="none" stroke="#2c9654" strokeWidth={3} />
      </g>
      <g className="tmb-thumb">
        <ArtPaths paths={THUMB} />
      </g>
    </svg>
  );
}
