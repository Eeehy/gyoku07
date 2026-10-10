import { useLayoutEffect, useRef } from "react";
import StrokeText from "./react-bits/StrokeText";
import type {} from "gsap";
import type { TitleLayout } from "./SectionTitle";

// ScrollTrigger is now shared by the editorial motion system. Never disable
// a shared plugin globally from this optional, lazily loaded title effect.

export default function StrokeTitleEffect({
  layout,
  onReady,
}: {
  layout: TitleLayout;
  onReady: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const align = () => {
      const elements = root.querySelectorAll<HTMLElement>(".stroke-text");
      let measured = 0;
      elements.forEach((element, index) => {
        const svg = element.querySelector("svg");
        const box = svg?.viewBox.baseVal;
        if (!svg || !box || box.x >= 0) return;
        const line = layout.lines[index];
        // Native viewBox pixels avoid the registry component's full-width scaling.
        svg.style.width = `${box.width}px`;
        svg.style.height = `${box.height}px`;
        element.style.width = `${box.width}px`;
        element.style.height = `${box.height}px`;
        element.style.left = `${line.left + box.x}px`;
        element.style.top = `${line.top + (line.height - box.height) / 2}px`;
        measured++;
      });
      if (measured === layout.lines.length) {
        root.classList.add("is-ready");
        onReady();
      }
    };
    const observer = new MutationObserver(align);
    // Official measurement changes viewBox once glyph metrics are available.
    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["viewBox"],
    });
    align();
    return () => observer.disconnect();
  }, [layout, onReady]);

  return (
    <span ref={ref} className="section-title__effect" aria-hidden="true">
      {layout.lines.map((line, index) => (
        <StrokeText
          key={`${index}-${line.text}`}
          text={line.text}
          strokeColor="var(--accent)"
          fillColor="currentColor"
          strokeWidth={1.4}
          drawDuration={1.6}
          fillDelay={0.2}
          stagger={0.05}
          ease="power2.out"
          trigger="mount"
          fillMode="wipe"
          fontSize={layout.fontSize}
          fontWeight={layout.fontWeight}
          letterSpacing={layout.letterSpacing}
        />
      ))}
    </span>
  );
}
