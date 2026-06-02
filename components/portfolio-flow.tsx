"use client";

const DATA_STREAMS = [
  {
    id: "finance",
    label: "Google Finance",
    desc: "Live price · financials · market stats per symbol",
    tag: "Per symbol"
  },
  {
    id: "macro",
    label: "Macro News",
    desc: "Fed decisions · CPI · rate moves",
    tag: "Google News"
  },
  {
    id: "risk",
    label: "Risk Signals",
    desc: "Breaking news · contagion · emergency alerts",
    tag: "Google News"
  },
  {
    id: "headlines",
    label: "Symbol Headlines",
    desc: "Reuters · Bloomberg · WSJ per position",
    tag: "Per symbol"
  }
];

export function PortfolioFlow() {
  return (
    <div className="pf-flow">
      <div className="pf-flow__header">
        <span className="pf-flow__eyebrow mono">Workflow diagram</span>
        <h4 className="pf-flow__title">Automated Weekly Portfolio Analysis</h4>
      </div>

      <div className="pf-flow__canvas">

        {/* Step 1 — Trigger */}
        <div className="pf-flow__col pf-flow__col--trigger">
          <div className="pf-node pf-node--trigger">
            <div className="pf-node__icon mono">⏱</div>
            <div className="pf-node__label">Weekly Trigger</div>
            <div className="pf-node__sublabel mono">Every Monday</div>
            <div className="pf-node__desc">Reads active positions from Google Sheets watchlist</div>
            <div className="pf-node__tag mono">Google Sheets</div>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="pf-flow__connector">
          <div className="pf-connector__line" />
          <div className="pf-connector__head" />
          <div className="pf-connector__label mono">symbols</div>
        </div>

        {/* Step 2 — ScrapingDog */}
        <div className="pf-flow__col pf-flow__col--engine">
          <div className="pf-node pf-node--engine">
            <div className="pf-node__icon mono">⚙</div>
            <div className="pf-node__label">ScrapingDog</div>
            <div className="pf-node__sublabel mono">Data Engine</div>
            <div className="pf-node__desc">Native n8n node — no scraping setup needed</div>
            <div className="pf-node__tag mono">4 parallel calls</div>
          </div>
        </div>

        {/* Fan-out arrows */}
        <div className="pf-flow__fanout">
          <div className="pf-fanout__lines">
            {DATA_STREAMS.map((s) => (
              <div key={s.id} className="pf-fanout__branch">
                <div className="pf-fanout__line" />
              </div>
            ))}
          </div>
          <div className="pf-fanout__head">
            <div className="pf-connector__head" />
          </div>
        </div>

        {/* Step 3 — Data streams */}
        <div className="pf-flow__col pf-flow__col--streams">
          {DATA_STREAMS.map((stream) => (
            <div key={stream.id} className="pf-stream">
              <div className="pf-stream__label">{stream.label}</div>
              <div className="pf-stream__desc mono">{stream.desc}</div>
              <span className="pf-stream__tag mono">{stream.tag}</span>
            </div>
          ))}
        </div>

        {/* Fan-in arrows */}
        <div className="pf-flow__fanin">
          <div className="pf-fanin__lines">
            {DATA_STREAMS.map((s) => (
              <div key={s.id} className="pf-fanin__branch">
                <div className="pf-fanin__line" />
              </div>
            ))}
          </div>
          <div className="pf-fanin__label mono">all data</div>
          <div className="pf-connector__head" />
        </div>

        {/* Step 4 — AI Agent */}
        <div className="pf-flow__col pf-flow__col--agent">
          <div className="pf-node pf-node--agent">
            <div className="pf-node__icon mono">🤖</div>
            <div className="pf-node__label">Market Analysis Agent</div>
            <div className="pf-node__sublabel mono">AI synthesis</div>
            <div className="pf-node__desc">Processes all data at once — returns structured report per position</div>
            <div className="pf-agent__outputs">
              {["Hold", "Add", "Trim", "Exit"].map((a) => (
                <span key={a} className="pf-agent__action mono">{a}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow final */}
        <div className="pf-flow__connector">
          <div className="pf-connector__line" />
          <div className="pf-connector__head" />
          <div className="pf-connector__label mono">HTML email</div>
        </div>

        {/* Step 5 — Gmail */}
        <div className="pf-flow__col pf-flow__col--delivery">
          <div className="pf-node pf-node--delivery">
            <div className="pf-node__icon mono">✉</div>
            <div className="pf-node__label">Gmail</div>
            <div className="pf-node__sublabel mono">Delivered Monday AM</div>
            <div className="pf-node__desc">Clean HTML report in the investor's inbox</div>
            <div className="pf-node__tag mono">Weekly</div>
          </div>
        </div>

      </div>

      {/* Legend */}
      <div className="pf-flow__legend mono">
        <span className="pf-legend__item">
          <span className="pf-legend__dot pf-legend__dot--trigger" />
          Trigger
        </span>
        <span className="pf-legend__item">
          <span className="pf-legend__dot pf-legend__dot--engine" />
          ScrapingDog
        </span>
        <span className="pf-legend__item">
          <span className="pf-legend__dot pf-legend__dot--agent" />
          AI Agent
        </span>
        <span className="pf-legend__item">
          <span className="pf-legend__dot pf-legend__dot--delivery" />
          Delivery
        </span>
      </div>
    </div>
  );
}
