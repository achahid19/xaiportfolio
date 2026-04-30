"use client";

import { useEffect, useState } from "react";

import type { System } from "@/lib/types";

type Props = {
  systems: System[];
};

function usePerPage() {
  const [perPage, setPerPage] = useState(2); // default SSR = desktop

  useEffect(() => {
    function update() {
      setPerPage(window.innerWidth <= 700 ? 1 : 2);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perPage;
}

export function SystemsCarousel({ systems }: Props) {
  const perPage = usePerPage();
  const totalPages = Math.ceil(systems.length / perPage);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Clamp page index when perPage changes (e.g. resize)
  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  function prev() {
    setExpanded(null);
    setPage((p) => (p - 1 + totalPages) % totalPages);
  }

  function next() {
    setExpanded(null);
    setPage((p) => (p + 1) % totalPages);
  }

  const visible = systems.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="carousel">
      <div className="carousel-row">
        {visible.map((s) => {
          const isExpanded = expanded === s.id;
          return (
            <article
              key={s.id}
              className={`carousel-card${isExpanded ? " expanded" : ""}`}
              onClick={() => setExpanded(isExpanded ? null : s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpanded(isExpanded ? null : s.id);
                }
              }}
            >
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

              <div className="system-expand mono">
                {isExpanded ? "− Hide impact" : "+ Read impact"}
              </div>
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
            aria-label="Previous"
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
            aria-label="Next"
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
