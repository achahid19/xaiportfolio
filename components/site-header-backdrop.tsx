"use client";

import { useEffect, useState } from "react";

/**
 * Standalone fixed-position blur backdrop for the navbar.
 *
 * Chrome/Brave have a longstanding bug: backdrop-filter on position:sticky
 * is never GPU-composited, so the blur is invisible. Safari is unaffected.
 *
 * The fix: render the blurred layer as a completely independent
 * position:fixed element with NO transformed/composited ancestors.
 * Chrome always promotes fixed elements to their own GPU layer, so
 * backdrop-filter works reliably here on every browser.
 */
export function SiteHeaderBackdrop() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`site-header-backdrop${scrolled ? " site-header-backdrop--active" : ""}`}
    />
  );
}
