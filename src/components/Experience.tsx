import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useMedia } from "../hooks/useExperience";

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useMedia("(pointer: fine)");
  useEffect(() => {
    if (reduced || !fine) return;
    let frame = 0;
    let lastFrame = 0;
    let x = -100,
      y = -100,
      currentX = -100,
      currentY = -100;
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const interactive = (event.target as HTMLElement).closest(
        "a, button, input, textarea, select",
      );
      ref.current?.classList.toggle("is-active", Boolean(interactive));
      ref.current?.classList.add("is-visible");
      start();
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const leave = () => {
      ref.current?.classList.remove("is-visible");
      stop();
    };
    const animate = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      const blend =
        1 - Math.exp(-16 * Math.min((now - lastFrame) / 1000, 0.05));
      lastFrame = now;
      currentX += (x - currentX) * blend;
      currentY += (y - currentY) * blend;
      const settled = Math.abs(x - currentX) + Math.abs(y - currentY) < 0.15;
      if (settled) {
        currentX = x;
        currentY = y;
      }
      if (ref.current)
        ref.current.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
      if (!settled) frame = requestAnimationFrame(animate);
    };
    const start = () => {
      if (frame || document.hidden) return;
      lastFrame = performance.now();
      frame = requestAnimationFrame(animate);
    };
    const visibility = () => {
      stop();
      if (!document.hidden && ref.current?.classList.contains("is-visible"))
        start();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stop();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [reduced, fine]);
  return reduced || !fine ? null : (
    <div ref={ref} className="custom-cursor" aria-hidden="true">
      <div />
    </div>
  );
}
export function useScrollExperience() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const magnets = document.querySelectorAll<HTMLElement>(".magnetic");
    const move = (event: PointerEvent) => {
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      target.style.translate = `${(event.clientX - rect.left - rect.width / 2) * 0.08}px ${(event.clientY - rect.top - rect.height / 2) * 0.08}px`;
    };
    const reset = (event: PointerEvent) => {
      (event.currentTarget as HTMLElement).style.translate = "0px 0px";
    };
    magnets.forEach((element) => {
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", reset);
    });
    return () => {
      magnets.forEach((element) => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", reset);
      });
    };
  }, [reduced]);
}
