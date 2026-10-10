import type { DriftWallItem, DriftWallProps } from "../components/react-bits/DriftWall";

// 本站实录、明确标注的界面概念与数字艺术；不作为个人项目成果或履历。
export const driftWallImages: DriftWallItem[] = [
  { image: "/images/drift-wall/portfolio-hero.webp", title: "本站首屏设计" },
  { image: "/images/drift-wall/ai-concept.webp", title: "AI 知识助手 · 概念界面" },
  { image: "/images/drift-wall/digital-horizon.webp", title: "数字天际线 · 视觉实验" },
  { image: "/images/drift-wall/collab-concept.webp", title: "协作工作台 · 概念界面" },
  { image: "/images/drift-wall/skull-portrait.webp", title: "数字雕塑 · 视觉实验" },
  { image: "/images/drift-wall/digital-lab.webp", title: "本站数字实验室" },
];

// 每列至少两种画面，避免六张素材分到五列后出现整列单图。
export const driftWallItems = [...driftWallImages, ...driftWallImages.slice(0, 4)];

export const driftWallSettings = {
  columns: 5, tileWidth: 200, tileHeight: 132, gap: 18,
  tilt: 16, turn: -14, perspective: 1200, depth: 120,
  speed: 42, direction: "up", variance: 0.45, parallax: 0.6,
  lift: 64, fade: 0.6, dim: 0.55, overlayColor: "#060010",
  pauseOnHover: false,
} satisfies Omit<DriftWallProps, "items">;
