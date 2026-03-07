// @ts-nocheck
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ──────────────────────────────────────────
   Floating particle field — luminous saffron/gold
   dots that drift slowly and react to mouse position.
   ────────────────────────────────────────── */

const PARTICLE_COUNT = 120;

function Particles() {
  const meshRef = useRef<THREE.Points>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  // Generate randomised positions, sizes, and drift speeds
  const { positions, basePositions, sizes, speeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 14;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 6 - 2; // push behind text

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      sizes[i] = Math.random() * 3 + 1;
      speeds[i] = Math.random() * 0.3 + 0.1;
    }

    return { positions, basePositions, sizes, speeds };
  }, []);

  // Track mouse via pointer event on the Canvas
  useThree(({ gl }) => {
    const canvas = gl.domElement;
    const handler = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    canvas.addEventListener("pointermove", handler, { passive: true });
    return () => canvas.removeEventListener("pointermove", handler);
  });

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const posArr = meshRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const speed = speeds[i];

      // Gentle sinusoidal drift
      posArr[i3] =
        basePositions[i3] +
        Math.sin(t * speed + i) * 0.4 +
        mouse.current.x * 0.3 * (1 - Math.abs(basePositions[i3 + 2]) / 8);
      posArr[i3 + 1] =
        basePositions[i3 + 1] +
        Math.cos(t * speed * 0.7 + i * 1.3) * 0.3 +
        mouse.current.y * 0.3 * (1 - Math.abs(basePositions[i3 + 2]) / 8);
      posArr[i3 + 2] =
        basePositions[i3 + 2] + Math.sin(t * speed * 0.5 + i * 0.9) * 0.2;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Custom shader material for soft glowing dots
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor1: { value: new THREE.Color("#E8751A") },
        uColor2: { value: new THREE.Color("#D4A843") },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPos;
          gl_PointSize = aSize * uPixelRatio * (80.0 / -mvPos.z);
          vAlpha = smoothstep(0.0, 1.0, aSize / 4.0) * 0.6;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;

          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          glow = pow(glow, 2.0);

          vec3 color = mix(uColor2, uColor1, glow);
          gl_FragColor = vec4(color, glow * vAlpha);
        }
      `,
    });
  }, []);

  return (
    <points ref={meshRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  );
}

export default function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
