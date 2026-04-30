"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { System } from "@/lib/types";

type Props = { systems: System[] };

export function SystemsCarousel({ systems }: Props) {
  const [index, setIndex] = useState(0);

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    setIndex((i) => Math.min(systems.length - 1, i + 1));
  }

  return (
    <div className="sc-root">
      {/* Track */}
      <div className="sc-viewport">
        <ul
          className="sc-track"
          style={{ transform: `translateX(calc(-${index} * (var(--sc-card-w) + var(--sc-gap))))` }}
        >
          {systems.map((system) => (
            <li key={system.title} className="sc-card">
              <div className="sc-card__top">
                <span className="chip">{system.category}</span>
                <div className="sc-card__tools">
                  {system.tools.map((tool) => (
                    <span key={tool} className="system-tool-pill">{tool}</span>
                  ))}
                </div>
              </div>

              <h3 className="sc-card__title">{system.title}</h3>

              <dl className="sc-card__meta">
                <div className="sc-card__row">
                  <dt>Problem</dt>
                  <dd>{system.problem}</dd>
                </div>
                <div className="sc-card__row sc-card__row--result">
                  <dt>Result</dt>
                  <dd>{system.result}</dd>
                </div>
              </dl>

              {system.impact && (
                <div className="sc-card__impact">
                  <span className="sc-card__impact-icon" aria-hidden="true">💡</span>
                  <p>{system.impact}</p>
                </div>
              )}

              <div className="sc-card__footer">
                <Link href="/contact" className="system-card__link">
                  Talk about a similar build <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Controls */}
      <div className="sc-controls">
        <div className="sc-arrows">
          <button
            type="button"
            className="sc-arrow"
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous"
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className="sc-arrow"
            onClick={next}
            disabled={index >= systems.length - 1}
            aria-label="Next"
          >
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="sc-dots">
          {systems.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`sc-dot ${i === index ? "sc-dot--active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to system ${i + 1}`}
            />
          ))}
        </div>

        <Link className="button button--secondary sc-all-link" href="/systems">
          View all systems
        </Link>
      </div>
    </div>
  );
}
