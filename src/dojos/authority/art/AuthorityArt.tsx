import { useId } from "react";
import { ArtPaths, type DojoArtProps } from "@/components/home/art";
import { cn } from "@/lib/utils";
import {
  ARM,
  BACK,
  BROWS,
  CABLE,
  CAGE,
  CHAPPAL,
  EVIDENCE,
  EYES,
  GINGHAM,
  HER,
  PUPIL,
  SHIN,
  SHORTS,
  SWEAT_FILL,
  THIGH,
  TORSO,
  VIEW_BOX,
  WHITES,
} from "./scene";
import "./authority-art.css";

/** Card colour behind the scene: the background of the source illustration. */
export const AUTHORITY_BACKGROUND = "#f4e0dd";

const CAGE_INK = "#2a1b2e";
const CAGE_CAMERA = "#47344a";
const FRAME_INK = "#352639";
/** The viewfinder round the officer: outer box, corner arm length and stroke width. */
const FRAME = { x0: 1297, y0: 358, x1: 1819, y1: 932, arm: 115, width: 15.5 };
const REC = { cx: 1354.5, cy: 414.5, r: 14, fill: "#e43d44" };
/** The cage's shadow on the floor. */
const SHADOW = { cx: 2383, cy: 1428, rx: 341, ry: 26, fill: "#d2a29e" };
/** The top of the chai, where the steam starts. */
const CHAI = { x: 1416, y: 1322 };
const PUPIL_R = 6;
/** Her sweat drops and the tear, by the tip, where Gemini drew them. */
const DROPS = [
  { x: 2416.5, y: 579, w: 10, h: 19 },
  { x: 2413.5, y: 618, w: 8, h: 15 },
  { x: 2298, y: 615, w: 6.5, h: 11 },
];

/** The four viewfinder corners. With round caps they reach `arm` from the frame's outer edge. */
function frameCorners() {
  const h = FRAME.width / 2;
  const [l, t, r, b] = [FRAME.x0 + h, FRAME.y0 + h, FRAME.x1 - h, FRAME.y1 - h];
  const n = FRAME.arm - 2 * h;
  return [
    `M${l} ${t + n}V${t}H${l + n}`,
    `M${r - n} ${t}H${r}V${t + n}`,
    `M${l} ${b - n}V${b}H${l + n}`,
    `M${r - n} ${b}H${r}V${b - n}`,
  ];
}

/** A drop with its tip at (0, 0), hanging down: h tall, w wide. */
function dropPath(w: number, h: number) {
  const r = w / 2;
  const f = (v: number) => v.toFixed(1);
  return (
    `M0 0C${f(w * 0.12)} ${f(h * 0.28)} ${f(r)} ${f(h * 0.42)} ${f(r)} ${f(h - r)}` +
    `A${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(h - r)}` +
    `C${f(-r)} ${f(h * 0.42)} ${f(-w * 0.12)} ${f(h * 0.28)} 0 0Z`
  );
}

const STEAM = [
  `M${CHAI.x - 11} ${CHAI.y}c-7-10 7-20 0-30c-7-10 7-20 0-30`,
  `M${CHAI.x + 1} ${CHAI.y}c7-10-7-20 0-30c7-10-7-20 0-30`,
  `M${CHAI.x + 12} ${CHAI.y}c-6-9 6-18 0-27c-6-9 6-18 0-27`,
];

/**
 * A "digital arrest": a man in a khaki uniform, perched on a stool in front of a backdrop propped
 * on an easel and framed by a video call's viewfinder, jabs his finger and shakes the evidence at
 * a young woman trapped inside a phone. She trembles and sweats, her eyes darting between her phone, the
 * floor and him, while below the frame his leg swings and his chappal dangles beside his chai.
 * Shapes are traced from the illustration by `scripts/art/authority/build.py`; the cage, the
 * viewfinder, her pupils and sweat, the steam, the cage's shadow and the shorts' check are drawn
 * here. Sits at the bottom right of whatever box it gets.
 */
export function AuthorityArt({ paused = false, className }: DojoArtProps) {
  const uid = `au-${useId().replace(/[^\w-]/g, "")}`;
  const s = CAGE.stroke;

  return (
    <svg
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMaxYMax meet"
      overflow="visible"
      aria-hidden
      className={cn("au-scene", paused && "au-paused", className)}
    >
      <defs>
        {EYES.map((e, i) => (
          <clipPath key={i} id={`${uid}-eye${i}`}>
            <ellipse cx={e.cx} cy={e.cy} rx={e.rx - 0.5} ry={e.ry - 0.5} />
          </clipPath>
        ))}
        <clipPath id={`${uid}-shorts`}>
          <ArtPaths paths={SHORTS} />
        </clipPath>
        <pattern
          id={`${uid}-gingham`}
          patternUnits="userSpaceOnUse"
          x={8}
          y={15}
          width={20}
          height={20}
        >
          <rect width={20} height={20} fill="#fff" />
          <rect width={10} height={20} fill={GINGHAM.stripe} />
          <rect width={20} height={10} fill={GINGHAM.stripe} />
          <rect width={10} height={10} fill={GINGHAM.cross} />
        </pattern>
      </defs>

      <ellipse {...SHADOW} />
      <g>
        <ArtPaths paths={BACK} />
      </g>
      {/* The shorts' check, multiplied over their flat base. */}
      <g clipPath={`url(#${uid}-shorts)`} style={{ mixBlendMode: "multiply" }}>
        <rect x={1480} y={900} width={340} height={200} fill={`url(#${uid}-gingham)`} />
      </g>

      <g>
        {STEAM.map((d, i) => (
          <path
            key={i}
            className={`au-steam au-steam-${i + 1}`}
            d={d}
            fill="none"
            stroke="#fff"
            strokeWidth={5}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* The evidence shakes behind his torso's edge; the pointing arm prods in front. */}
      <g className="au-evidence">
        <ArtPaths paths={EVIDENCE} />
      </g>
      <g>
        <ArtPaths paths={TORSO} />
      </g>
      <g className="au-arm">
        <ArtPaths paths={ARM} />
      </g>

      {/* Below the frame: the shin swings from the knee, the chappal hangs off the toes. */}
      <g className="au-shin">
        <ArtPaths paths={SHIN} />
        <g className="au-chappal">
          <ArtPaths paths={CHAPPAL} />
        </g>
      </g>
      <g>
        <ArtPaths paths={THIGH} />
      </g>

      {/* Her upper body trembles; her pupils dart inside the whites and her sweat runs. */}
      <g className="au-her">
        <ArtPaths paths={HER} />
        <ArtPaths paths={CABLE} />
        <ArtPaths paths={WHITES} />
        <ArtPaths paths={BROWS} />
        {EYES.map((e, i) => (
          <g key={i} clipPath={`url(#${uid}-eye${i})`}>
            <circle
              className="au-pupil"
              cx={e.cx + PUPIL.dx}
              cy={e.cy + PUPIL.dy}
              r={PUPIL_R}
              fill={PUPIL.fill}
            />
          </g>
        ))}
        {DROPS.map((d, i) => (
          <g key={i} transform={`translate(${d.x} ${d.y})`}>
            <path className={`au-drop au-drop-${i + 1}`} d={dropPath(d.w, d.h)} fill={SWEAT_FILL} />
          </g>
        ))}
      </g>

      {/* The cage: a phone, with bars. */}
      <g fill={CAGE_INK}>
        <rect
          x={CAGE.x0 + s / 2}
          y={CAGE.y0 + s / 2}
          width={CAGE.x1 + 1 - CAGE.x0 - s}
          height={CAGE.y1 + 1 - CAGE.y0 - s}
          rx={CAGE.r - s / 2}
          fill="none"
          stroke={CAGE_INK}
          strokeWidth={s}
        />
        {CAGE.bars.map((x) => (
          <rect
            key={x}
            x={x}
            y={CAGE.y0 + s - 1}
            width={CAGE.bar_w}
            height={CAGE.y1 - CAGE.y0 - 2 * s + 3}
          />
        ))}
        <rect
          x={CAGE.notch.x0}
          y={CAGE.notch.y0}
          width={CAGE.notch.x1 - CAGE.notch.x0}
          height={CAGE.notch.y1 - CAGE.notch.y0}
          rx={(CAGE.notch.y1 - CAGE.notch.y0) / 2}
        />
        <circle {...CAGE.cam} fill={CAGE_CAMERA} />
      </g>

      {/* The video call: its viewfinder hunts for focus, its rec dot blinks. */}
      <g className="au-frame">
        {frameCorners().map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={FRAME_INK}
            strokeWidth={FRAME.width}
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle className="au-rec" {...REC} />
    </svg>
  );
}
