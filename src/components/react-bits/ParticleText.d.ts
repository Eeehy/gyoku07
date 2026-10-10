import type { ComponentType, CSSProperties, RefObject } from "react";
export interface ParticleTextProps {
  text?: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: "mount" | "hover" | "click";
  fontSize?: number | string;
  fontWeight?: number;
  fontFamily?: string;
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
  letterSpacing?: number;
  textOffsetX?: number;
  interactionRef?: RefObject<HTMLElement | null>;
  onReady?: () => void;
  onError?: (error: unknown) => void;
}
declare const ParticleText: ComponentType<ParticleTextProps>;
export default ParticleText;
