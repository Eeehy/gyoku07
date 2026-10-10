import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { useDocumentVisible, useMedia } from "../hooks/useExperience";
import { driftWallImages, driftWallItems, driftWallSettings } from "../data/driftWall";
import "./VisualWall.css";
import EditorialHeading from "./EditorialHeading";

const DriftWall = lazy(() => import("./react-bits/DriftWall"));
const fallbackSrc = "/images/visual-unavailable.svg";

function imageFallback(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallback !== "true") {
    image.dataset.fallback = "true";
    image.src = fallbackSrc;
  } else image.style.visibility = "hidden";
}

class WallBoundary extends Component<
  { children: ReactNode; onFailure: () => void }, { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function StaticWall() {
  return <ul className="visual-wall__grid" aria-label="数字视觉与界面概念">
    {driftWallImages.map(item => <li key={item.image}>
      <img src={item.image} alt="" loading="lazy" decoding="async" onError={imageFallback} />
      <span>{item.title}</span>
    </li>)}
  </ul>;
}

export default function VisualWall() {
  const stageRef = useRef<HTMLDivElement>(null);
  const desktop = useMedia("(min-width: 768px) and (pointer: fine)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const visible = useDocumentVisible();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  const animated = desktop && !reduced && !failed;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); preload.disconnect(); }
    }, { rootMargin: "160px 0px" });
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    preload.observe(stage);
    visibility.observe(stage);
    return () => { preload.disconnect(); visibility.disconnect(); };
  }, []);

  return <section id="gallery" className="section visual-wall" aria-label="数字视觉实验">
    <EditorialHeading text={"VISUAL\nFIELD."} />
    <div ref={stageRef} className={`visual-wall__stage${animated ? "" : " is-static"}`}>
      {animated && near ? <WallBoundary onFailure={() => setFailed(true)}>
        <Suspense fallback={<StaticWall />}>
          <DriftWall {...driftWallSettings} items={driftWallItems}
            enabled={inView && visible} decorative fallbackSrc={fallbackSrc} />
        </Suspense>
      </WallBoundary> : <StaticWall />}
    </div>
    <div className="visual-wall__footer">
      <span>数字视觉与界面概念 <span className="visual-wall__label">VISUAL EXPERIMENTS</span></span>
      <a href="#projects">查看项目 <ArrowUpRight size={16} /></a>
    </div>
  </section>;
}
