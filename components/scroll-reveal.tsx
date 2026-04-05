"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    const timer = setTimeout(() => {
      const vh = window.innerHeight;
      document
        .querySelectorAll<Element>(".animate-in:not(.is-visible)")
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Already in viewport — reveal immediately without waiting for IO
          if (rect.top < vh && rect.bottom > 0) {
            el.classList.add("is-visible");
          } else {
            // Below the fold — hand off to IntersectionObserver
            observer.observe(el);
          }
        });
    }, 60);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
