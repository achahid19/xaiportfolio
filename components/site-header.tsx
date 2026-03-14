"use client";

import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/#writing", label: "Writing" },
  { href: "/#connect", label: "Connect" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="site-header__brand" href="/" onClick={() => setIsOpen(false)}>
          <span className="site-header__title">AI x Automation</span>
          <span className="site-header__tag">Portfolio and writing lab</span>
        </Link>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={isOpen}
          aria-controls="site-nav"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="site-nav"
          className={`site-header__nav ${isOpen ? "site-header__nav--open" : ""}`}
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            className="button button--primary site-header__cta"
            href="/guestbook"
            onClick={() => setIsOpen(false)}
          >
            Guestbook
          </Link>
        </nav>
      </div>
    </header>
  );
}
