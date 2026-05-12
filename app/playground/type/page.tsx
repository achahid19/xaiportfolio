import { NodeType } from "@/components/node-type";

export const metadata = {
  title: "Node Type · Playground",
  description: "Type n8n automation vocabulary to destroy incoming workflow nodes. A ZType-inspired typing game.",
};

export default function NodeTypePage() {
  return (
    <div className="playground-page">
      <div className="playground-desktop">
        <NodeType />
      </div>
      <div className="playground-mobile-gate">
        <div className="playground-mobile-gate__inner">
          <span className="playground-mobile-gate__icon">🖥</span>
          <h2 className="playground-mobile-gate__title">Desktop only</h2>
          <p className="playground-mobile-gate__desc mono">
            Node Type needs a full keyboard.<br />
            Open it on your laptop or desktop to play.
          </p>
        </div>
      </div>
    </div>
  );
}
