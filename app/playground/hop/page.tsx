import { NodeHop } from "@/components/node-hop";

export const metadata = {
  title: "Node Hop",
  description: "Guide the data packet through n8n node pipelines. Space or click to flap.",
};

export default function HopPage() {
  return (
    <div className="playground-page">
      <div className="playground-desktop">
        <NodeHop />
      </div>
      <div className="playground-mobile-gate">
        <div className="playground-mobile-gate__inner">
          <span className="playground-mobile-gate__icon">🖥</span>
          <h2 className="playground-mobile-gate__title">Desktop only</h2>
          <p className="playground-mobile-gate__desc mono">
            Node Hop needs a bigger screen.<br />
            Open it on your laptop or desktop to play.
          </p>
        </div>
      </div>
    </div>
  );
}
