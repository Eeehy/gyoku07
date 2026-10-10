import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useMedia } from "../hooks/useExperience";
import "./SectionTitle.css";

const StrokeTitleEffect = lazy(() => import("./StrokeTitleEffect"));

export interface TitleLine {
  text: string;
  left: number;
  top: number;
  height: number;
}

export interface TitleLayout {
  lines: TitleLine[];
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
}

function sameLayout(a: TitleLayout | null, b: TitleLayout) {
  return (
    a !== null &&
    a.fontSize === b.fontSize &&
    a.fontWeight === b.fontWeight &&
    a.letterSpacing === b.letterSpacing &&
    a.lines.length === b.lines.length &&
    a.lines.every((line, index) => {
      const next = b.lines[index];
      return (
        line.text === next.text &&
        Math.abs(line.left - next.left) < 0.5 &&
        Math.abs(line.top - next.top) < 0.5 &&
        Math.abs(line.height - next.height) < 0.5
      );
    })
  );
}

// A failed optional effect must leave the actual heading visible.
class EffectBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function SectionTitle({ text, id }: { text: string; id?: string }) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [entered, setEntered] = useState(false);
  const [layout, setLayout] = useState<TitleLayout | null>(null);
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const finish = useCallback(() => {
    setReady(false);
    setComplete(true);
  }, []);
  const activate = useCallback(() => {
    activeRef.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const span = textRef.current;
    if (!root || !span || reduced || complete) return;
    let cancelled = false;
    let frame = 0;
    let previousLayout: TitleLayout | null = null;
    const measure = () => {
      if (cancelled) return;
      const node = span.firstChild;
      if (!node) return;
      const bounds = root.getBoundingClientRect();
      const lines: TitleLine[] = [];
      const range = document.createRange();
      // DOM ranges preserve the browser's Chinese wrapping and manual line breaks.
      for (let offset = 0; offset < text.length; offset++) {
        if (text[offset] === "\n") continue;
        range.setStart(node, offset);
        range.setEnd(node, offset + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const top = rect.top - bounds.top;
        const last = lines.at(-1);
        if (last && Math.abs(last.top - top) < 1) last.text += text[offset];
        else
          lines.push({
            text: text[offset],
            left: rect.left - bounds.left,
            top,
            height: rect.height,
          });
      }
      const style = getComputedStyle(root);
      const next = {
        lines,
        fontSize: parseFloat(style.fontSize),
        fontWeight: Number(style.fontWeight) || 500,
        letterSpacing: parseFloat(style.letterSpacing) || 0,
      };
      if (
        activeRef.current &&
        previousLayout &&
        !sameLayout(previousLayout, next)
      ) {
        finish();
        return;
      }
      previousLayout = next;
      setLayout((previous) => (sameLayout(previous, next) ? previous : next));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    document.fonts.ready.then(() => {
      if (!cancelled) {
        measure();
        observer.observe(root);
      }
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [text, reduced, complete, finish]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || entered || complete) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.8 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [reduced, entered, complete]);

  useEffect(() => {
    if (reduced) {
      setReady(false);
      if (entered) finish();
      return;
    }
    if (!ready) return;
    // Finish in plain DOM; no persistent animation loop or replay on resize.
    const timer = window.setTimeout(finish, 3000);
    return () => window.clearTimeout(timer);
  }, [ready, reduced, entered, finish]);

  return (
    <h2
      ref={rootRef}
      id={id}
      className={`section-title${ready && !reduced ? " is-drawing" : ""}`}
    >
      <span ref={textRef} className="section-title__text">
        {text}
      </span>
      {entered && layout?.lines.length && !reduced && !complete ? (
        <EffectBoundary onFailure={finish}>
          <Suspense fallback={null}>
            <StrokeTitleEffect layout={layout} onReady={activate} />
          </Suspense>
        </EffectBoundary>
      ) : null}
    </h2>
  );
}
