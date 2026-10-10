import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { profile } from "../data/portfolio";

const links = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "team", label: "Team Up" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let lastFloating = false;
    let heroEnd = window.innerHeight;
    const update = () => {
      const nextFloating = window.scrollY >= heroEnd - 1;
      if (nextFloating !== lastFloating) {
        lastFloating = nextFloating;
        setFloating(nextFloating);
      }
    };
    const measure = () => {
      const hero = document.getElementById("home");
      heroEnd = hero
        ? hero.getBoundingClientRect().bottom + window.scrollY
        : window.innerHeight;
      update();
    };
    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <header
      className={`cinematic-header${floating ? " is-floating" : ""}`}
    >
      <div className="cinematic-announcement">
        A NEW IDEA BEGINS HERE <ArrowRight size={12} strokeWidth={1.3} />
      </div>
      <div className="cinematic-nav-shell">
        <div className="cinematic-nav-inner">
          <a
            className="cinematic-brand"
            href="#home"
            aria-label={`${profile.alias} 返回首页`}
          >
            <svg viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <path
                d="M5 20V6h15M5 13h12M5 20h15"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="m21 5-3 3m3 10-3 3"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            <span>{profile.alias}</span>
          </a>
          <nav
            id="main-navigation"
            className={`cinematic-nav${open ? " is-open" : ""}`}
            aria-label="主导航"
          >
            {links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              className="cinematic-mobile-contact"
              href="#contact"
              onClick={() => setOpen(false)}
            >
              Let’s Connect <ArrowUpRight size={15} />
            </a>
          </nav>
          <div className="cinematic-nav-actions">
            <a className="cinematic-connect magnetic" href="#contact">
              Let’s Connect <ArrowUpRight size={14} strokeWidth={1.5} />
            </a>
            <button
              ref={toggle}
              className="cinematic-menu"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="main-navigation"
              aria-label={open ? "关闭导航" : "打开导航"}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
