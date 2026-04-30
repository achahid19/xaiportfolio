"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

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
    <header className="site-header" ref={headerRef}>
      <nav className="nav">
        <Link className="logo" href="/" onClick={() => setIsOpen(false)}>
          <Image
            src="/images/aix_logo_no_bg.png"
            alt="AIX Automation"
            width={32}
            height={32}
            className="logo-img"
            priority
          />
          <span className="logo-text">
            AI X Automation
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
