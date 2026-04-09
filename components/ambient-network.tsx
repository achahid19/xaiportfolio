type Signal = {
  pathId: string;
  dur: string;
  begin: string;
  ghost?: boolean;
};


function Node({
  x, y, w = 82, h = 40, accent = false,
}: {
  x: number; y: number; w?: number; h?: number; accent?: boolean;
}) {
  return (
    <g className={`ambient-network__node${accent ? " ambient-network__node--accent" : ""}`}>
      {/* Body */}
      <rect x={x} y={y} width={w} height={h} rx={10} className="ambient-network__node-body" />
      {/* Left port */}
      <circle cx={x} cy={y + h / 2} r={3.5} className="ambient-network__port ambient-network__port--in" />
      {/* Right port */}
      <circle cx={x + w} cy={y + h / 2} r={3.5} className="ambient-network__port ambient-network__port--out" />
      {/* Icon placeholder */}
      <rect x={x + 10} y={y + 10} width={12} height={12} rx={3} className="ambient-network__node-icon" />
      {/* Label bar */}
      <rect x={x + 28} y={y + 13} width={w * 0.36} height={5} rx={2.5} className="ambient-network__node-bar" />
      {/* Sub-label bar */}
      <rect x={x + 10} y={y + 27} width={w * 0.55} height={4} rx={2} className="ambient-network__node-sub" />
    </g>
  );
}

function Pulse({ pathId, dur, begin, ghost }: Signal) {
  return (
    <circle
      r={ghost ? 2.5 : 3.5}
      className={`ambient-network__pulse${ghost ? " ambient-network__pulse--ghost" : ""}`}
    >
      <animateMotion dur={dur} repeatCount="indefinite" begin={begin} rotate="auto">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  );
}

// Left cluster — nodes flow right then down, partially off-screen on the left
function LeftCluster() {
  // Paths connect right-port of source → left-port of target (orthogonal)
  // Node A: x=20,  y=60,  w=82, h=40 → right-port (102, 80)
  // Node B: x=190, y=130, w=82, h=40 → left-port (190, 150), right-port (272, 150)
  // Node C: x=370, y=60,  w=82, h=40 → left-port (370, 80)
  // Node D: x=300, y=250, w=82, h=40 → left-port (300, 270), right-port (382, 270)
  // Node E: x=440, y=330, w=82, h=40 → left-port (440, 350)
  return (
    <svg
      className="ambient-network__svg ambient-network__svg--left"
      viewBox="0 0 560 420"
      aria-hidden="true"
    >
      <defs>
        <path id="l-ab" d="M102,80 L146,80 L146,150 L190,150" fill="none" stroke="none" />
        <path id="l-bc" d="M272,150 L321,150 L321,80 L370,80" fill="none" stroke="none" />
        <path id="l-bd" d="M190,150 L190,270 L300,270" fill="none" stroke="none" />
        <path id="l-de" d="M382,270 L411,270 L411,350 L440,350" fill="none" stroke="none" />
      </defs>

      <g className="ambient-network__edges">
        <path d="M102,80 L146,80 L146,150 L190,150" className="ambient-network__edge" />
        <path d="M272,150 L321,150 L321,80 L370,80" className="ambient-network__edge" />
        <path d="M190,150 L190,270 L300,270" className="ambient-network__edge" />
        <path d="M382,270 L411,270 L411,350 L440,350" className="ambient-network__edge" />
      </g>

      <Node x={20}  y={60}  accent />
      <Node x={190} y={130} />
      <Node x={370} y={60}  accent />
      <Node x={300} y={250} />
      <Node x={440} y={330} />

      <Pulse pathId="l-ab" dur="6s"   begin="0s" />
      <Pulse pathId="l-bc" dur="6.8s" begin="1.2s" />
      <Pulse pathId="l-bd" dur="7.2s" begin="2.4s" />
      <Pulse pathId="l-de" dur="6.4s" begin="3.6s" />
      <Pulse pathId="l-ab" dur="10s"  begin="4.8s" ghost />
      <Pulse pathId="l-bd" dur="11s"  begin="6s"   ghost />
    </svg>
  );
}

// Right cluster — mirrored feel, different rhythm
function RightCluster() {
  // Node A: x=70,  y=80,  w=82, h=40 → right-port (152, 100)
  // Node B: x=240, y=40,  w=82, h=40 → left-port (240, 60),  right-port (322, 60)
  // Node C: x=390, y=130, w=82, h=40 → left-port (390, 150), right-port (472, 150)
  // Node D: x=260, y=240, w=82, h=40 → left-port (260, 260), right-port (342, 260)
  // Node E: x=400, y=320, w=82, h=40 → left-port (400, 340)
  return (
    <svg
      className="ambient-network__svg ambient-network__svg--right"
      viewBox="0 0 560 420"
      aria-hidden="true"
    >
      <defs>
        <path id="r-ab" d="M152,100 L196,100 L196,60 L240,60" fill="none" stroke="none" />
        <path id="r-bc" d="M322,60 L356,60 L356,150 L390,150" fill="none" stroke="none" />
        <path id="r-ad" d="M152,100 L152,260 L260,260" fill="none" stroke="none" />
        <path id="r-de" d="M342,260 L371,260 L371,340 L400,340" fill="none" stroke="none" />
      </defs>

      <g className="ambient-network__edges">
        <path d="M152,100 L196,100 L196,60 L240,60" className="ambient-network__edge" />
        <path d="M322,60 L356,60 L356,150 L390,150" className="ambient-network__edge" />
        <path d="M152,100 L152,260 L260,260" className="ambient-network__edge" />
        <path d="M342,260 L371,260 L371,340 L400,340" className="ambient-network__edge" />
      </g>

      <Node x={70}  y={80}  accent />
      <Node x={240} y={40}  />
      <Node x={390} y={130} accent />
      <Node x={260} y={240} />
      <Node x={400} y={320} />

      <Pulse pathId="r-ab" dur="6.6s" begin="0.6s" />
      <Pulse pathId="r-bc" dur="7s"   begin="1.8s" />
      <Pulse pathId="r-ad" dur="7.8s" begin="3s" />
      <Pulse pathId="r-de" dur="6.2s" begin="4.2s" />
      <Pulse pathId="r-bc" dur="10.4s" begin="5.4s" ghost />
      <Pulse pathId="r-ad" dur="11.6s" begin="7.2s" ghost />
    </svg>
  );
}

export function AmbientNetwork() {
  return (
    <div className="ambient-network" aria-hidden="true">
      <LeftCluster />
      <RightCluster />
      <div className="ambient-network__glow ambient-network__glow--one" />
      <div className="ambient-network__glow ambient-network__glow--two" />
    </div>
  );
}
