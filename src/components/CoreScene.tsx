import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  MathUtils,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
} from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D uSky;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uPointer;
  varying vec2 vUv;
  void main() {
    float imageAspect = 1672.0 / 941.0;
    vec2 cover = vec2(1.0);
    if (uAspect < imageAspect) cover.x = uAspect / imageAspect;
    else cover.y = imageAspect / uAspect;
    vec2 uv = (vUv - 0.5) * cover + 0.5;
    float sky = smoothstep(0.34, 0.55, uv.y);
    // Slow sky flow; the digital ground stays anchored.
    uv += uPointer * vec2(0.009, -0.005) * (0.25 + sky * 0.75);
    uv.x += sin(uTime * 0.04 + uv.y * 2.0) * 0.0025 * sky;
    uv.y += sin(uTime * 0.025 + uv.x * 3.0) * 0.001 * sky;
    vec3 color = texture2D(uSky, clamp(uv, 0.002, 0.998)).rgb;
    // Perspective coordinates map to an infinite ground, not water.
    float floorDepth = 0.344 - uv.y;
    if (floorDepth > 0.0) {
      float depth = max(floorDepth, 0.006);
      vec2 world = vec2((uv.x - 0.5) * imageAspect / depth, 1.0 / depth);
      world.y += uTime * 0.018;
      world.x += uPointer.x * 0.035;
      vec2 gridUv = world * vec2(0.7, 0.28);
      vec2 line = abs(fract(gridUv - 0.5) - 0.5) / max(fwidth(gridUv), vec2(0.0001));
      float grid = 1.0 - min(min(line.x, line.y), 1.0);
      float distantFade = smoothstep(0.012, 0.09, floorDepth);
      float pulse = 0.65 + 0.35 * sin(world.y * 0.13 - uTime * 0.16);
      color += vec3(0.18, 0.34, 0.42) * grid * distantFade * pulse * 0.075;
    }
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

type Pointer = RefObject<{ x: number; y: number }>;
function DigitalHorizon({
  paused,
  pointer,
  onReady,
  onLost,
}: {
  paused: boolean;
  pointer: Pointer;
  onReady: () => void;
  onLost: () => void;
}) {
  const material = useRef<ShaderMaterial>(null);
  const texture = useLoader(TextureLoader, "/images/digital-horizon.webp");
  const { size, gl } = useThree();
  texture.colorSpace = SRGBColorSpace;
  const uniforms = useMemo(
    () => ({
      uSky: { value: texture },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uPointer: { value: new Vector2() },
    }),
    [texture],
  );
  useEffect(() => {
    uniforms.uAspect.value = size.width / size.height;
  }, [size, uniforms]);
  useEffect(() => {
    onReady();
  }, [texture, onReady]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onLost]);
  useFrame((_, delta) => {
    if (paused || !material.current) return;
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    uniforms.uPointer.value.x = MathUtils.damp(
      uniforms.uPointer.value.x,
      pointer.current.x,
      2.5,
      dt,
    );
    uniforms.uPointer.value.y = MathUtils.damp(
      uniforms.uPointer.value.y,
      pointer.current.y,
      2.5,
      dt,
    );
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function HorizonScene({
  paused,
  pointer,
  onReady,
  onLost,
}: {
  paused: boolean;
  pointer: Pointer;
  onReady: () => void;
  onLost: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop={paused ? "demand" : "always"}
      gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
    >
      <DigitalHorizon
        paused={paused}
        pointer={pointer}
        onReady={onReady}
        onLost={onLost}
      />
    </Canvas>
  );
}
