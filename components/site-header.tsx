"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Writing" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function isItemActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/blog") {
      return pathname.startsWith("/blog");
    }

    return pathname === href;
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="site-header__brand" href="/" onClick={() => setIsOpen(false)}>
          <span className="site-header__brand-mark" aria-hidden="true">
            <Image
              src="/images/aix_logo_no_bg.png"
              alt=""
              width={500}
              height={500}
              priority
              sizes="(max-width: 480px) 44px, (max-width: 900px) 48px, 52px"
            />
          </span>
          <span className="site-header__brand-copy">
            <span className="site-header__title">AI x Automation</span>
            <span className="site-header__tag">Portfolio and writing lab</span>
          </span>
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
          <div className="site-header__links">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isItemActive(item.href) ? "is-active" : undefined}
                aria-current={isItemActive(item.href) ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="site-header__actions">
            <ThemeToggle />
            <Link
              className="button button--primary site-header__cta"
              href="/guestbook"
              onClick={() => setIsOpen(false)}
            >
              Guestbook
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
