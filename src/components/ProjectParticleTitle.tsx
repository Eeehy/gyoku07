import {
  Component, lazy, Suspense, useCallback, useEffect, useRef, useState,
} from "react";
import type { ReactNode } from "react";
import { useDocumentVisible, useMedia } from "../hooks/useExperience";
import { projectTitleEffect } from "../data/projectTitleEffect";
import "./ProjectParticleTitle.css";

const ParticleText = lazy(() => import("./react-bits/ParticleText"));
interface Line {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
}
interface Layout {
  lines: Line[];
  size: number;
  weight: number;
  spacing: number;
  family: string;
  revision: number;
}

function sameLayout(previous: Layout | null, next: Layout) {
  return previous !== null &&
    previous.size === next.size &&
    previous.weight === next.weight &&
    previous.spacing === next.spacing &&
    previous.family === next.family &&
    previous.lines.length === next.lines.length &&
    previous.lines.every((line, i) => {
      const current = next.lines[i];
      return line.text === current.text &&
        Math.abs(line.left - current.left) < 0.5 &&
        Math.abs(line.top - current.top) < 0.5 &&
        Math.abs(line.width - current.width) < 0.5 &&
        Math.abs(line.height - current.height) < 0.5;
    });
}

class EffectBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function ProjectParticleTitle({ text }: { text: string }) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const revisionRef = useRef(0);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const desktop = useMedia("(min-width: 768px) and (pointer: fine)");
  const visible = useDocumentVisible();
  const [engaged, setEngaged] = useState(false);
  const [inView, setInView] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState<Set<number>>(() => new Set());
  const fail = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const root = rootRef.current;
    const button = root?.closest("button");
    if (!root || !button) return;
    let hovered = false;
    let focused = button.contains(document.activeElement);
    const update = () => setEngaged(hovered || focused);
    const enter = () => { hovered = true; update(); };
    const leave = () => { hovered = false; update(); };
    const focus = () => { focused = true; update(); };
    const blur = (event: FocusEvent) => {
      focused = event.relatedTarget instanceof Node && button.contains(event.relatedTarget);
      update();
    };
    button.addEventListener("pointerenter", enter);
    button.addEventListener("pointerleave", leave);
    button.addEventListener("focusin", focus);
    button.addEventListener("focusout", blur);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(root);
    update();
    return () => {
      observer.disconnect();
      button.removeEventListener("pointerenter", enter);
      button.removeEventListener("pointerleave", leave);
      button.removeEventListener("focusin", focus);
      button.removeEventListener("focusout", blur);
    };
  }, []);

  const active = engaged && inView && visible && desktop && !reduced && !failed;
  useEffect(() => {
    if (!engaged) setFailed(false);
    if (!active) setReady(new Set());
  }, [engaged, active]);

  useEffect(() => {
    const root = rootRef.current;
    const span = textRef.current;
    if (!active || !root || !span) return;
    let cancelled = false;
    let frame = 0;
    let previousLayout: Layout | null = null;
    const measure = () => {
      if (cancelled || !span.firstChild) return;
      const bounds = root.getBoundingClientRect();
      const range = document.createRange();
      const lines: Line[] = [];
      for (let offset = 0; offset < text.length; offset++) {
        range.setStart(span.firstChild, offset);
        range.setEnd(span.firstChild, offset + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const top = rect.top - bounds.top;
        const line = lines.at(-1);
        if (line && Math.abs(line.top - top) < 1) {
          line.text += text[offset];
          line.width = rect.right - bounds.left - line.left;
        } else {
          lines.push({
            text: text[offset], left: rect.left - bounds.left,
            top, width: rect.width, height: rect.height,
          });
        }
      }
      const style = getComputedStyle(root);
      const next = {
        lines, size: parseFloat(style.fontSize),
        weight: Number(style.fontWeight) || 500,
        spacing: parseFloat(style.letterSpacing) || 0,
        family: style.fontFamily, revision: revisionRef.current,
      };
      if (!sameLayout(previousLayout, next)) {
        // All lines remount together so readiness cannot refer to an older layout.
        next.revision = ++revisionRef.current;
        previousLayout = next;
        setReady(new Set());
        setLayout(next);
      }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    document.fonts.ready.then(() => {
      if (!cancelled) { measure(); observer.observe(root); }
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); observer.disconnect(); };
  }, [active, text]);

  const showing = active && !!layout?.lines.length && ready.size === layout.lines.length;
  const padding = layout ? Math.ceil(layout.size * 1.65) : 0;
  return (
    <h3
      ref={rootRef}
      className={`project-particle-title${showing ? " is-particle-active" : ""}`}
    >
      <span ref={textRef} className="project-particle-title__text">{text}</span>
      {active && layout?.lines.length ? (
        <EffectBoundary onFailure={fail}>
          <Suspense fallback={null}>
            <span
              className="project-particle-title__effect"
              aria-hidden="true"
              style={{ opacity: showing ? 1 : 0 }}
            >
              {layout.lines.map((line, index) => (
                <span
                  key={`${layout.revision}-${index}`}
                  className="project-particle-title__line"
                  style={{
                    left: line.left - padding, top: line.top - padding,
                    width: line.width + padding * 2,
                    height: line.height + padding * 2,
                  }}
                >
                  <ParticleText
                    {...projectTitleEffect}
                    text={line.text}
                    fontSize={layout.size}
                    fontWeight={layout.weight}
                    fontFamily={layout.family}
                    letterSpacing={layout.spacing}
                    textOffsetX={padding}
                    scatter={layout.size * 0.65}
                    pointerRepel={layout.size * 0.3}
                    repelRadius={layout.size * 1.5}
                    interactionRef={rootRef}
                    onReady={() => setReady(previous => new Set(previous).add(index))}
                    onError={fail}
                  />
                </span>
              ))}
            </span>
          </Suspense>
        </EffectBoundary>
      ) : null}
    </h3>
  );
}
