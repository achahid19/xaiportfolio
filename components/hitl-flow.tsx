"use client";

const STAGES = [
  {
    id: "brief",
    label: "Brief",
    sublabel: "Intake Form",
    desc: "Client · Platform · Content type · Tone",
    color: "dim",
    icon: "✦"
  },
  {
    id: "sofia",
    label: "Sofia",
    sublabel: "Strategy",
    desc: "3 content angles generated & reviewed",
    color: "accent",
    icon: "01",
    decision: ["Approve →", "Revise ↺"],
    slack: "#sofia-angles-review"
  },
  {
    id: "marcus",
    label: "Marcus",
    sublabel: "Creative",
    desc: "Post copy + visual generated & reviewed",
    color: "accent",
    icon: "02",
    decision: ["Approve →", "Revise ↺"],
    slack: "#marcus-posts-review"
  },
  {
    id: "taylor",
    label: "Taylor",
    sublabel: "Final Review",
    desc: "AI quality check · brand fit · recommendation",
    color: "accent",
    icon: "03",
    decision: ["Publish ✓", "→ Marcus ↺", "→ Sofia ↺"],
    slack: "#taylor-final-review"
  },
  {
    id: "published",
    label: "Published",
    sublabel: "Slack · #relay-final-postings",
    desc: "Post copy + visual delivered",
    color: "success",
    icon: "✓"
  }
];

export function HitlFlow() {
  return (
    <div className="hitl-flow">
      <div className="hitl-flow__header">
        <span className="hitl-flow__eyebrow mono">Workflow diagram</span>
        <h4 className="hitl-flow__title">The HITL Content Pipeline</h4>
      </div>

      {/* Main flow */}
      <div className="hitl-flow__stages">
        {STAGES.map((stage, i) => (
          <div key={stage.id} className="hitl-flow__stage-wrap">
            <div className={`hitl-flow__node hitl-flow__node--${stage.color}`}>
              <div className="hitl-flow__node-icon mono">{stage.icon}</div>
              <div className="hitl-flow__node-label">{stage.label}</div>
              <div className="hitl-flow__node-sublabel mono">{stage.sublabel}</div>
              <div className="hitl-flow__node-desc">{stage.desc}</div>
              {stage.decision && (
                <div className="hitl-flow__decisions">
                  {stage.decision.map((d, di) => (
                    <span
                      key={di}
                      className={`hitl-flow__decision mono ${di === 0 ? "hitl-flow__decision--approve" : "hitl-flow__decision--revise"}`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
              {stage.slack && (
                <div className="hitl-flow__slack mono">
                  <span className="hitl-flow__slack-dot" />
                  {stage.slack}
                </div>
              )}
            </div>
            {i < STAGES.length - 1 && (
              <div className="hitl-flow__arrow">
                <div className="hitl-flow__arrow-line" />
                <div className="hitl-flow__arrow-head" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feedback loops */}
      <div className="hitl-flow__loops">
        <div className="hitl-flow__loop-label mono">Revision loops</div>
        <div className="hitl-flow__loop hitl-flow__loop--1">
          <span className="hitl-flow__loop-tag mono">Sofia revise</span>
          <div className="hitl-flow__loop-line" />
          <span className="hitl-flow__loop-back mono">↺ Back to Stage 1</span>
        </div>
        <div className="hitl-flow__loop hitl-flow__loop--2">
          <span className="hitl-flow__loop-tag mono">Marcus revise</span>
          <div className="hitl-flow__loop-line" />
          <span className="hitl-flow__loop-back mono">↺ Back to Stage 2</span>
        </div>
        <div className="hitl-flow__loop hitl-flow__loop--3">
          <span className="hitl-flow__loop-tag mono">Taylor → Sofia</span>
          <div className="hitl-flow__loop-line" />
          <span className="hitl-flow__loop-back mono">↺ Full restart</span>
        </div>
      </div>

      <div className="hitl-flow__legend mono">
        <span className="hitl-flow__legend-item">
          <span className="hitl-flow__legend-dot hitl-flow__legend-dot--approve" />
          Approve path
        </span>
        <span className="hitl-flow__legend-item">
          <span className="hitl-flow__legend-dot hitl-flow__legend-dot--revise" />
          Revision loop
        </span>
        <span className="hitl-flow__legend-item">
          <span className="hitl-flow__legend-dot hitl-flow__legend-dot--slack" />
          Slack notification
        </span>
      </div>
    </div>
  );
}
