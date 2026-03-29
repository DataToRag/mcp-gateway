"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import type React from "react";

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Shaders */}
      {/* @ts-expect-error backgroundColor not in types but accepted at runtime */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#0a1628", "#1a3a8f", "#2D5BD6", "#1e2d5e", "#4a7aff"]}
        speed={0.3}
        backgroundColor="#0a1628"
      />
      {/* @ts-expect-error wireframe/backgroundColor not in types but accepted at runtime */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={["#0a1628", "#ffffff", "#2D5BD6", "#000000"]}
        speed={0.2}
        wireframe="true"
        backgroundColor="transparent"
      />
      {children}
    </div>
  );
}
