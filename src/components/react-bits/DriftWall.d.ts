import type { CSSProperties, ComponentType } from "react";
export interface DriftWallItem { image: string; title?: string; href?: string }
export interface DriftWallProps {
  items: DriftWallItem[];
  columns?: number; tileWidth?: number; tileHeight?: number; gap?: number;
  radius?: number; tilt?: number; turn?: number; roll?: number;
  perspective?: number; depth?: number; speed?: number;
  direction?: "up" | "down"; variance?: number; parallax?: number;
  pauseOnHover?: boolean; lift?: number; fade?: number; dim?: number;
  grayscale?: boolean; overlayColor?: string;
  className?: string; style?: CSSProperties;
  enabled?: boolean; decorative?: boolean; fallbackSrc?: string;
}
declare const DriftWall: ComponentType<DriftWallProps>;
export default DriftWall;
