"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollable = maxScroll > 120;

      setVisible(scrollable);
      setAtBottom(scrollable && scrollY >= maxScroll - 40);
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

  function scrollToBottom() {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  if (!visible) return null;

  return (
    <div className="scroll-fab">
      <button
        type="button"
        className="scroll-fab__btn"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
      >
        ↑
      </button>
      <button
        type="button"
        className={`scroll-fab__btn${atBottom ? " scroll-fab__btn--dim" : ""}`}
        onClick={scrollToBottom}
        aria-label="Scroll to bottom"
        title="Jump to bottom"
      >
        ↓
      </button>
    </div>
  );
}
