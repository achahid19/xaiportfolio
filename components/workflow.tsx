"use client";

import { useEffect, useState } from "react";

/**
 * Animated agent pipeline visual — wired to Package Eval Agent flow.
 *
 * Sequence:
 *   01 Trigger  – Slack slash command / webhook ingest
 *   02 Plan     – LLM plans which sources to crawl
 *   03 Fetch    – Firecrawl scrapes npm, GitHub, docs
 *   04 Reason   – LLM scores signals, produces go/no-go
 *   05 Act      – Slack notify with structured recommendation
 */

type Node = {
  cls: "n1" | "n2" | "n3" | "n4" | "n5";
  head: string;
  title: string;
  sub: string;
};

const NODES: Node[] = [
  { cls: "n1", head: "01 · TRIGGER", title: "Webhook in", sub: "/eval-package" },
  { cls: "n2", head: "02 · PLAN", title: "Agent · plan", sub: "GPT-4o · 240ms" },
  { cls: "n3", head: "03 · FETCH", title: "Crawl + enrich", sub: "Firecrawl · 6 sources" },
  { cls: "n4", head: "04 · REASON", title: "Score & decide", sub: "score=0.84 · go" },
  { cls: "n5", head: "05 · ACT", title: "Slack notify", sub: "#ops-pipeline" }
];

const PATHS = [
  "M 18 22 C 35 22, 45 35, 50 45", // n1 → n3
  "M 82 22 C 65 22, 55 35, 50 45", // n2 → n3
  "M 50 56 C 45 65, 35 70, 18 78", // n3 → n4
  "M 50 56 C 55 65, 65 70, 82 78"  // n3 → n5
];

const STATUS_LINES = [
  "Idle, waiting for trigger…",
  "Planning next action…",
  "Fetching context…",
  "Reasoning over data…",
  "Action complete · 1.2s"
];

export function Workflow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % 5);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="workflow" aria-label="Package Eval Agent workflow visualization">
      <span className="workflow-corner tl" aria-hidden="true" />
      <span className="workflow-corner tr" aria-hidden="true" />
      <span className="workflow-corner bl" aria-hidden="true" />
      <span className="workflow-corner br" aria-hidden="true" />

      <div className="workflow-meta mono">
        <span className="accent">●</span> agent.run · <span>id=ax_4f21</span>
      </div>

      <svg className="workflow-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {PATHS.map((d, i) => (
          <path key={`l${i}`} d={d} className="path-line" vectorEffect="non-scaling-stroke" />
        ))}
        {PATHS.map((d, i) => {
          const live =
            (i === 0 && (active === 1 || active === 2)) ||
            (i === 1 && active === 2) ||
            (i === 2 && active === 3) ||
            (i === 3 && active === 4);
          return (
            <path
              key={`f${i}`}
              d={d}
              className={`path-flow${live ? " active" : ""}`}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {NODES.map((n, i) => (
        <div key={n.cls} className={`node ${n.cls}${active === i ? " active" : ""}`}>
          <div className="node-head mono">
            <span className="dot" />
            <span>{n.head}</span>
          </div>
          <div className="node-title mono">{n.title}</div>
          <div className="node-sub mono">{n.sub}</div>
        </div>
      ))}

      <div className="workflow-status mono">
        <span className="accent">▍</span>
        <span>{STATUS_LINES[active]}</span>
      </div>
    </div>
  );
}
