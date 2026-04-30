"use client";

import { useMemo, useState } from "react";

import type { System } from "@/lib/types";

type Props = {
  systems: System[];
  /** Show the filter bar (true on /systems page, false on homepage preview) */
  showFilters?: boolean;
};

export function SystemsGrid({ systems, showFilters = false }: Props) {
  const [filter, setFilter] = useState("All");
  const [tool, setTool] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const cats = useMemo(
    () => ["All", ...Array.from(new Set(systems.map((s) => s.category)))],
    [systems]
  );

  const tools = useMemo(() => {
    const all = new Set<string>();
    systems.forEach((s) => s.tools.forEach((t) => all.add(t)));
    return ["All", ...Array.from(all).sort()];
  }, [systems]);

  const filtered = useMemo(
    () =>
      systems.filter(
        (s) =>
          (filter === "All" || s.category === filter) &&
          (tool === "All" || s.tools.includes(tool))
      ),
    [systems, filter, tool]
  );

  return (
    <div>
      {showFilters && (
        <>
          <div className="filter-bar">
            <span className="filter-label mono">filter:</span>
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-pill mono${filter === c ? " active" : ""}`}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
            <span className="filter-count mono">
              {filtered.length} / {systems.length} systems
            </span>
          </div>
          <div
            className="filter-bar"
            style={{ marginTop: "-16px", paddingTop: 0, borderBottom: "none" }}
          >
            <span className="filter-label mono">tools:</span>
            {tools.map((t) => (
              <button
                key={t}
                type="button"
                className={`filter-pill mono${tool === t ? " active" : ""}`}
                onClick={() => setTool(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="systems-grid">
        {filtered.map((s) => {
          const isExpanded = expanded === s.id;
          return (
            <article
              key={s.id}
              className={`system-card${s.featured ? " featured" : ""}${
                isExpanded ? " expanded" : ""
              }`}
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
    </div>
  );
}
