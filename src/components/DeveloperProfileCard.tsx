import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import { profile } from "../data/portfolio";
import { profileCardAppearance } from "../data/profileCard";
import { useDocumentVisible, useMedia } from "../hooks/useExperience";
import "./DeveloperProfileCard.css";

const ProfileCard = lazy(() => import("./react-bits/ProfileCard"));
const displayName = profile.namePending ? profile.alias : `${profile.alias} / ${profile.name}`;
const identity = [profile.university, profile.degree].filter(Boolean).join(" · ");
const contactHref = profile.email
  ? `mailto:${profile.email}?subject=${encodeURIComponent(`竞赛组队邀请 / ${profile.alias}`)}`
  : "#team";
const contactText = profile.email ? "联系我 ↗" : "聊聊组队 ↗";
const status = profile.openToTeam ? "开放组队" : "暂不开放组队";

class ProfileBoundary extends Component<
  { children: ReactNode; onFailure: () => void }, { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function avatarFallback(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallback !== "true") {
    image.dataset.fallback = "true";
    image.src = profileCardAppearance.fallbackAvatarUrl;
  } else image.style.visibility = "hidden";
}

function StaticProfile() {
  return <div className="developer-profile__fallback">
    <h3>{displayName}</h3>
    <p>{identity}</p>
    <img src={profile.avatar || profileCardAppearance.fallbackAvatarUrl}
      alt={`${profile.alias} 的头像`} loading="lazy" decoding="async" onError={avatarFallback} />
    <div><span>{status}</span><a href={contactHref}>{contactText}</a></div>
  </div>;
}

export default function DeveloperProfileCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktop = useMedia("(min-width: 768px) and (pointer: fine)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const visible = useDocumentVisible();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  const interactive = desktop && !reduced && inView && visible;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); preload.disconnect(); }
    }, { rootMargin: "160px 0px" });
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    preload.observe(container);
    visibility.observe(container);
    return () => { preload.disconnect(); visibility.disconnect(); };
  }, []);

  return <div ref={containerRef} className={`developer-profile${interactive ? " is-interactive" : ""}`}>
    {near && !failed ? <ProfileBoundary onFailure={() => setFailed(true)}>
      <Suspense fallback={<StaticProfile />}>
        <ProfileCard {...profileCardAppearance} name={displayName} title={identity}
          handle={profile.alias} status={status}
          avatarUrl={profile.avatar || profileCardAppearance.fallbackAvatarUrl}
          contactText={contactText} contactHref={contactHref}
          contactLabel={profile.email ? `通过邮箱联系 ${profile.alias}` : "前往组队邀请"}
          enableTilt={interactive} />
      </Suspense>
    </ProfileBoundary> : <StaticProfile />}
  </div>;
}
