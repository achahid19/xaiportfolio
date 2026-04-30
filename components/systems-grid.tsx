"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

import type { System } from "@/lib/types";

type Props = { systems: System[] };

export function SystemsGrid({ systems }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(systems.map((s) => s.category))).sort(),
    [systems]
  );

  const tools = useMemo(
    () => Array.from(new Set(systems.flatMap((s) => s.tools))).sort(),
    [systems]
  );

  const filtered = useMemo(
    () =>
      systems.filter((s) => {
        if (activeCategory && s.category !== activeCategory) return false;
        if (activeTool && !s.tools.includes(activeTool)) return false;
        return true;
      }),
    [systems, activeCategory, activeTool]
  );

  function toggleCategory(cat: string) {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setActiveTool(null);
  }

  function toggleTool(tool: string) {
    setActiveTool((prev) => (prev === tool ? null : tool));
    setActiveCategory(null);
  }

  function clearAll() {
    setActiveCategory(null);
    setActiveTool(null);
  }

  const hasFilter = activeCategory !== null || activeTool !== null;

  return (
    <div className="systems-layout">
      {/* ── Filter bar ── */}
      <div className="systems-filters">
        <div className="systems-filter-group">
          <span className="systems-filter-label">Function</span>
          <div className="systems-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`systems-chip ${activeCategory === cat ? "systems-chip--active" : ""}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="systems-filter-group">
          <span className="systems-filter-label">Tool</span>
          <div className="systems-chips">
            {tools.map((tool) => (
              <button
                key={tool}
                type="button"
                className={`systems-chip ${activeTool === tool ? "systems-chip--active" : ""}`}
                onClick={() => toggleTool(tool)}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        {hasFilter && (
          <button type="button" className="systems-clear" onClick={clearAll}>
            Clear filter
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <p className="systems-empty">No systems match this filter.</p>
      ) : (
        <div className="systems-grid">
          {filtered.map((system) => (
            <article key={system.title} className="system-card">
              <div className="system-card__top">
                <span className="chip">{system.category}</span>
                <div className="system-card__tools">
                  {system.tools.map((tool) => (
                    <span key={tool} className="system-tool-pill">{tool}</span>
                  ))}
                </div>
              </div>

              <h3 className="system-card__title">{system.title}</h3>

              <dl className="system-card__meta">
                <div className="system-card__row">
                  <dt>Problem</dt>
                  <dd>{system.problem}</dd>
                </div>
                <div className="system-card__row system-card__row--result">
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

              <div className="system-card__footer">
                <Link href="/contact" className="system-card__link">
                  Talk about a similar build <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
