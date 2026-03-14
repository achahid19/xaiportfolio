"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [isNearTop, setIsNearTop] = useState(true);
  const [isPageScrollable, setIsPageScrollable] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsNearTop(window.scrollY < 520);
      setIsPageScrollable(
        document.documentElement.scrollHeight > window.innerHeight + 120,
      );
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToFooter() {
    const footer = document.querySelector("footer");

    if (footer instanceof HTMLElement) {
      footer.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  if (!isPageScrollable) {
    return null;
  }

  return (
    <button
      type="button"
      className="scroll-top scroll-top--visible"
      onClick={isNearTop ? scrollToFooter : scrollToTop}
      aria-label={isNearTop ? "Scroll to footer" : "Scroll back to top"}
      title={isNearTop ? "Jump to footer" : "Back to top"}
    >
      <span aria-hidden="true">{isNearTop ? "↓" : "↑"}</span>
    </button>
  );
}
