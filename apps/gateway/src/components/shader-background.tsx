"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import type React from "react";

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a1628]">
      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#0a1628", "#1a3a8f", "#2D5BD6", "#1e2d5e", "#4a7aff"]}
        speed={0.3}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={["#0a1628", "#ffffff", "#2D5BD6", "#000000"]}
        speed={0.2}
      />
      {children}
    </div>
  );
}
