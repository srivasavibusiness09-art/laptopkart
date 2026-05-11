import { useState, useEffect } from "react";

/**
 * Returns true when viewport width is below `breakpoint` (default 768px).
 * Returns false during SSR to avoid hydration mismatch.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, [breakpoint]);

  return isMobile;
}
