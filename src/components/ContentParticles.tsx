import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
import { useDocumentVisible, useMedia } from "../hooks/useExperience";
import { contentParticles } from "../data/particles";
import "./ContentParticles.css";

const loadParticles = () => import("./react-bits/Particles");
const Particles = lazy(loadParticles);

class ParticleBoundary extends Component<
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

export default function ContentParticles({
  interactionRef,
}: {
  interactionRef: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const desktop = useMedia("(min-width: 768px) and (pointer: fine)");
  const visible = useDocumentVisible();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) setNear(true);
        else timer = window.setTimeout(() => setNear(false), 200);
      },
      { rootMargin: "80px 0px" },
    );
    observer.observe(root);
    const viewportObserver = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
      { threshold: 0.01 },
    );
    viewportObserver.observe(root);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      viewportObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inView || reduced || !desktop || supported !== null) return;
    const probe = document.createElement("canvas");
    const attributes = { antialias: false, failIfMajorPerformanceCaveat: true };
    const gl = (probe.getContext("webgl2", attributes) ||
      probe.getContext("webgl", attributes)) as
      WebGLRenderingContext | WebGL2RenderingContext | null;
    setSupported(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }, [inView, reduced, desktop, supported]);

  useEffect(() => {
    if (near && inView && visible && desktop && !reduced && supported && !failed)
      void loadParticles().catch(fail);
  }, [near, inView, visible, desktop, reduced, supported, failed, fail]);

  const active =
    inView && visible && desktop && !reduced && supported === true && !failed;
  activeRef.current = active;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const lost = (event: Event) => {
      if (
        !activeRef.current ||
        !(event.target instanceof HTMLCanvasElement) ||
        !event.target.isConnected
      )
        return;
      event.preventDefault();
      fail();
    };
    root.addEventListener("webglcontextlost", lost, true);
    return () => root.removeEventListener("webglcontextlost", lost, true);
  }, [fail]);

  return (
    <div ref={ref} className="content-particles" aria-hidden="true">
      <div className="content-particles__static" />
      {active ? (
        <ParticleBoundary onFailure={fail}>
          <Suspense fallback={null}>
            <Particles
              {...contentParticles}
              interactionRef={interactionRef}
              onError={fail}
            />
          </Suspense>
        </ParticleBoundary>
      ) : null}
    </div>
  );
}
