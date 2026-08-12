"use client";

import { useEffect } from "react";
import { initAnalytics, setAnalyticsContext } from "@/lib/insight";

/**
 * Starts Plausible, and renders nothing.
 *
 * Mounted twice on a docs page: once bare in the root layout, and once with a
 * `program` in the program layout. Child effects run first, so the program is
 * known before the tracker ever sends anything, and `initAnalytics` is a no-op
 * the second time round.
 */
export function Insight({ program }: { program?: string }) {
  useEffect(() => {
    if (program) setAnalyticsContext({ program });
    initAnalytics();
  }, [program]);

  return null;
}
