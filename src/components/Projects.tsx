import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  X,
  Layers,
  Orbit,
  ScanLine,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { profile, projects } from "../data/portfolio";
import type { Project } from "../data/portfolio";
import SectionTitle from "./SectionTitle";
import ProjectParticleTitle from "./ProjectParticleTitle";
import EditorialHeading from "./EditorialHeading";

export function ProjectVisual({ project }: { project: Project }) {
  if (project.cover)
    return (
      <img
        src={project.cover}
        alt={`${project.title}项目界面`}
        loading="lazy"
      />
    );
  return (
    <div
      className={`project-art art-${project.visual}`}
      aria-label={`${project.title}的演示视觉占位`}
    >
      <span className="art-caption mono">
        {project.isDemo
          ? "Concept interface / 演示占位"
          : `${profile.alias} / live experiment`}
      </span>
      {project.visual === "space" ? (
        <>
          <div className="art-orbit">
            <Orbit strokeWidth={0.65} />
          </div>
          <span className="art-large">
            {profile.alias.slice(0, 1)}
            <span> / </span>
          </span>
          <div className="art-bottom mono">
            THE NEXT IDEA
            <br />
            STARTS HERE.
          </div>
        </>
      ) : project.visual === "ai" ? (
        <>
          <div className="ai-window">
            <div className="ai-sidebar">
              <Layers size={18} />
              <i />
              <i />
              <i />
            </div>
            <div className="ai-content">
              <span className="ai-brand">
                context<span>_</span>
              </span>
              <p>Connect the dots.</p>
              <div className="ai-search">
                <ScanLine size={15} /> Ask your knowledge…
              </div>
              <div className="ai-lines">
                <i />
                <i />
                <i />
              </div>
              <div className="ai-sources">
                <span>Source 01</span>
                <span>Source 02</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flow-window">
            <div className="flow-top">
              <span>
                co<span>lab</span>
              </span>
              <span className="mono">Workspace / Demo</span>
            </div>
            <div className="flow-columns">
              {["Ideas", "Building", "Shipped"].map((name, i) => (
                <div key={name}>
                  <small>
                    {name} <span>0{i + 1}</span>
                  </small>
                  <div className="flow-task">
                    <i />
                    <b>
                      {
                        [
                          "A new beginning",
                          "Make it happen",
                          "Ready to explore",
                        ][i]
                      }
                    </b>
                    <span>Concept task</span>
                    <div className="flow-avatar">N</div>
                  </div>
                  {i !== 2 && (
                    <div className="flow-task short">
                      <i />
                      <b>{i === 0 ? "Find your people" : "Connect the dots"}</b>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <span className="art-cross">+</span>
    </div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState("全部");
  const [selected, setSelected] = useState<Project | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selected]);
  const filtered = projects.filter(
    (project) =>
      filter === "全部" ||
      (filter === "AI 应用"
        ? project.visual === "ai"
        : project.visual !== "ai"),
  );
  function tilt(event: MouseEvent<HTMLButtonElement>) {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--rx",
      `${(-(event.clientY - bounds.top - bounds.height / 2) / bounds.height) * 5}deg`,
    );
    event.currentTarget.style.setProperty(
      "--ry",
      `${((event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 5}deg`,
    );
  }
  return (
    <section id="projects" className="section projects-section">
      <EditorialHeading text={"SELECTED\nWORK."} />
      <div className="section-heading">
        <div>
          <span className="section-kicker">Selected work</span>
          <SectionTitle text="想法，落地成作品。" />
        </div>
        <p>
          从一个问题开始，
          <br />
          用设计与代码给出回答。
        </p>
      </div>
      <div className="project-toolbar">
        <div role="group" aria-label="筛选项目">
          {["全部", "AI 应用", "软件与交互"].map((item) => (
            <button
              key={item}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={filter === item ? "active" : ""}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="mono">
          {String(filtered.length).padStart(2, "0")} projects / ongoing
          exploration
        </span>
      </div>
      <div className="project-grid">
        {filtered.map((project, index) => (
          <article
            className={`project-card ${index === 0 ? "featured" : ""}`}
            key={project.id}
          >
            <button
              className="project-cover"
              onClick={() => setSelected(project)}
              onMouseMove={tilt}
              onMouseLeave={(event) => {
                event.currentTarget.style.setProperty("--rx", "0deg");
                event.currentTarget.style.setProperty("--ry", "0deg");
              }}
              aria-label={`查看${project.title}详情`}
            >
              <div className="motion-image-shell"><div className="motion-image-drift"><ProjectVisual project={project} /></div></div>
              <span className="project-open">
                <ArrowUpRight size={25} />
              </span>
            </button>
            <div className="project-meta">
              <span className="mono">{project.category}</span>
              <span
                className={`project-status ${project.isDemo ? "demo" : ""}`}
              >
                {project.status}
              </span>
            </div>
            <button
              className="project-title"
              onClick={() => setSelected(project)}
            >
              <ProjectParticleTitle text={project.title} />
              <ArrowUpRight size={22} />
            </button>
            <p>{project.subtitle}</p>
            <div className="tags">
              {project.stack.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <p className="content-note">
        真实项目持续补充中。标有「概念示例」的内容与封面为演示占位。
      </p>
      <dialog
        ref={dialog}
        className="project-dialog"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
            'button, a[href], input, textarea, select, [tabindex="0"]',
          );
          const first = focusable[0],
            last = focusable[focusable.length - 1];
          if (!first) return;
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              setSelected(null);
          }
        }}
        aria-labelledby="project-dialog-title"
      >
        {selected && (
          <>
            <button
              className="dialog-close"
              autoFocus
              onClick={() => setSelected(null)}
              aria-label="关闭项目详情"
            >
              <X />
            </button>
            <ProjectVisual project={selected} />
            <div className="dialog-content">
              <span className="section-kicker">
                {selected.isDemo ? "概念示例 · 非真实经历" : "本站作品 · MVP"}
              </span>
              <h2 id="project-dialog-title">{selected.title}</h2>
              <p>{selected.description}</p>
              <div className="tags">
                {selected.stack.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="project-details">
                <div>
                  <h3>项目职责</h3>
                  <p>{selected.role}</p>
                </div>
                <div>
                  <h3>技术思考</h3>
                  <p>{selected.challenge}</p>
                </div>
                <div>
                  <h3>当前成果</h3>
                  <p>{selected.outcome}</p>
                </div>
              </div>
              <div className="dialog-links">
                {selected.github ? (
                  <a
                    className="button secondary"
                    href={selected.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github size={16} />
                    查看代码
                  </a>
                ) : (
                  <span>仓库链接待补充</span>
                )}
                {selected.demo ? (
                  <a
                    className="button primary"
                    href={selected.demo}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                    在线演示
                  </a>
                ) : (
                  <span>演示链接待补充</span>
                )}
              </div>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
