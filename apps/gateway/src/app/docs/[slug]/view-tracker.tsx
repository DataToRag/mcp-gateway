"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function DocViewTracker({ slug, section }: { slug: string; section: string }) {
  useEffect(() => {
    posthog.capture("docs_viewed", { slug, section });
  }, [slug, section]);

  return null;
}
