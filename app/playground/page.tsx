import { FlowBreaker } from "@/components/flow-breaker";

export const metadata = {
  title: "Playground",
  description: "Flow Breaker — a stress-relief node-popping game. Chain reactions, mega nodes, beat your best score."
};

export default function PlaygroundPage() {
  return (
    <div className="playground-page">
      {/* Desktop: game */}
      <div className="playground-desktop">
        <FlowBreaker />
      </div>

      {/* Mobile: not available */}
      <div className="playground-mobile-gate">
        <div className="playground-mobile-gate__inner">
          <span className="playground-mobile-gate__icon">🖥</span>
          <h2 className="playground-mobile-gate__title">Desktop only</h2>
          <p className="playground-mobile-gate__desc mono">
            Pipeline Rush needs a bigger screen and a mouse.<br />
            Open it on your laptop or desktop to play.
          </p>
        </div>
      </div>
    </div>
  );
}
