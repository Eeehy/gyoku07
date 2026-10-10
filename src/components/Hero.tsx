import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { profile } from "../data/portfolio";
import { heroMedia } from "../data/heroMedia";
import { useDocumentVisible, useMedia } from "../hooks/useExperience";
import SilkText from "./SilkText";

export default function Hero() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const visible = useDocumentVisible();
  const compact = useMedia("(max-width: 767px)");
  const hero = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // About's scroll margin can leave a thin Hero edge on screen. Avoid decoding
  // the video behind that edge while the content's WebGL scene is active.
  const inView = useInView(hero, { amount: 0.15 });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [videoSource, setVideoSource] = useState<string>();
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const departure = useTransform(scrollYProgress, [0, 0.7, 1], [0, 0.22, 0.6]);

  useEffect(() => {
    if (videoSource || reduced || failed || !inView || !visible) return;
    // Let the poster / text paint first. A deep link never assigns a media src.
    const timer = window.setTimeout(() => {
      const bounds = hero.current?.getBoundingClientRect();
      if (!bounds || bounds.bottom <= 0 || bounds.top >= window.innerHeight || document.hidden) return;
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      setVideoSource(compact || saveData ? heroMedia.mobileVideo : heroMedia.video);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [videoSource, reduced, failed, inView, visible, compact]);

  useEffect(() => {
    const element = video.current;
    if (!element || !videoSource) return;
    let cancelled = false;
    if (reduced || !inView || !visible) element.pause();
    else {
      element.muted = true;
      void element.play().catch((error: DOMException) => {
        // A new pause can interrupt a pending play; it is not a media failure.
        if (!cancelled && error.name !== "AbortError") setFailed(true);
      });
    }
    return () => {
      cancelled = true;
      element.pause();
    };
  }, [reduced, inView, visible, failed, videoSource]);

  return (
    <section
      id="home"
      ref={hero}
      className="horizon-hero"
      aria-labelledby="hero-heading"
    >
      <div className="horizon-background" aria-hidden="true">
        <img
          className="horizon-still"
          src={heroMedia.poster}
          alt=""
          width={1280}
          height={720}
          fetchPriority="high"
        />
        {!reduced && !failed && (
          <video
            ref={video}
            className={`horizon-video${ready ? " is-ready" : ""}`}
            src={videoSource}
            poster={heroMedia.poster}
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            onLoadedData={() => setReady(true)}
            onError={() => {
              setFailed(true);
              setReady(false);
            }}
          />
        )}
        <div className="horizon-reading-veil" />
        <div className="horizon-dark-edge" />
        <motion.div
          className="horizon-departure"
          style={{ opacity: reduced ? 0 : departure }}
        />
      </div>

      <div className="hero-opening" aria-hidden="true">
        <div className="hero-opening__panels"><i /><i /><i /></div>
        <div className="hero-opening__identity">
          <span className="hero-opening__mask"><span className="hero-opening__signature">{profile.alias}.</span></span>
          <span className="hero-opening__caption mono">IDEAS INTO POSSIBILITY.</span>
          <span className="hero-opening__rule" />
        </div>
      </div>

      <div className="horizon-layout">
        <div className="horizon-copy">
          <p className="horizon-eyebrow">
            SOFTWARE ENGINEER · AI EXPLORER
          </p>
          <h1 id="hero-heading" className="horizon-title">
            <span className="horizon-title-line">
              <span className="hero-title-reveal">
                Build what’s next.
              </span>
            </span>
            <span className="horizon-title-line">
              <em className="hero-title-reveal">
                Together.
              </em>
            </span>
          </h1>
          <p className="horizon-description">
            <SilkText
              text={
                "探索 AI、软件工程与创新实践。\n寻找志同道合的开发者，把有价值的想法变成真正的作品。"
              }
              mobileBreakAt="寻找志同道合的开发者，"
            />
          </p>
          <div className="horizon-actions">
            <a
              href="#projects"
              className="horizon-primary magnetic"
            >
              Explore My Work <ArrowUpRight size={16} strokeWidth={1.5} />
            </a>
            <a
              href="#team"
              className="horizon-secondary magnetic"
            >
              <span className="horizon-arrow-circle">
                <ArrowUpRight size={16} strokeWidth={1.3} />
              </span>
              Let’s Team Up
            </a>
          </div>
        </div>
        <div className="horizon-bottom">
          <a className="horizon-availability" href="#team">
            <span className="horizon-status-dot" />
            {profile.openToTeam
              ? "OPEN FOR COLLABORATION"
              : "CURRENTLY BUILDING"}
          </a>
          <div className="horizon-bottom-right">
            <a className="horizon-scroll" href="#about">
              SCROLL TO EXPLORE <ArrowDown size={14} strokeWidth={1.4} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
