import type { ComponentType, RefObject } from "react";

export interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  pixelRatio?: number;
  className?: string;
  interactionRef?: RefObject<HTMLElement | null>;
  onError?: (error: unknown) => void;
}
declare const Particles: ComponentType<ParticlesProps>;
export default Particles;
