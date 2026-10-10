export interface Film {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  src: string;
  poster: string;
}

// User-provided films. This collection is separate from project / competition records.
export const films: Film[] = [
  {
    id: "controlled-experiment",
    title: "Eeehy / Controlled Experiment",
    category: "01 — MOTION & VISUAL SYSTEMS",
    description: "文字、形态与节奏。一段关于 Eeehy 的动态视觉表达。",
    duration: "00:15",
    src: "/videos/eeehy-controlled-experiment.mp4",
    poster: "/images/eeehy-film-poster.webp",
  },
  {
    id: "clawd-shihao",
    title: "Clawd / 嗜好",
    category: "02 — ANIMATED STORY",
    description: "跟随 Clawd 走过雨夜与回忆，用水彩画面讲述一段音乐故事。",
    duration: "01:36",
    src: "/videos/clawd-shihao.mp4",
    poster: "/images/clawd-film-poster.webp",
  },
];
