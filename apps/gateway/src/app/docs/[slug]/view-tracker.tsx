"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { EVENTS } from "@/lib/analytics";

export function DocViewTracker({ slug, section }: { slug: string; section: string }) {
  useEffect(() => {
    posthog.capture(EVENTS.DOCS_VIEWED, { slug, section });
  }, [slug, section]);

  return null;
}
