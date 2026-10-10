import { useLayoutEffect } from "react";

let openingSeen = false;

export function useEditorialMotion() {
  useLayoutEffect(() => {
    // Native fragment navigation runs before this client-rendered DOM exists.
    // Land before the first paint / viewport observers, including reduced motion.
    const initialId = window.location.hash.slice(1);
    if (initialId && initialId !== "home" && window.scrollY < 40)
      document.getElementById(initialId)?.scrollIntoView({ behavior: "instant", block: "start" });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    let disposed = false;
    let generation = 0;
    let teardown: (() => void) | undefined;
    let watchdog = 0;
    const clearPending = () => {
      window.clearTimeout(watchdog);
      if (document.documentElement.dataset.opening === "pending")
        document.documentElement.dataset.opening = "complete";
    };
    const initialize = () => {
      const current = ++generation;
      teardown?.();
      teardown = undefined;
      clearPending();
      if (preference.matches) return;
      const opening = !openingSeen && window.scrollY < 40 &&
        (!window.location.hash || window.location.hash === "#home");
      if (opening) {
        document.documentElement.dataset.opening = "pending";
        // A failed or slow optional import never hides the usable page indefinitely.
        watchdog = window.setTimeout(clearPending, 1600);
      }
      void import("../motion/editorialMotion").then(({ createEditorialMotion }) => {
        if (disposed || current !== generation || preference.matches) return;
        const runOpening = opening && document.documentElement.dataset.opening === "pending";
        clearPending();
        if (runOpening) openingSeen = true;
        teardown = createEditorialMotion(runOpening);
      }).catch(() => {
        if (disposed || current !== generation) return;
        clearPending();
        document.documentElement.dataset.opening = "complete";
      });
    };
    initialize();
    preference.addEventListener("change", initialize);
    desktop.addEventListener("change", initialize);
    return () => {
      disposed = true;
      ++generation;
      clearPending();
      teardown?.();
      preference.removeEventListener("change", initialize);
      desktop.removeEventListener("change", initialize);
    };
  }, []);
}
