type WorkflowNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  tone: "default" | "accent" | "soft";
};

type WorkflowSignal = {
  routeIndex: number;
  dur: string;
  begin: string;
  variant?: "default" | "ghost";
};

function WorkflowCluster({
  className,
  pathPrefix,
  paths,
  nodes,
  signals
}: {
  className: string;
  pathPrefix: string;
  paths: string[];
  nodes: WorkflowNode[];
  signals: WorkflowSignal[];
}) {
  return (
    <svg className={className} viewBox="0 0 600 600">
      <defs>
        <marker
          id={`${pathPrefix}-arrow`}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0 0 L8 4 L0 8 Z" className="ambient-network__arrowhead" />
        </marker>
        {paths.map((d, index) => (
          <path key={index} id={`${pathPrefix}-route-${index}`} d={d} />
        ))}
      </defs>

      <g className="ambient-network__links">
        {paths.map((d, index) => (
          <path key={index} d={d} markerEnd={`url(#${pathPrefix}-arrow)`} />
        ))}
      </g>

      <g className="ambient-network__signals">
        {signals.map((signal, index) => (
          <circle
            key={index}
            r={signal.variant === "ghost" ? 2.5 : 3.5}
            className={`ambient-network__signal ${
              signal.variant === "ghost" ? "ambient-network__signal--ghost" : ""
            }`}
          >
            <animateMotion
              dur={signal.dur}
              repeatCount="indefinite"
              rotate="auto"
              begin={signal.begin}
            >
              <mpath href={`#${pathPrefix}-route-${signal.routeIndex}`} />
            </animateMotion>
          </circle>
        ))}
      </g>

      <g className="ambient-network__cards">
        {nodes.map((node, index) => (
          <g key={index} className={`ambient-network__card ambient-network__card--${node.tone}`}>
            <rect
              x={node.x - 6}
              y={node.y + node.height / 2 - 3}
              width="8"
              height="6"
              rx="3"
              className="ambient-network__card-port ambient-network__card-port--input"
            />
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx="16"
              className="ambient-network__card-body"
            />
            <rect
              x={node.x + node.width - 2}
              y={node.y + node.height / 2 - 3}
              width="8"
              height="6"
              rx="3"
              className="ambient-network__card-port ambient-network__card-port--output"
            />
            <rect
              x={node.x + 14}
              y={node.y + 12}
              width="16"
              height="16"
              rx="5"
              className="ambient-network__card-icon"
            />
            <rect
              x={node.x + 38}
              y={node.y + 14}
              width={node.width * 0.34}
              height="8"
              rx="4"
              className="ambient-network__card-bar"
            />
            <rect
              x={node.x + 14}
              y={node.y + 34}
              width={node.width * 0.65}
              height="6"
              rx="3"
              className="ambient-network__card-line"
            />
            <rect
              x={node.x + 14}
              y={node.y + 46}
              width={node.width * 0.5}
              height="6"
              rx="3"
              className="ambient-network__card-line ambient-network__card-line--short"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function AmbientNetwork() {
  return (
    <div className="ambient-network" aria-hidden="true">
      <WorkflowCluster
        className="ambient-network__svg ambient-network__svg--left"
        pathPrefix="left"
        paths={[
          "M88 124 L164 124 L164 164 L244 164",
          "M312 164 L396 164 L396 114 L488 114",
          "M244 164 L244 276 L332 276",
          "M400 114 L400 236 L490 236",
          "M332 276 L332 360 L468 360"
        ]}
        nodes={[
          { x: 100, y: 92, width: 64, height: 46, tone: "soft" },
          { x: 244, y: 138, width: 68, height: 52, tone: "default" },
          { x: 396, y: 88, width: 84, height: 52, tone: "accent" },
          { x: 332, y: 250, width: 82, height: 52, tone: "default" },
          { x: 468, y: 334, width: 84, height: 52, tone: "soft" }
        ]}
        signals={[
          { routeIndex: 0, dur: "8s", begin: "0s" },
          { routeIndex: 2, dur: "7s", begin: "1.4s" },
          { routeIndex: 1, dur: "8s", begin: "2.1s" },
          { routeIndex: 3, dur: "7.2s", begin: "3.2s" },
          { routeIndex: 4, dur: "8.4s", begin: "4.1s" },
          { routeIndex: 0, dur: "12s", begin: "5.6s", variant: "ghost" },
          { routeIndex: 4, dur: "11.4s", begin: "6.8s", variant: "ghost" }
        ]}
      />

      <WorkflowCluster
        className="ambient-network__svg ambient-network__svg--right"
        pathPrefix="right"
        paths={[
          "M80 146 L180 146 L180 96 L286 96",
          "M286 96 L286 210 L402 210",
          "M402 210 L402 126 L522 126",
          "M180 146 L180 330 L306 330",
          "M306 330 L306 404 L452 404"
        ]}
        nodes={[
          { x: 96, y: 120, width: 72, height: 46, tone: "soft" },
          { x: 286, y: 70, width: 78, height: 52, tone: "accent" },
          { x: 402, y: 184, width: 84, height: 52, tone: "default" },
          { x: 306, y: 304, width: 80, height: 52, tone: "default" },
          { x: 452, y: 378, width: 84, height: 52, tone: "soft" }
        ]}
        signals={[
          { routeIndex: 0, dur: "7.8s", begin: "0.7s" },
          { routeIndex: 1, dur: "7s", begin: "2s" },
          { routeIndex: 2, dur: "7.4s", begin: "3s" },
          { routeIndex: 3, dur: "8.2s", begin: "1.2s" },
          { routeIndex: 4, dur: "8.8s", begin: "4.2s" },
          { routeIndex: 3, dur: "11.8s", begin: "5.8s", variant: "ghost" },
          { routeIndex: 2, dur: "10.6s", begin: "6.4s", variant: "ghost" }
        ]}
      />

      <div className="ambient-network__glow ambient-network__glow--one" />
      <div className="ambient-network__glow ambient-network__glow--two" />
    </div>
  );
}
