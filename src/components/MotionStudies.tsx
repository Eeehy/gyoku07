import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject, SyntheticEvent } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { films } from "../data/films";
import type { Film } from "../data/films";
import SectionTitle from "./SectionTitle";
import EditorialHeading from "./EditorialHeading";
import "./MotionStudies.css";

function FilmPlayer({ film, index, players }: {
  film: Film;
  index: number;
  players: RefObject<(HTMLVideoElement | null)[]>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const attemptRef = useRef(0);
  const [activated, setActivated] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hint, setHint] = useState("");

  useLayoutEffect(() => {
    // The cover button disappears on activation; keep keyboard focus in the player.
    if (activated) videoRef.current?.focus({ preventScroll: true });
  }, [activated]);

  function start() {
    const video = videoRef.current;
    if (!video) return;
    const attempt = ++attemptRef.current;
    setFailed(false);
    setHint("");
    setActivated(true);
    // Set the source and call play inside the click: preserve the mobile user gesture.
    // No src is assigned before a visitor chooses to watch this film.
    if (!video.getAttribute("src")) video.src = film.src;
    else if (video.error) video.load();
    void video.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (attempt !== attemptRef.current || !video.isConnected || video.error) return;
      setHint("点击播放器中的播放按钮，继续观看。");
    });
  }

  function playbackStarted(event: SyntheticEvent<HTMLVideoElement>) {
    setHint("");
    players.current.forEach(player => {
      if (player && player !== event.currentTarget && !player.paused) player.pause();
    });
  }

  function mediaFailed() {
    ++attemptRef.current;
    setFailed(true);
    setActivated(false);
    setHint("暂时无法播放，可以重试或打开视频文件。");
  }

  return <article className={`film-study${index === 0 ? " film-study--feature" : ""}`}>
    <div className="film-study__meta mono">
      <span>{film.category}</span>
      <span>{film.duration}</span>
    </div>
    <div className={`film-study__frame${activated ? " is-active" : ""}`}>
      {!activated && <img src={film.poster} alt="" loading="lazy" decoding="async"
        onError={event => { event.currentTarget.style.visibility = "hidden"; }} />}
      <video ref={node => {
        videoRef.current = node;
        players.current[index] = node;
      }} controls={activated} tabIndex={activated ? 0 : -1} preload="none" playsInline
        aria-label={`播放 ${film.title}`} aria-describedby={`film-description-${film.id}`}
        onPlay={playbackStarted} onError={mediaFailed} />
      {!activated && <button type="button" className="film-study__play" onClick={start}
        aria-label={`${failed ? "重新播放" : "播放"} ${film.title}`}>
        <span><Play size={24} fill="currentColor" strokeWidth={1.3} /></span>
        <span className="mono">{failed ? "TRY AGAIN" : "PLAY FILM"}</span>
      </button>}
    </div>
    <div className="film-study__caption">
      <h3>{film.title}</h3>
      <a href={film.src} target="_blank" rel="noreferrer" aria-label={`单独打开 ${film.title} 视频`}>
        <ArrowUpRight size={20} />
      </a>
    </div>
    <p id={`film-description-${film.id}`} className="film-study__description">{film.description}</p>
    <p className="film-study__status" role="status">{hint}</p>
  </article>;
}

export default function MotionStudies() {
  const players = useRef<(HTMLVideoElement | null)[]>([]);
  return <section id="films" className="section motion-studies" aria-labelledby="films-title">
    <EditorialHeading text={"IN\nMOTION."} />
    <div className="section-heading">
      <div>
        <span className="section-kicker">Ideas in motion</span>
        <SectionTitle id="films-title" text="让想法，动起来。" />
      </div>
      <p>从数字形态，到画面叙事。<br />两种风格，同样的探索欲。</p>
    </div>
    <div className="motion-studies__grid">
      {films.map((film, index) => <FilmPlayer key={film.id} film={film} index={index} players={players} />)}
    </div>
    <div className="motion-studies__footer">
      <span className="mono">PRESS PLAY. EXPLORE ANOTHER SIDE.</span>
      <a href="#team">一起探索新想法 <ArrowUpRight size={16} /></a>
    </div>
  </section>;
}
