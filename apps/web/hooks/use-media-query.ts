"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query. SSR-safe: returns `false` on the server and
 * during hydration, then syncs to the real match value on the client.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
