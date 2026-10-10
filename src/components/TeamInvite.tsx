import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail, Sparkles } from "lucide-react";
import { profile, team } from "../data/portfolio";
export default function TeamInvite() {
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [direction, setDirection] = useState(team.directions[0]);
  const [message, setMessage] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copyState, setCopyState] = useState("");
  const result = useRef<HTMLTextAreaElement>(null);
  const subject = `竞赛组队邀请｜${direction}｜${name}`;
  const draft = useMemo(
    () =>
      `你好，${profile.alias}！\n\n我是${name}，想邀请你一起参与「${direction}」。\n\n项目 / 比赛想法：\n${message}\n\n我的联系方式：${replyTo}\n\n期待一起把想法变成作品！`,
    [name, direction, message, replyTo],
  );
  function generate(event: FormEvent) {
    event.preventDefault();
    setGenerated(true);
    setCopyState("");
    window.setTimeout(() => result.current?.focus({ preventScroll: true }), 50);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(`主题：${subject}\n\n${draft}`);
      setCopyState("已复制邀请内容");
    } catch {
      result.current?.focus();
      result.current?.select();
      setCopyState("请按 Ctrl+C 或长按复制已选中的内容");
    }
  }
  return (
    <section id="team" className="section team-section">
      <div className="team-heading">
        <span className="team-status">
          <span className="status-dot" />
          {profile.openToTeam
            ? "Open to collaboration / 开放组队"
            : "暂不接受新的组队邀请"}
        </span>
        <h2>
          <span className="editorial-line"><span className="editorial-line__inner">LET’S BUILD</span></span>
          <span className="editorial-line"><span className="editorial-line__inner">SOMETHING</span></span>
          <span className="editorial-line editorial-line--accent"><span className="editorial-line__inner">EXTRAORDINARY.</span></span>
          <Sparkles className="team-spark" strokeWidth={0.8} />
        </h2>
        <p>
          寻找志同道合的开发者，
          <br />
          一起把想法变成真正的作品。
        </p>
      </div>
      <div className="team-grid">
        <div className="team-info">
          <h3>
            下一场比赛，
            <br />
            我们可以并肩作战。
          </h3>
          <p>
            {team.summary}
            <br />
            想法还不成熟也没关系，我们可以一起打磨。
          </p>
          <div className="team-info-block">
            <span>我想带来的</span>
            <ul>
              {team.contribution.map((item) => (
                <li key={item}>
                  <Check size={15} />
                  {item}
                </li>
              ))}
            </ul>
            <small>{team.contributionNote}</small>
          </div>
          <div className="team-info-block">
            <span>寻找这样的你</span>
            <div className="tags">
              {team.roles.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="team-info-block">
            <span>一起工作的方式</span>
            <p>{team.modes.join(" / ")}</p>
          </div>
        </div>
        <form className="invite-form" onSubmit={generate}>
          <div className="form-heading">
            <Mail size={20} />
            <h3>发起一次连接</h3>
            <span className="mono">01 → HELLO</span>
          </div>
          <div className="form-row">
            <label>
              怎么称呼你
              <input
                name="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setGenerated(false);
                }}
                required
                maxLength={60}
                autoComplete="name"
                placeholder="你的姓名 / 代号"
              />
            </label>
            <label>
              你的联系邮箱
              <input
                name="email"
                type="email"
                value={replyTo}
                onChange={(event) => {
                  setReplyTo(event.target.value);
                  setGenerated(false);
                }}
                required
                maxLength={160}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <label>
            想一起探索的方向
            <select
              value={direction}
              onChange={(event) => {
                setDirection(event.target.value);
                setGenerated(false);
              }}
            >
              {team.directions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            聊聊你的想法
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setGenerated(false);
              }}
              required
              minLength={10}
              maxLength={2000}
              rows={3}
              placeholder="比赛、项目想法、你的方向，以及希望如何合作…"
            />
          </label>
          <button
            className="button primary invite-submit"
            type="submit"
            disabled={!profile.openToTeam}
          >
            生成组队邀请 <ArrowUpRight size={19} />
          </button>
          <p className="form-note">
            {profile.email
              ? "生成草稿后可打开邮件客户端发送。"
              : "联系方式待补充。当前可生成、复制邀请草稿，表单不会发送或上传信息。"}
          </p>
          {generated && (
            <div className="invite-result" role="status">
              <h4>邀请草稿已准备好</h4>
              <textarea
                ref={result}
                readOnly
                value={`主题：${subject}\n\n${draft}`}
                rows={7}
                aria-label="生成的组队邀请草稿"
              />
              <div className="draft-actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={copy}
                >
                  <Copy size={15} />
                  复制邀请
                </button>
                {profile.email && (
                  <a
                    className="button primary"
                    href={`mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`}
                  >
                    <Mail size={15} />
                    打开邮件
                  </a>
                )}
              </div>
              {copyState && <p>{copyState}</p>}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
