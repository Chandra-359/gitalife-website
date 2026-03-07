"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Procedural 3D "Bhagavad Gita As It Is" book
export default function GitaBook({ scrollProgress = 0 }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const targetRotation = useRef(0);

  // Book dimensions (width, height, depth)
  const bookW = 2.4;
  const bookH = 3.2;
  const bookD = 0.5;

  // Create canvas textures for each face of the book
  const textures = useMemo(() => {
    const createTexture = (
      draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
      w = 512,
      h = 512
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      draw(ctx, w, h);
      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 8;
      return tex;
    };

    // --- FRONT COVER ---
    const front = createTexture((ctx, w, h) => {
      // Deep maroon/burgundy background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#6B1D1D");
      grad.addColorStop(0.5, "#8B2525");
      grad.addColorStop(1, "#5A1818");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gold decorative border
      ctx.strokeStyle = "#D4A843";
      ctx.lineWidth = 8;
      ctx.strokeRect(24, 24, w - 48, h - 48);

      // Inner border
      ctx.strokeStyle = "#D4A84380";
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      // Decorative top element (lotus/flame symbol)
      ctx.fillStyle = "#D4A843";
      ctx.beginPath();
      ctx.arc(w / 2, 80, 20, 0, Math.PI * 2);
      ctx.fill();

      // Small decorative lines around symbol
      ctx.strokeStyle = "#D4A843";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 60, 80);
      ctx.lineTo(w / 2 - 28, 80);
      ctx.moveTo(w / 2 + 28, 80);
      ctx.lineTo(w / 2 + 60, 80);
      ctx.stroke();

      // Title text
      ctx.fillStyle = "#D4A843";
      ctx.textAlign = "center";

      ctx.font = "bold 36px Georgia, serif";
      ctx.fillText("BHAGAVAD-GITA", w / 2, 160);

      ctx.font = "24px Georgia, serif";
      ctx.fillText("AS IT IS", w / 2, 200);

      // Decorative divider
      ctx.strokeStyle = "#D4A843";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 80, 225);
      ctx.lineTo(w / 2 + 80, 225);
      ctx.stroke();

      // Center illustration area — Krishna & Arjuna chariot scene (simplified)
      // Dark area for the illustration
      ctx.fillStyle = "#3D1010";
      ctx.fillRect(60, 245, w - 120, 160);

      // Chariot wheel (simplified)
      ctx.strokeStyle = "#D4A84390";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, 325, 50, 0, Math.PI * 2);
      ctx.stroke();
      // Spokes
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(w / 2, 325);
        ctx.lineTo(w / 2 + Math.cos(angle) * 50, 325 + Math.sin(angle) * 50);
        ctx.stroke();
      }

      // Two figures (simplified silhouettes)
      ctx.fillStyle = "#D4A84370";
      // Krishna figure
      ctx.beginPath();
      ctx.ellipse(w / 2 - 25, 290, 12, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      // Arjuna figure
      ctx.beginPath();
      ctx.ellipse(w / 2 + 25, 295, 10, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Author
      ctx.fillStyle = "#D4A843";
      ctx.font = "14px Georgia, serif";
      ctx.fillText("His Divine Grace", w / 2, 440);
      ctx.font = "bold 16px Georgia, serif";
      ctx.fillText("A.C. Bhaktivedanta", w / 2, 462);
      ctx.font = "bold 16px Georgia, serif";
      ctx.fillText("Swami Prabhupāda", w / 2, 482);

      // Bottom decorative element
      ctx.fillStyle = "#D4A843";
      ctx.beginPath();
      ctx.arc(w / 2, h - 40, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- BACK COVER ---
    const back = createTexture((ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#5A1818");
      grad.addColorStop(1, "#6B1D1D");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gold border
      ctx.strokeStyle = "#D4A843";
      ctx.lineWidth = 6;
      ctx.strokeRect(24, 24, w - 48, h - 48);

      // Back cover text
      ctx.fillStyle = "#D4A84390";
      ctx.textAlign = "center";
      ctx.font = "italic 14px Georgia, serif";

      const lines = [
        '"The Bhagavad-gita is the',
        'essence of Vedic knowledge',
        'and one of the most important',
        'Upanishads in Vedic literature."',
      ];
      lines.forEach((line, i) => {
        ctx.fillText(line, w / 2, 200 + i * 22);
      });

      // Publisher mark
      ctx.fillStyle = "#D4A84360";
      ctx.font = "12px Georgia, serif";
      ctx.fillText("THE BHAKTIVEDANTA BOOK TRUST", w / 2, h - 60);
    });

    // --- SPINE ---
    const spine = createTexture(
      (ctx, w, h) => {
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, "#5A1818");
        grad.addColorStop(0.5, "#8B2525");
        grad.addColorStop(1, "#5A1818");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Gold lines on spine edges
        ctx.strokeStyle = "#D4A843";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(8, h);
        ctx.moveTo(w - 8, 0);
        ctx.lineTo(w - 8, h);
        ctx.stroke();

        // Spine text (rotated)
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = "#D4A843";
        ctx.textAlign = "center";
        ctx.font = "bold 20px Georgia, serif";
        ctx.fillText("BHAGAVAD-GITA AS IT IS", 0, 6);
        ctx.restore();
      },
      128,
      512
    );

    // --- PAGE EDGES (top, bottom, right side) ---
    const pages = createTexture((ctx, w, h) => {
      // Cream/off-white page edges
      ctx.fillStyle = "#F5EDD8";
      ctx.fillRect(0, 0, w, h);
      // Subtle line pattern to simulate page edges
      ctx.strokeStyle = "#E8DCC8";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 3) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
    }, 256, 256);

    return { front, back, spine, pages };
  }, []);

  // Materials for each face of the box: [+x, -x, +y, -y, +z, -z]
  const materials = useMemo(
    () => [
      // +x (right side — page edges)
      new THREE.MeshStandardMaterial({ map: textures.pages, roughness: 0.8 }),
      // -x (left side — spine)
      new THREE.MeshStandardMaterial({ map: textures.spine, roughness: 0.5, metalness: 0.1 }),
      // +y (top — page edges)
      new THREE.MeshStandardMaterial({ map: textures.pages, roughness: 0.8 }),
      // -y (bottom — page edges)
      new THREE.MeshStandardMaterial({ map: textures.pages, roughness: 0.8 }),
      // +z (front cover)
      new THREE.MeshStandardMaterial({ map: textures.front, roughness: 0.4, metalness: 0.05 }),
      // -z (back cover)
      new THREE.MeshStandardMaterial({ map: textures.back, roughness: 0.4, metalness: 0.05 }),
    ],
    [textures]
  );

  // Smooth rotation driven by scroll progress
  useFrame(() => {
    if (!groupRef.current) return;

    // Full 360° rotation across scroll progress + slight idle wobble
    targetRotation.current = scrollProgress * Math.PI * 2;

    // Lerp the rotation for that smooth, weighted feel
    groupRef.current.rotation.y +=
      (targetRotation.current - groupRef.current.rotation.y) * 0.08;

    // Gentle floating motion
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Main book body */}
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[bookW, bookH, bookD]} />
      </mesh>

      {/* Slight rounded spine bump on the left */}
      <mesh position={[-bookW / 2 - 0.02, 0, 0]} castShadow>
        <cylinderGeometry args={[bookD / 2, bookD / 2, bookH, 16, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#7A2020" roughness={0.5} metalness={0.05} />
      </mesh>
    </group>
  );
}
