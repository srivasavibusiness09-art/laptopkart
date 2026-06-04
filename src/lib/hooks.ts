import { useState, useEffect } from "react";

// Global flag to track whether the initial page hydration has completed.
// Subsequent client-side component mounts can immediately initialize to the correct size
// without risking SSR hydration mismatch warnings.
let hydrationDone = false;

/**
 * Returns true when viewport width is below `breakpoint` (default 768px).
 * Returns false during SSR/hydration to avoid mismatch, but immediately resolves size on client.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined" && hydrationDone) {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    hydrationDone = true;
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, [breakpoint]);

  return isMobile;
}
