"use client";

import { useState, useEffect } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

export function HeroGradient() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const update = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!size) return null;

  return (
    <MeshGradient
      width={size.w}
      height={size.h}
      colors={[
        "#1a3a8f",
        "#2D5BD6",
        "#4a7aff",
        "#1e2d5e",
        "#3d6ae0",
        "#0f1f4d",
      ]}
      distortion={1.2}
      speed={0.8}
      swirl={0.6}
      offsetX={0.08}
      style={{ position: "absolute", inset: 0 }}
    />
  );
}
