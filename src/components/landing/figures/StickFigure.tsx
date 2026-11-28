"use client";

import { motion, type Transition } from "motion/react";

export type Pose = "run" | "cheer" | "hang";

const LOOP: Transition = { repeat: Infinity, ease: "easeInOut" };

/**
 * A little stick figure wearing a dojo headband. Limbs are drawn hanging straight down and
 * rotate about their top end, so each pose is just a set of angles.
 */
export function StickFigure({ pose, className }: { pose: Pose; className?: string }) {
  const run = pose === "run";
  const cheer = pose === "cheer";
  const cycle = { ...LOOP, duration: run ? 0.44 : cheer ? 0.6 : 1.6 };

  const arms = run
    ? { a: [-55, 45, -55], b: [45, -55, 45] }
    : cheer
      ? { a: [150, 165, 150], b: [-150, -165, -150] }
      : { a: [158, 162, 158], b: [-158, -162, -158] };
  const thighs = run
    ? { a: [-45, 35, -45], b: [35, -45, 35] }
    : cheer
      ? { a: [-22, -30, -22], b: [22, 30, 22] }
      : { a: [-8, 6, -8], b: [8, -6, 8] };
  const shins = run
    ? { a: [10, 75, 10], b: [75, 10, 75] }
    : cheer
      ? { a: [8, 14, 8], b: [-8, -14, -8] }
      : { a: [4, 12, 4], b: [12, 4, 12] };

  const limb = { originX: 0.5, originY: 0 } as const;

  return (
    <motion.svg
      viewBox="0 0 40 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      aria-hidden
      animate={
        run
          ? { y: [0, -2, 0], rotate: 8 }
          : cheer
            ? { y: [0, -14, 0], rotate: 0 }
            : { y: 0, rotate: [-3, 3, -3] }
      }
      transition={{ ...cycle, duration: run ? 0.22 : cycle.duration }}
    >
      {/* Head and headband: the tails stream backwards while running. */}
      <circle cx={20} cy={9} r={6} fill="currentColor" stroke="none" />
      <path d="M13.6 7.6h12.8" stroke="#ec7230" strokeWidth={2.4} />
      <motion.path
        d="M14 7.8c-4 0-6 2-9 1.2M14 8.2c-3 1.6-5 3.6-8 3.6"
        stroke="#ec7230"
        strokeWidth={1.8}
        animate={{ rotate: run ? [-6, 6, -6] : [-2, 2, -2] }}
        style={{ originX: 1, originY: 0.2 }}
        transition={{ ...LOOP, duration: 0.3 }}
      />
      {/* Body */}
      <path d="M20 16v20" />
      {/* Arms */}
      <motion.path d="M20 19v12" style={limb} animate={{ rotate: arms.a }} transition={cycle} />
      <motion.path d="M20 19v12" style={limb} animate={{ rotate: arms.b }} transition={cycle} />
      {/* Legs: thigh rotates at the hip, shin at the knee. */}
      <motion.g style={limb} animate={{ rotate: thighs.a }} transition={cycle}>
        <path d="M20 36v11" />
        <motion.path d="M20 47v11" style={limb} animate={{ rotate: shins.a }} transition={cycle} />
      </motion.g>
      <motion.g style={limb} animate={{ rotate: thighs.b }} transition={cycle}>
        <path d="M20 36v11" />
        <motion.path d="M20 47v11" style={limb} animate={{ rotate: shins.b }} transition={cycle} />
      </motion.g>
    </motion.svg>
  );
}
