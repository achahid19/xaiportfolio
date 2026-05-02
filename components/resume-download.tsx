"use client";

import { useEffect, useRef, useState } from "react";

export function ResumeDownload({ size }: { size?: "sm" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="resume-dl" ref={ref}>
      <button
        type="button"
        className={`btn btn-secondary resume-dl__trigger${size === "sm" ? " btn-sm" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Download Resume"
      >
        {/* Download icon — always visible */}
        <svg
          className="resume-dl__icon"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {/* Text — hidden on mobile */}
        <span className="resume-dl__label">Resume</span>
        <svg
          className={`resume-dl__chevron${open ? " resume-dl__chevron--open" : ""}`}
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="resume-dl__menu" role="listbox">
          <a
            className="resume-dl__option mono"
            href="/resume-en.pdf"
            download="Anas_Chahid_Ksabi_Resume_EN.pdf"
            onClick={() => setOpen(false)}
            role="option"
            aria-selected={false}
          >
            <span className="resume-dl__flag">🇬🇧</span>
            English
            <span className="resume-dl__arrow">↓</span>
          </a>
          <a
            className="resume-dl__option mono"
            href="/resume-fr.pdf"
            download="Anas_Chahid_Ksabi_Resume_FR.pdf"
            onClick={() => setOpen(false)}
            role="option"
            aria-selected={false}
          >
            <span className="resume-dl__flag">🇫🇷</span>
            French
            <span className="resume-dl__arrow">↓</span>
          </a>
        </div>
      )}
    </div>
  );
}
