"use client";

import { useState } from "react";

import type { System } from "@/lib/types";

type Props = {
  systems: System[];
};

export function SystemsCarousel({ systems }: Props) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const total = systems.length;
  const s = systems[index];

  function prev() {
    setExpanded(false);
    setIndex((i) => (i - 1 + total) % total);
  }

  function next() {
    setExpanded(false);
    setIndex((i) => (i + 1) % total);
  }

  function goTo(i: number) {
    setExpanded(false);
    setIndex(i);
  }

  return (
    <div className="carousel">
      {/* Card */}
      <div className={`carousel-card${expanded ? " expanded" : ""}`}>
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
          {expanded && s.impact && (
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
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "− Hide impact" : "+ Read impact"}
        </button>
      </div>

      {/* Controls */}
      <div className="carousel-controls">
        <div className="carousel-nav">
          <button
            type="button"
            className="carousel-btn mono"
            onClick={prev}
            aria-label="Previous system"
          >
            ←
          </button>
          <span className="carousel-count mono">
            <span className="accent">{index + 1}</span> / {total}
          </span>
          <button
            type="button"
            className="carousel-btn mono"
            onClick={next}
            aria-label="Next system"
          >
            →
          </button>
        </div>

        {/* Dot indicators */}
        <div className="carousel-dots" aria-label="System navigation">
          {systems.map((sys, i) => (
            <button
              key={sys.id}
              type="button"
              className={`carousel-dot${i === index ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to ${sys.title}`}
              aria-current={i === index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
