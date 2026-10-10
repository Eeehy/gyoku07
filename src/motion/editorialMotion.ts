import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionDesign as design } from "../data/motionDesign";

gsap.registerPlugin(ScrollTrigger);

type Chapter = { root: HTMLElement; title: gsap.core.Timeline; finish: () => void };
type Group = {
  nodes: HTMLElement[];
  timeline: gsap.core.Timeline;
  trigger: ScrollTrigger;
  parallax: gsap.core.Tween[];
  finish: () => void;
};
const played = new WeakSet<HTMLElement>();
const select = (selector: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<HTMLElement>(selector));

export function createEditorialMotion(openingRequested: boolean) {
  const desktop = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
  const distance = desktop ? design.desktopDistance : design.mobileDistance;
  const chapters = new Map<HTMLElement, Chapter>();
  const groups = new Set<Group>();
  const touched = new Set<HTMLElement>();
  const ctx = gsap.context(() => {});
  let projectContext: gsap.Context | undefined;
  let disposed = false;
  let refreshFrame = 0;
  let openingTimer = 0;
  let opening: gsap.core.Timeline | undefined;
  let pointerPressed = false;

  function completeOpening() {
    if (document.documentElement.dataset.opening === "complete") return;
    window.clearTimeout(openingTimer);
    window.removeEventListener("scroll", scroll);
    opening?.progress(1);
    document.documentElement.dataset.opening = "complete";
  }
  function scheduleRefresh() {
    if (disposed || refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      if (!disposed) ScrollTrigger.refresh();
    });
  }
  function mark(nodes: HTMLElement[], state: string) {
    nodes.forEach(node => { touched.add(node); node.dataset.editorialState = state; });
  }

  function installChapter(root: HTMLElement) {
    const words = select(".editorial-heading__word, .editorial-line__inner", root);
    const supporting = select(":scope > .section-heading, .team-status, .team-heading > p, .contact-inner > .section-kicker", root);
    if (!words.length) return;
    words.concat(supporting).forEach(node => touched.add(node));
    const title = gsap.timeline({ paused: true, defaults: { ease: design.ease }, onComplete: () => {
      played.add(root);
      mark([root], "complete");
      words.concat(supporting).forEach(node => node.style.removeProperty("will-change"));
    }});
    title.fromTo(words, {
      yPercent: 125, x: desktop ? -64 : -22, skewY: desktop ? 5 : 2,
      scaleX: .84, transformOrigin: "left bottom",
    }, {
      yPercent: 0, x: 0, skewY: 0, scaleX: 1,
      duration: design.chapter.title, stagger: .14, clearProps: "transform",
    }, 0);
    if (supporting.length) title.fromTo(supporting, { y: distance * .4, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: .95, clearProps: "transform,opacity,visibility",
    }, .36);
    const finish = () => { title.delay(0).progress(1); };
    const chapter = { root, title, finish };
    chapters.set(root, chapter);
    mark([root], "waiting");
    if (played.has(root) || root.getBoundingClientRect().bottom < 100 ||
      window.location.hash === `#${root.id}`) { finish(); return; }
    ScrollTrigger.create({
      id: `editorial-title-${root.id}`, trigger: words[0].parentElement,
      start: "top 85%", end: "bottom top", once: true,
      onEnter: () => {
        mark([root], "playing");
        words.concat(supporting).forEach(node => { node.style.willChange = "transform"; });
        title.play();
      },
      onLeave: finish,
    });
  }

  function installGroup(nodes: HTMLElement[], chapter: Chapter, stagger = design.chapter.stagger) {
    if (!nodes.length) return;
    const images = nodes.flatMap(node => select(".motion-image-shell, .film-study__frame", node));
    const timeline = gsap.timeline({ paused: true, defaults: { ease: design.ease }, onComplete: () => {
      nodes.forEach(node => { played.add(node); node.style.removeProperty("will-change"); });
      mark(nodes, "complete");
    }});
    timeline.fromTo(nodes, {
      y: distance, x: desktop ? 24 : 0, rotation: desktop ? 1.1 : 0,
      opacity: 0, transformOrigin: "left bottom",
    }, { y: 0, x: 0, rotation: 0, opacity: 1, stagger,
      duration: design.chapter.content, clearProps: "transform,opacity,visibility" }, 0);
    if (images.length) timeline.fromTo(images, { clipPath: "inset(0% 0% 100% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger,
      clearProps: "clipPath",
    }, .12);
    const finish = () => { timeline.delay(0).progress(1); };
    const parallax: gsap.core.Tween[] = [];
    const group = { nodes, timeline, parallax, finish } as Group;
    const begin = () => {
      if (nodes.every(node => played.has(node))) { finish(); return; }
      if (chapter.title.time() === 0) chapter.title.play();
      // A shared local clock guarantees title-first sequencing even when triggers fire together.
      const lead = Math.max(0, design.chapter.lead - chapter.title.time());
      nodes.forEach(node => { node.style.willChange = "transform,opacity"; });
      mark(nodes, "playing");
      timeline.delay(lead).play();
    };
    mark(nodes, "waiting");
    group.trigger = ScrollTrigger.create({
      id: `editorial-content-${chapter.root.id}`, trigger: nodes[0],
      start: "top 91%", end: "bottom top", once: true,
      onEnter: begin, onLeave: finish,
    });
    groups.add(group);
    const initialHash = window.location.hash === `#${chapter.root.id}`;
    if (nodes.every(node => played.has(node)) || nodes[0].getBoundingClientRect().bottom < 100 || initialHash)
      finish();

    if (desktop && chapter.root.id === "projects") {
      nodes.forEach(node => select(".motion-image-drift", node).forEach(image => {
        touched.add(image);
        const tween = gsap.fromTo(image,
          { yPercent: -design.parallax.travel / 2, scale: 1.045 },
          { yPercent: design.parallax.travel / 2, scale: 1.045, ease: "none",
            scrollTrigger: {
              id: "editorial-image-parallax", trigger: node,
              start: "top bottom", end: "bottom top", scrub: design.parallax.scrub,
              onToggle: self => { image.style.willChange = self.isActive ? "transform" : "auto"; },
            },
          });
        parallax.push(tween);
      }));
    }
  }

  function installProjectGroups() {
    const root = document.getElementById("projects");
    if (!root) return;
    const chapter = chapters.get(root);
    if (!chapter) return;
    const existing = new Set([...groups].flatMap(group => group.nodes));
    const cards = select(".project-card", root).filter(card => !existing.has(card));
    if (cards[0]?.classList.contains("featured")) installGroup([cards.shift()!], chapter);
    for (let index = 0; index < cards.length; index += desktop ? 2 : 1)
      installGroup(cards.slice(index, index + (desktop ? 2 : 1)), chapter);
  }

  function rebuildProjectGroups() {
    // Dynamic cards own an independent context. Revert and drop it as a whole,
    // so old timelines / DOM references never accumulate in the page context.
    groups.forEach(group => {
      if (group.nodes.some(node => node.classList.contains("project-card"))) groups.delete(group);
    });
    projectContext?.revert();
    touched.forEach(node => {
      if (node.classList.contains("project-card") || node.classList.contains("motion-image-drift")) {
        delete node.dataset.editorialState;
        node.style.removeProperty("will-change");
        touched.delete(node);
      }
    });
    projectContext = gsap.context(installProjectGroups);
  }

  const projectGrid = document.querySelector(".project-grid");
  const mutation = new MutationObserver(() => {
    rebuildProjectGroups();
    scheduleRefresh();
  });
  const dimensions = new WeakMap<Element, string>();
  const resize = new ResizeObserver(entries => {
    let changed = false;
    entries.forEach(entry => {
      const next = `${Math.round(entry.contentRect.width)}:${Math.round(entry.contentRect.height)}`;
      if (dimensions.get(entry.target) !== next) { dimensions.set(entry.target, next); changed = true; }
    });
    if (changed) scheduleRefresh();
  });

  function focus(event: FocusEvent) {
    // Do not jump an animated button between pointer-down and pointer-up.
    // Keyboard / programmatic navigation can safely resolve the local reveal.
    if (pointerPressed) return;
    completeOpening();
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const section = target.closest<HTMLElement>("section");
    if (section) chapters.get(section)?.finish();
    groups.forEach(group => { if (group.nodes.some(node => node.contains(target))) group.finish(); });
  }
  function scroll() { if (window.scrollY > 30 && document.documentElement.dataset.opening !== "complete") completeOpening(); }
  function visibility() { if (document.hidden) completeOpening(); }
  function pointer() { pointerPressed = true; }
  function releasePointer() { pointerPressed = false; }
  function keyboard(event: KeyboardEvent) { if (event.key === "Tab") releasePointer(); }

  try {
    ctx.add(() => {
      const canOpen = openingRequested && window.scrollY < 40 &&
        (!window.location.hash || window.location.hash === "#home");
      if (canOpen) {
        document.documentElement.dataset.opening = "running";
        opening = gsap.timeline({ defaults: { ease: design.ease }, onComplete: () => {
          document.documentElement.dataset.opening = "complete";
          window.clearTimeout(openingTimer);
          window.removeEventListener("scroll", scroll);
        }});
        opening.fromTo(".hero-opening__signature", { yPercent: 110, scaleX: .82 }, { yPercent: 0, scaleX: 1, duration: .85 }, 0)
          .fromTo(".hero-opening__rule", { scaleX: 0 }, { scaleX: 1, duration: .8 }, .1)
          .to(".hero-opening__signature", { yPercent: -115, scaleY: .62, duration: .65, ease: "power3.in" }, .68)
          .to(".hero-opening__caption, .hero-opening__rule", { autoAlpha: 0, duration: .3 }, .7)
          .to(".hero-opening__panels i", { yPercent: -102, duration: design.opening.curtain, stagger: .12, ease: design.curtainEase }, .6)
          .fromTo(".horizon-background", { scale: 1.13 }, { scale: 1, duration: 2.8, clearProps: "transform" }, .2)
          .fromTo(".cinematic-nav-inner", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, clearProps: "transform,opacity" }, .65)
          .fromTo(".horizon-eyebrow", { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, clearProps: "transform,opacity,visibility" }, 1)
          .fromTo(".hero-title-reveal", { yPercent: 125, x: -32, scaleX: .82, skewY: 4, transformOrigin: "left bottom" },
            { yPercent: 0, x: 0, scaleX: 1, skewY: 0, duration: design.opening.title, stagger: .18, clearProps: "transform" }, 1.08)
          .fromTo(".horizon-description", { y: 42, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, clearProps: "transform,opacity,visibility" }, 1.65)
          .fromTo(".horizon-actions > a", { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.05, stagger: .16, clearProps: "transform,opacity,visibility" }, 1.92)
          .fromTo(".horizon-bottom", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .9, clearProps: "transform,opacity" }, 2.25);
        openingTimer = window.setTimeout(completeOpening, (design.opening.duration + 1.5) * 1000);
      } else document.documentElement.dataset.opening = "complete";

      select(".post-hero-foreground > section").forEach(root => {
        installChapter(root);
        resize.observe(root);
      });
      chapters.forEach(chapter => {
        const root = chapter.root;
        const selectors: Record<string, string[][]> = {
          about: [[".developer-profile", ".skull-portrait"], [".about-bio", ".terminal"], [".focus-list"], [".about-facts"]],
          gallery: [[".visual-wall__stage"], [".visual-wall__footer"]],
          films: [[".film-study"], [".motion-studies__footer"]],
          stack: [[".skill-network", ".skill-detail"]],
          competitions: [[".timeline-row"], [".content-note"]],
          team: [[".team-info", ".invite-form"]],
          contact: [[".contact-bottom"], ["footer"]],
        };
        (selectors[root.id] || []).forEach(batch => {
          const nodes = batch.flatMap(selector => select(selector, root));
          if (root.id === "competitions") nodes.forEach((node, index) => installGroup([node], chapter, index * .06));
          else installGroup(nodes, chapter);
        });
      });
    });
    rebuildProjectGroups();
    if (projectGrid) mutation.observe(projectGrid, { childList: true });
    document.fonts.ready.then(() => { if (!disposed) scheduleRefresh(); });
    if (opening && document.documentElement.dataset.opening === "running")
      window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("hashchange", completeOpening);
    document.addEventListener("focusin", focus);
    document.addEventListener("pointerdown", pointer, { passive: true, capture: true });
    document.addEventListener("pointerup", releasePointer, { passive: true, capture: true });
    document.addEventListener("pointercancel", releasePointer, { passive: true, capture: true });
    document.addEventListener("keydown", keyboard, true);
    document.addEventListener("visibilitychange", visibility);
    scheduleRefresh();
  } catch (error) {
    disposed = true;
    projectContext?.revert();
    ctx.revert();
    document.documentElement.dataset.opening = "complete";
    resize.disconnect(); mutation.disconnect();
    window.clearTimeout(openingTimer); cancelAnimationFrame(refreshFrame);
    throw error;
  }

  return () => {
    disposed = true;
    window.clearTimeout(openingTimer);
    cancelAnimationFrame(refreshFrame);
    resize.disconnect(); mutation.disconnect();
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("hashchange", completeOpening);
    document.removeEventListener("focusin", focus);
    document.removeEventListener("pointerdown", pointer, true);
    document.removeEventListener("pointerup", releasePointer, true);
    document.removeEventListener("pointercancel", releasePointer, true);
    document.removeEventListener("keydown", keyboard, true);
    document.removeEventListener("visibilitychange", visibility);
    projectContext?.revert();
    ctx.revert();
    touched.forEach(node => { delete node.dataset.editorialState; node.style.removeProperty("will-change"); });
    document.documentElement.dataset.opening = "complete";
  };
}
