import { useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, Github, Mail, Plus } from "lucide-react";
import Hero from "./components/Hero";
import Header from "./components/Header";
import Terminal from "./components/Terminal";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import TeamInvite from "./components/TeamInvite";
import SectionTitle from "./components/SectionTitle";
import SkullPortrait from "./components/SkullPortrait";
import VisualWall from "./components/VisualWall";
import DeveloperProfileCard from "./components/DeveloperProfileCard";
import ContentParticles from "./components/ContentParticles";
import MotionStudies from "./components/MotionStudies";
import EditorialHeading from "./components/EditorialHeading";
import { useEditorialMotion } from "./hooks/useEditorialMotion";
import { Cursor, useScrollExperience } from "./components/Experience";
import {
  competitions,
  explorationPlans,
  profile,
  projects,
} from "./data/portfolio";

function About() {
  return (
    <section id="about" className="section about-section">
      <EditorialHeading text={"THE HUMAN\nBEHIND."} />
      <div className="section-heading">
        <div>
          <span className="section-kicker">The human behind the code</span>
          <SectionTitle text="保持好奇，持续构建。" />
        </div>
        <span className="mono section-index">A little about me ↙</span>
      </div>
      <div className="about-layout">
        <div className="about-copy">
          <DeveloperProfileCard />
          <p className="about-bio">{profile.bio}</p>
          <div className="focus-list">
            <span className="mono">Currently exploring</span>
            {profile.focus.map((item, index) => (
              <div key={item}>
                <span className="focus-number">0{index + 1}</span>
                {item}
                <ArrowUpRight size={15} />
              </div>
            ))}
          </div>
          <div className="about-facts">
            <div>
              <strong>
                {String(
                  projects.filter((project) => !project.isDemo).length,
                ).padStart(2, "0")}
              </strong>
              <span>网站作品 / MVP</span>
            </div>
            <div>
              <strong>{String(profile.focus.length).padStart(2, "0")}</strong>
              <span>关注方向</span>
            </div>
            <div>
              <strong>
                {competitions.length
                  ? String(competitions.length).padStart(2, "0")
                  : "—"}
              </strong>
              <span>
                {competitions.length ? "已录入竞赛经历" : "竞赛经历待补充"}
              </span>
            </div>
          </div>
        </div>
        <div className="about-console">
          <SkullPortrait />
          <Terminal />
        </div>
      </div>
    </section>
  );
}
function Competitions() {
  const entries = [...competitions, ...explorationPlans];
  return (
    <section id="competitions" className="section competitions-section">
      <EditorialHeading text={"WHAT’S\nNEXT."} />
      <div className="section-heading">
        <div>
          <span className="section-kicker">Always in beta</span>
          <SectionTitle text="下一站，更多可能。" />
        </div>
        <p>
          比赛是起点，
          <br />
          解决真实问题才是目的。
        </p>
      </div>
      <div className="timeline">
        {entries.map((entry, index) => (
          <article
            className={`timeline-row ${entry.status === "进行中" ? "in-progress" : ""}`}
            key={`${entry.title}-${index}`}
          >
            <div className="timeline-number mono">
              0{index + 1}
              <span />
            </div>
            <div className="timeline-title">
              <span className="section-kicker">{entry.type}</span>
              <h3>{entry.title}</h3>
            </div>
            <div className="timeline-description">
              <p>{entry.detail}</p>
              <span>{entry.role}</span>
            </div>
            <span className={`timeline-state state-${entry.status}`}>
              {entry.status}
            </span>
          </article>
        ))}
      </div>
      <p className="content-note">
        {competitions.length
          ? "参赛记录与探索计划分别标识；计划不作为已完成经历。"
          : "以上为关注方向与探索计划。尚未提供真实参赛记录或奖项。"}
      </p>
    </section>
  );
}
function Contact() {
  const [notice, setNotice] = useState("");
  return (
    <section id="contact" className="contact-section">
      <div className="contact-inner">
        <span className="section-kicker">Great things start with a hello.</span>
        <h2>
          <span className="editorial-line"><span className="editorial-line__inner">STAY CURIOUS.</span></span>
          <span className="editorial-line editorial-line--muted"><span className="editorial-line__inner">KEEP BUILDING.</span></span>
        </h2>
        <div className="contact-bottom">
          <p>
            {profile.tagline}
            <br />
            <span>下一个好想法，可能就来自我们的对话。</span>
          </p>
          <div className="contact-links">
            {profile.email ? (
              <a href={`mailto:${profile.email}`}>
                <Mail size={18} />
                {profile.email}
                <ArrowUpRight size={16} />
              </a>
            ) : (
              <button
                onClick={() =>
                  setNotice("邮箱待补充，可先在组队区域生成邀请草稿。")
                }
              >
                <Mail size={18} />
                Email<span>待配置</span>
              </button>
            )}
            {profile.github ? (
              <a href={profile.github} target="_blank" rel="noreferrer">
                <Github size={18} />
                GitHub
                <ArrowUpRight size={16} />
              </a>
            ) : null}
            <a href="#team">
              发起合作
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <p className="contact-notice" role="status">
          {notice}
        </p>
      </div>
      <footer>
        <a className="footer-brand" href="#home">
          {profile.alias}
          <span> / LAB</span>
        </a>
        <span>
          © {new Date().getFullYear()} {profile.alias}. Built to explore.
        </span>
        <a href="#home">
          返回顶部
          <ArrowUp size={16} />
        </a>
      </footer>
    </section>
  );
}
export default function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollExperience();
  useEditorialMotion();
  return (
    <>
      <a href="#main-content" className="skip-link">
        跳到主要内容
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <div className="post-hero-content" ref={contentRef}>
          <ContentParticles interactionRef={contentRef} />
          <div className="post-hero-foreground">
            <div className="manifesto-strip">
              <span>Curiosity is the starting point.</span>
              <Plus size={20} />
              <span>Code is how I explore.</span>
              <Plus size={20} />
              <span className="accent">Let’s build what’s next.</span>
            </div>
            <About />
            <VisualWall />
            <Projects />
            <MotionStudies />
            <Skills />
            <Competitions />
            <TeamInvite />
            <Contact />
          </div>
        </div>
      </main>
      <Cursor />
    </>
  );
}
