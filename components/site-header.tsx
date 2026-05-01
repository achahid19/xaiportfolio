"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AixLogo } from "@/components/aix-logo";
import { Magnetic } from "@/components/magnetic";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems: ReadonlyArray<readonly [string, string]> = [
  ["/", "Home"],
  ["/systems", "Systems"],
  ["/blog", "Notes"],
  ["/contact", "Contact"]
] as const;

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/blog") return pathname.startsWith("/blog");
    if (href === "/systems") return pathname.startsWith("/systems");
    return pathname === href;
  }

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`} ref={headerRef}>
      {/* Fixed blur layer — position:fixed gets its own GPU layer in Chrome,
          fixing the backdrop-filter bug on position:sticky elements.
          transform:translateZ(0) on the parent makes this fixed child
          contained within the header's visual area. */}
      <div className="site-header-blur" aria-hidden="true" />
      <nav className="nav">
        <Link className="logo" href="/" onClick={() => setIsOpen(false)}>
          {/* Desktop: full lockup with subtitle */}
          <span className="logo-lockup">
            <AixLogo variant="lockup" />
          </span>
          {/* Mobile: icon + wordmark only */}
          <span className="logo-mark-only">
            <AixLogo variant="mark" />
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={isOpen}
          aria-controls="primary-nav"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul
          id="primary-nav"
          className={`nav-links${isOpen ? " nav-links--open" : ""}`}
        >
          {navItems.map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                className={`mono${isActive(href) ? " active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-cta">
          <ThemeToggle />
          <Magnetic>
            <Link
              className="btn btn-primary btn-sm"
              href="/contact"
              onClick={() => setIsOpen(false)}
            >
              Book a call →
            </Link>
          </Magnetic>
        </div>
      </nav>
    </header>
  );
}
