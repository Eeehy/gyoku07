import { Fragment, useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useDocumentVisible, useMedia } from "../hooks/useExperience";

type Props = { text: string; mobileBreakAt?: string };
type Gust = { x: number; started: number; strength: number };
const PADDING = 6;

/** Original, local Canvas2D texture warp. DOM text remains the content source. */
export default function SilkText({ text, mobileBreakAt }: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const source = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<{ setActive: (value: boolean) => void } | null>(
    null,
  );
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const visible = useDocumentVisible();
  const inView = useInView(root, { amount: 0.1 });
  const active = !reduced && visible && inView;
  const activeRef = useRef(active);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activeRef.current = active;
    controller.current?.setActive(active);
  }, [active]);

  useEffect(() => {
    setReady(false);
    const element = root.current;
    const original = source.current;
    const output = canvas.current;
    if (reduced || !element || !original || !output) return;
    const texture = document.createElement("canvas");
    const context = output.getContext("2d");
    const ink = texture.getContext("2d");
    if (!context || !ink) return;

    let disposed = false;
    let frame = 0;
    let width = 0;
    let height = 0;
    let scale = 1;
    let phase = 0;
    let lastFrame = 0;
    let textureReady = false;
    let failed = false;
    const gusts: Gust[] = [];

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const fail = () => {
      failed = true;
      stop();
      if (!disposed) setReady(false);
    };
    const draw = () => {
      if (!textureReady || disposed || failed) return;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";
      const waves = gusts.map((gust) => {
        const age = phase - gust.started;
        const spread = 42 + age * 18;
        return {
          x: gust.x,
          spreadSquared: spread * spread,
          strength: gust.strength * Math.exp(-age * 1.8),
          offset: age * 4.5,
        };
      });
      // Adjacent narrow strips keep deformation continuous across glyphs.
      for (let x = 0; x < width; x += 3) {
        let lift = Math.sin(x * 0.025 - phase * 0.7) * 0.65;
        lift += Math.sin(x * 0.013 + phase * 0.4) * 0.35;
        for (const wave of waves) {
          const distance = x - wave.x;
          lift +=
            Math.sin(distance * 0.052 - wave.offset) *
            wave.strength *
            Math.exp(-(distance * distance) / wave.spreadSquared);
        }
        lift = Math.max(-4, Math.min(4, lift));
        const strip = Math.min(3.2, width - x);
        context.drawImage(
          texture,
          x * scale,
          0,
          strip * scale,
          texture.height,
          x,
          lift,
          strip,
          height,
        );
      }
      const drift = Math.sin(phase * 0.28) * width * 0.2;
      const sheen = context.createLinearGradient(
        -width * 0.25 + drift,
        0,
        width * 1.25 + drift,
        height,
      );
      sheen.addColorStop(0, "#c4ddf8");
      sheen.addColorStop(0.25, "#f8fcff");
      sheen.addColorStop(0.5, "#b8dcff");
      sheen.addColorStop(0.75, "#edf7ff");
      sheen.addColorStop(1, "#bddafa");
      context.globalCompositeOperation = "source-atop";
      context.fillStyle = sheen;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed || failed || !activeRef.current) return;
      phase += Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      while (gusts.length && phase - gusts[0].started > 3) gusts.shift();
      try {
        draw();
      } catch {
        fail();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (disposed || failed || !textureReady || !activeRef.current || frame)
        return;
      lastFrame = performance.now();
      frame = requestAnimationFrame(tick);
    };
    controller.current = {
      setActive(value) {
        if (value) start();
        else stop();
      },
    };

    const rebuild = () => {
      if (disposed || failed) return;
      try {
        const bounds = original.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        scale = Math.min(window.devicePixelRatio || 1, 1.5);
        width = bounds.width + PADDING * 2;
        height = bounds.height + PADDING * 2;
        output.width = texture.width = Math.ceil(width * scale);
        output.height = texture.height = Math.ceil(height * scale);
        ink.setTransform(scale, 0, 0, scale, 0, 0);
        ink.clearRect(0, 0, width, height);
        const style = getComputedStyle(original);
        ink.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        ink.fillStyle = "#e1eaf0";
        ink.textBaseline = "alphabetic";
        const metrics = ink.measureText("探索 AI");
        const ascent =
          metrics.fontBoundingBoxAscent || parseFloat(style.fontSize) * 0.85;
        const walker = document.createTreeWalker(
          original,
          NodeFilter.SHOW_TEXT,
        );
        const range = document.createRange();
        let node: Node | null;
        // Range positions preserve the browser's Chinese wrapping and explicit breaks.
        while ((node = walker.nextNode())) {
          let offset = 0;
          for (const glyph of Array.from(node.textContent || "")) {
            range.setStart(node, offset);
            range.setEnd(node, offset + glyph.length);
            const rect = range.getBoundingClientRect();
            if (rect.width)
              ink.fillText(
                glyph,
                rect.left - bounds.left + PADDING,
                rect.top - bounds.top + PADDING + ascent,
              );
            offset += glyph.length;
          }
        }
        textureReady = true;
        draw();
        setReady(true);
        start();
      } catch {
        fail();
      }
    };
    let lastPointerTime = 0;
    const gust = (event: PointerEvent) => {
      if (!activeRef.current || failed) return;
      const now = performance.now();
      if (
        event.type === "pointermove" &&
        (event.pointerType !== "mouse" || now - lastPointerTime < 75)
      )
        return;
      lastPointerTime = now;
      gusts.push({
        x: event.clientX - element.getBoundingClientRect().left + PADDING,
        started: phase,
        strength: event.type === "pointerdown" ? 3.8 : 2.6,
      });
      if (gusts.length > 8) gusts.shift();
    };
    const observer = new ResizeObserver(rebuild);
    void document.fonts.ready.then(() => {
      if (disposed) return;
      rebuild();
      observer.observe(original);
    });
    document.fonts.addEventListener("loadingdone", rebuild);
    window.addEventListener("resize", rebuild);
    element.addEventListener("pointermove", gust, { passive: true });
    element.addEventListener("pointerdown", gust, { passive: true });
    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", rebuild);
      window.removeEventListener("resize", rebuild);
      element.removeEventListener("pointermove", gust);
      element.removeEventListener("pointerdown", gust);
      controller.current = null;
      texture.width = texture.height = 0;
    };
  }, [text, mobileBreakAt, reduced]);

  return (
    <span
      ref={root}
      className={`silk-text${ready && !reduced ? " is-ready" : ""}`}
    >
      <span ref={source} className="silk-text-source">
        {text.split("\n").map((line, index) => {
          const breakAt =
            mobileBreakAt && line.includes(mobileBreakAt)
              ? line.indexOf(mobileBreakAt) + mobileBreakAt.length
              : 0;
          return (
            <Fragment key={index}>
              {index > 0 && <br />}
              {breakAt ? (
                <>
                  {line.slice(0, breakAt)}
                  <br className="horizon-mobile-break" />
                  {line.slice(breakAt)}
                </>
              ) : (
                line
              )}
            </Fragment>
          );
        })}
      </span>
      {!reduced && (
        <canvas ref={canvas} className="silk-text-canvas" aria-hidden="true" />
      )}
    </span>
  );
}
