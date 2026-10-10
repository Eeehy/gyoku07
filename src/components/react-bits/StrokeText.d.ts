import type { CSSProperties, ComponentType } from "react";

export interface StrokeTextProps {
  text?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  trigger?: "mount" | "scroll" | "hover" | "loop";
  fillMode?: "wipe" | "fade" | "none";
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  reverse?: boolean;
  className?: string;
  style?: CSSProperties;
}

declare const StrokeText: ComponentType<StrokeTextProps>;
export default StrokeText;
