"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ENTRANCE_ORANGE, markHandoff, shouldStartEntrance } from "@/lib/entrance";
import { APP_HOME } from "@/lib/routes";

/** Where the circle starts and how big it has to get to cover the screen. */
interface Burst {
  x: number;
  y: number;
  radius: number;
}

/**
 * A link to the app home. The first time ever, clicking it floods the screen orange from the
 * click point, then navigates; the home page picks up under the same orange (`Entrance`).
 * Every other time, and with reduced motion, it's a plain link.
 */
export function EntranceLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  const router = useRouter();
  const [burst, setBurst] = useState<Burst | null>(null);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || burst !== null) return;
    // New tab, new window, download: let the browser have it.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!shouldStartEntrance()) return;

    e.preventDefault();
    const box = e.currentTarget.getBoundingClientRect();
    // Keyboard clicks report 0,0; start from the button's centre then.
    const x = e.clientX || box.left + box.width / 2;
    const y = e.clientY || box.top + box.height / 2;
    const radius =
      Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 4;
    markHandoff();
    router.prefetch(APP_HOME);
    setBurst({ x, y, radius });
  };

  return (
    <>
      <Link href={APP_HOME} onClick={handleClick} {...props} />
      {burst !== null &&
        createPortal(
          <motion.div
            aria-hidden
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: ENTRANCE_ORANGE }}
            initial={{ clipPath: `circle(0px at ${burst.x}px ${burst.y}px)` }}
            animate={{ clipPath: `circle(${burst.radius}px at ${burst.x}px ${burst.y}px)` }}
            // Accelerating, like the landing's disc rushing at the camera.
            transition={{ duration: 0.6, ease: [0.7, 0, 0.84, 0] }}
            onAnimationComplete={() => router.push(APP_HOME)}
          />,
          document.body,
        )}
    </>
  );
}
