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
import { ArrowUpRight, Skull } from "lucide-react";
import { useDocumentVisible, useMedia } from "../hooks/useExperience";
import { portrait } from "../data/portrait";
import "./SkullPortrait.css";

const DitherVeil = lazy(() => import("./react-bits/DitherVeil"));

class PortraitBoundary extends Component<
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

export default function SkullPortrait() {
  const stageRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const desktopPointer = useMedia("(min-width: 768px) and (pointer: fine)");
  const visible = useDocumentVisible();
  const [near, setNear] = useState(false);
  const [preloaded, setPreloaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) {
          setPreloaded(true);
          setNear(true);
        } else timer = window.setTimeout(() => setNear(false), 200);
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(stage);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!near || reduced || !desktopPointer || webgl !== null) return;
    // GLSL 300 in the official source requires WebGL2, not WebGL1 fallback.
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2", {
      antialias: false,
      failIfMajorPerformanceCaveat: true,
    });
    setWebgl(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }, [near, reduced, desktopPointer, webgl]);

  const active =
    near &&
    visible &&
    !reduced &&
    desktopPointer &&
    webgl === true &&
    loaded &&
    !failed;
  activeRef.current = active;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const lost = (event: Event) => {
      // The registry intentionally loses context on unmount. Ignore that path.
      if (
        !activeRef.current ||
        !(event.target instanceof HTMLCanvasElement) ||
        !event.target.isConnected
      )
        return;
      event.preventDefault();
      fail();
    };
    stage.addEventListener("webglcontextlost", lost, true);
    return () => stage.removeEventListener("webglcontextlost", lost, true);
  }, [fail]);

  return (
    <figure className="skull-portrait">
      <div className="skull-portrait__header mono">
        <span>
          <i />
          {portrait.label}
        </span>
        <ArrowUpRight size={14} aria-hidden="true" />
      </div>
      <div ref={stageRef} className="skull-portrait__stage">
        {preloaded && !imageFailed ? (
          <img
            className="skull-portrait__image"
            src={portrait.src}
            alt={portrait.alt}
            width={768}
            height={768}
            decoding="async"
            onLoad={(event) => {
              event.currentTarget
                .decode()
                .then(() => setLoaded(true))
                .catch(() => setLoaded(true));
            }}
            onError={() => {
              setImageFailed(true);
              setLoaded(false);
            }}
          />
        ) : (
          <Skull
            className="skull-portrait__placeholder"
            size={110}
            strokeWidth={0.6}
            aria-hidden="true"
          />
        )}
        {active ? (
          <div className="skull-portrait__effect" aria-hidden="true">
            <PortraitBoundary onFailure={fail}>
              <Suspense fallback={null}>
                <DitherVeil
                  src={portrait.src}
                  fit="contain"
                  pattern="floyd"
                  pixelSize={2}
                  inkColor={portrait.inkColor}
                  paperColor={portrait.paperColor}
                  revealRadius={160}
                  softness={0.6}
                  linger={1}
                  wander={false}
                  clickBurst
                  onError={fail}
                />
              </Suspense>
            </PortraitBoundary>
          </div>
        ) : null}
        <span
          className="skull-portrait__cross skull-portrait__cross--tl"
          aria-hidden="true"
        />
        <span
          className="skull-portrait__cross skull-portrait__cross--br"
          aria-hidden="true"
        />
      </div>
      <figcaption>
        <span>
          骷髅数字肖像 <small> / 视觉实验</small>
        </span>
        <span className="skull-portrait__hint">
          {active ? "移动揭示 · 点击扩散" : "数字雕塑"}
        </span>
      </figcaption>
    </figure>
  );
}
