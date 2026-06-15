import { NodeFlow } from "@/components/node-flow";

export const metadata = {
  title: "Node Flow",
  description: "Match 3 n8n nodes to execute them. Chain cascades for massive combos.",
};

export default function NodeFlowPage() {
  return (
    <div className="playground-page">
      <div className="playground-desktop">
        <NodeFlow />
      </div>
      <div className="playground-mobile-gate">
        <div className="playground-mobile-gate__inner">
          <span className="playground-mobile-gate__icon">🖥</span>
          <h2 className="playground-mobile-gate__title">Desktop only</h2>
          <p className="playground-mobile-gate__desc mono">
            Node Flow needs a bigger screen.<br />
            Open it on your laptop or desktop to play.
          </p>
        </div>
      </div>
    </div>
  );
}
