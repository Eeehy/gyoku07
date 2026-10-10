"use client";

import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

import "./Particles.css";

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(hex.slice(0, 6), 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const Particles = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = 1,
  className = "",
  interactionRef,
  onError,
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const errorRef = useRef(onError);
  errorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    let animationFrameId = 0;
    let disposed = false;
    const cleanupTasks = [];
    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      cleanupTasks.forEach((task) => {
        try {
          task();
        } catch {}
      });
      const gl = renderer?.gl;
      if (gl && !gl.isContextLost())
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl?.canvas.remove();
    };
    try {
      renderer = new Renderer({
        dpr: pixelRatio,
        depth: false,
        alpha: true,
        antialias: false,
      });
      const gl = renderer.gl;
      container.appendChild(gl.canvas);
      gl.clearColor(0, 0, 0, 0);

      const camera = new Camera(gl, { fov: 15 });
      camera.position.set(0, 0, cameraDistance);

      let previousWidth = 0;
      let previousHeight = 0;
      const resize = () => {
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);
        if (width === previousWidth && height === previousHeight) return;
        previousWidth = width;
        previousHeight = height;
        renderer.setSize(width, height);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      };
      const resizeObserver = new ResizeObserver(() => {
        if (disposed) return;
        try {
          resize();
        } catch (error) {
          cleanup();
          errorRef.current?.(error);
        }
      });
      cleanupTasks.push(() => resizeObserver.disconnect());
      resizeObserver.observe(container);
      resize();

      let pendingPointer = null;
      const applyPointer = () => {
        if (!pendingPointer) return;
        const e = pendingPointer;
        pendingPointer = null;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current = {
          x: Math.max(-1, Math.min(1, x)),
          y: Math.max(-1, Math.min(1, y)),
        };
      };
      const handleMouseMove = (e) => { pendingPointer = { clientX: e.clientX, clientY: e.clientY }; };

      const eventSource = interactionRef?.current || container;
      const resetMouse = () => {
        pendingPointer = null;
        mouseRef.current = { x: 0, y: 0 };
      };
      if (moveParticlesOnHover) {
        cleanupTasks.push(() => {
          eventSource.removeEventListener("mousemove", handleMouseMove);
          eventSource.removeEventListener("mouseleave", resetMouse);
        });
        eventSource.addEventListener("mousemove", handleMouseMove, {
          passive: true,
        });
        eventSource.addEventListener("mouseleave", resetMouse, {
          passive: true,
        });
      }

      const count = particleCount;
      const positions = new Float32Array(count * 3);
      const randoms = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);
      const palette =
        particleColors && particleColors.length > 0
          ? particleColors
          : defaultColors;

      for (let i = 0; i < count; i++) {
        let x, y, z, len;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          z = Math.random() * 2 - 1;
          len = x * x + y * y + z * z;
        } while (len > 1 || len === 0);
        const r = Math.cbrt(Math.random());
        positions.set([x * r, y * r, z * r], i * 3);
        randoms.set(
          [Math.random(), Math.random(), Math.random(), Math.random()],
          i * 4,
        );
        const col = hexToRgb(
          palette[Math.floor(Math.random() * palette.length)],
        );
        colors.set(col, i * 3);
      }

      const geometry = new Geometry(gl, {
        position: { size: 3, data: positions },
        random: { size: 4, data: randoms },
        color: { size: 3, data: colors },
      });

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uSpread: { value: particleSpread },
          uBaseSize: { value: particleBaseSize * pixelRatio },
          uSizeRandomness: { value: sizeRandomness },
          uAlphaParticles: { value: alphaParticles ? 1 : 0 },
        },
        transparent: true,
        depthTest: false,
      });

      if (!gl.getProgramParameter(program.program, gl.LINK_STATUS))
        throw new Error("Particles shader failed to link");

      const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

      let lastTime = performance.now();
      let elapsed = 0;

      const update = (t) => {
        if (disposed) return;
        try {
          applyPointer();
          const delta = Math.max(0, Math.min(t - lastTime, 50));
          lastTime = t;
          elapsed += delta * speed;

          program.uniforms.uTime.value = elapsed * 0.001;

          if (moveParticlesOnHover) {
            particles.position.x = -mouseRef.current.x * particleHoverFactor;
            particles.position.y = -mouseRef.current.y * particleHoverFactor;
          } else {
            particles.position.x = 0;
            particles.position.y = 0;
          }

          if (!disableRotation) {
            particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
            particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
            particles.rotation.z += delta * 0.0006 * speed;
          }

          renderer.render({ scene: particles, camera });
          animationFrameId = requestAnimationFrame(update);
        } catch (error) {
          cleanup();
          errorRef.current?.(error);
        }
      };

      animationFrameId = requestAnimationFrame(update);

      return cleanup;
    } catch (error) {
      cleanup();
      errorRef.current?.(error);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    pixelRatio,
    particleColors,
    interactionRef,
  ]);

  return (
    <div ref={containerRef} className={`particles-container ${className}`} />
  );
};

export default Particles;
