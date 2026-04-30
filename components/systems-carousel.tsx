"use client";

import { useState } from "react";

import type { System } from "@/lib/types";

const PER_PAGE = 2;

type Props = {
  systems: System[];
};

export function SystemsCarousel({ systems }: Props) {
  const totalPages = Math.ceil(systems.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  function prev() {
    setExpanded(null);
    setPage((p) => (p - 1 + totalPages) % totalPages);
  }

  function next() {
    setExpanded(null);
    setPage((p) => (p + 1) % totalPages);
  }

  const visible = systems.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="carousel">
      {/* 2-up card row */}
      <div className="carousel-row">
        {visible.map((s) => {
          const isExpanded = expanded === s.id;
          return (
            <article key={s.id} className={`carousel-card${isExpanded ? " expanded" : ""}`}>
              <div className="system-head">
                <div>
                  <div className="system-cat mono">{s.category}</div>
                  <h3>{s.title}</h3>
                </div>
                <span className="system-id mono">{s.id}</span>
              </div>

              <div className="system-body">
                <div className="system-row">
                  <span className="key mono">Problem</span>
                  <span className="val">{s.problem}</span>
                </div>
                <div className="system-row result">
                  <span className="key mono">Result</span>
                  <span className="val">{s.result}</span>
                </div>
                {isExpanded && s.impact && (
                  <div className="system-impact">{s.impact}</div>
                )}
              </div>

              <div className="tools">
                {s.tools.map((t) => (
                  <span key={t} className="tool mono">{t}</span>
                ))}
              </div>

              <button
                type="button"
                className="system-expand mono"
                onClick={() => setExpanded(isExpanded ? null : s.id)}
              >
                {isExpanded ? "− Hide impact" : "+ Read impact"}
              </button>
            </article>
          );
        })}
      </div>

      {/* Controls */}
      <div className="carousel-controls">
        <div className="carousel-nav">
          <button
            type="button"
            className="carousel-btn mono"
            onClick={prev}
            aria-label="Previous systems"
          >
            ←
          </button>
          <span className="carousel-count mono">
            <span className="accent">{page + 1}</span> / {totalPages}
          </span>
          <button
            type="button"
            className="carousel-btn mono"
            onClick={next}
            aria-label="Next systems"
          >
            →
          </button>
        </div>

        <div className="carousel-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`carousel-dot${i === page ? " active" : ""}`}
              onClick={() => { setExpanded(null); setPage(i); }}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
