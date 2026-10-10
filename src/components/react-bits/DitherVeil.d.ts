import type { CSSProperties, ComponentType } from "react";

export interface DitherVeilProps {
  src?: string;
  fit?: "contain" | "cover";
  pattern?: "floyd" | "atkinson" | "bayer" | "noise" | "lines";
  pixelSize?: number;
  levels?: number;
  palette?: "duotone" | "rgb";
  inkColor?: string;
  paperColor?: string;
  contrast?: number;
  brightness?: number;
  revealRadius?: number;
  softness?: number;
  linger?: number;
  rimColor?: string;
  rim?: number;
  reverse?: boolean;
  wander?: boolean;
  clickBurst?: boolean;
  maxPixelRatio?: number;
  className?: string;
  style?: CSSProperties;
  onError?: (error: unknown) => void;
}
declare const DitherVeil: ComponentType<DitherVeilProps>;
export default DitherVeil;
