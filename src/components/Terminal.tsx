import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { CornerDownLeft, Terminal as TerminalIcon } from "lucide-react";
import { profile, projects, skillGroups } from "../data/portfolio";
type Entry = { command: string; output: string };
export default function Terminal() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([
    {
      command: "whoami",
      output: `${profile.alias} — ${[profile.university, profile.degree].filter(Boolean).join(" / ")}\n${profile.tagline}\n${profile.focus.join(" / ")}${profile.namePending ? "\n真实姓名待补充。" : ""}`,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const output = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [entries]);
  function execute(raw: string) {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    if (command === "clear") {
      setEntries([]);
      setInput("");
      return;
    }
    const commands: Record<string, string> = {
      help: "可用命令：whoami / skills / projects / contact / help / clear\n使用 ↑ ↓ 查看命令历史；Tab 自动补全。",
      whoami: `${profile.alias} — ${profile.degree}\n${profile.bio}\n姓名：${profile.name}${profile.namePending ? "（待补充）" : ""}${profile.university ? `\n学校：${profile.university}` : ""}`,
      skills:
        skillGroups
          .map((group) => `${group.label}: ${group.technologies.join(", ")}`)
          .join("\n") + "\n技术目录含学习方向占位，不代表已验证的个人经验。",
      projects:
        projects
          .map(
            (project) =>
              `${project.title} [${project.isDemo ? "概念示例" : "本网站 MVP"}]`,
          )
          .join("\n") + "\n完整介绍 → 页面「精选项目」区域。",
      contact: `Email: ${profile.email || "待配置"}${profile.github ? `\nGitHub: ${profile.github}` : ""}\n组队状态：${profile.openToTeam ? "开放邀请" : "暂不接受"}\n可在「一起创造」区域生成邀请草稿。`,
    };
    setEntries((previous) => [
      ...previous.slice(-39),
      {
        command: raw.trim(),
        output:
          commands[command] ||
          `未找到命令：${raw.trim()}\n输入 help 查看可用命令。`,
      },
    ]);
    setInput("");
    setHistoryIndex(-1);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    execute(input);
  }
  function keyboard(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const next =
        event.key === "ArrowUp"
          ? Math.min(historyIndex + 1, entries.length - 1)
          : Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(
        next < 0 ? "" : entries[entries.length - 1 - next]?.command || "",
      );
    }
    if (event.key === "Tab" && input) {
      const matches = [
        "whoami",
        "skills",
        "projects",
        "contact",
        "help",
        "clear",
      ].filter((command) => command.startsWith(input));
      if (matches.length === 1) {
        event.preventDefault();
        setInput(matches[0]);
      }
    }
  }
  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span className="mono">{profile.alias.toLowerCase()}@localhost: ~</span>
        <TerminalIcon size={15} />
      </div>
      <div
        className="terminal-body"
        ref={output}
        role="log"
        tabIndex={0}
        aria-label="终端输出"
        aria-live="polite"
      >
        <p className="terminal-welcome">
          {profile.alias} terminal v1.0
          <br />
          <span>你好，探索者。输入 help，开始认识我。</span>
        </p>
        {entries.map((entry, index) => (
          <div className="terminal-entry" key={index}>
            <p>
              <span className="terminal-prompt">visitor ~ $</span>{" "}
              {entry.command}
            </p>
            <pre>{entry.output}</pre>
          </div>
        ))}
      </div>
      <form className="terminal-input" onSubmit={submit}>
        <label htmlFor="terminal-command" className="terminal-prompt">
          visitor ~ $
        </label>
        <input
          id="terminal-command"
          ref={field}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={keyboard}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="输入命令…"
          aria-label="终端命令"
        />
        <button type="submit" aria-label="执行命令">
          <CornerDownLeft size={16} />
        </button>
      </form>
      <div className="terminal-shortcuts">
        {["whoami", "skills", "projects", "contact"].map((command) => (
          <button
            key={command}
            onClick={() => {
              execute(command);
              field.current?.focus({ preventScroll: true });
            }}
          >
            {command}
          </button>
        ))}
      </div>
    </div>
  );
}
