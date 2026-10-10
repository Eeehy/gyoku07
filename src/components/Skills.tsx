import { useState } from "react";
import {
  ArrowUpRight,
  Braces,
  Cpu,
  Database,
  GitBranch,
  Layers3,
  Wrench,
} from "lucide-react";
import { profile, projects, skillGroups } from "../data/portfolio";
import SectionTitle from "./SectionTitle";
import EditorialHeading from "./EditorialHeading";
const icons = [Braces, Layers3, Database, Cpu, Wrench, GitBranch];
export default function Skills() {
  const [selected, setSelected] = useState(1);
  const active = skillGroups[selected];
  return (
    <section id="stack" className="section stack-section">
      <EditorialHeading text={"TECH &\nTOOLS."} />
      <div className="section-heading">
        <div>
          <span className="section-kicker">Tools for the next idea</span>
          <SectionTitle text={"技术是工具，\n创造才是目的。"} />
        </div>
        <p>
          连接不同领域，
          <br />
          构建自己的技术坐标。
        </p>
      </div>
      <div className="stack-layout">
        <div className="skill-network">
          <svg
            viewBox="0 0 600 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M300 210L135 85M300 210L435 65M300 210L515 210M300 210L435 340M300 210L155 340M300 210L75 210M135 85L435 65L515 210L435 340L155 340L75 210Z" />
          </svg>
          <div className="network-core">
            <span>{profile.alias.slice(0, 1)}</span>
            <small className="mono">CORE</small>
          </div>
          {skillGroups.map((group, index) => {
            const Icon = icons[index];
            return (
              <button
                key={group.id}
                className={`skill-node node-${index} ${selected === index ? "active" : ""}`}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <Icon size={20} />
                <span>{group.label}</span>
              </button>
            );
          })}
          <span className="network-note mono">SELECT A NODE TO EXPLORE</span>
        </div>
        <div className="skill-detail" aria-live="polite">
          <span className="section-kicker">{active.label}</span>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          <div className="tech-pills">
            {active.technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
          <div className="related-projects">
            <span className="mono">Connected projects</span>
            {active.projectIds.map((id) => {
              const project = projects.find((item) => item.id === id);
              return project ? (
                <a href="#projects" key={id}>
                  {project.title}
                  <span>
                    {project.isDemo ? "示例" : "MVP"} <ArrowUpRight size={15} />
                  </span>
                </a>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
