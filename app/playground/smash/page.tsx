import { NodeSmash } from "@/components/node-smash";

export const metadata = {
  title: "Node Smash",
  description: "Break n8n nodes with a glowing pipeline ball. Arrow keys to move, Space to launch.",
};

export default function SmashPage() {
  return (
    <div className="playground-page">
      <div className="playground-desktop">
        <NodeSmash />
      </div>
      <div className="playground-mobile-gate">
        <div className="playground-mobile-gate__inner">
          <span className="playground-mobile-gate__icon">🖥</span>
          <h2 className="playground-mobile-gate__title">Desktop only</h2>
          <p className="playground-mobile-gate__desc mono">
            Node Smash needs a keyboard.<br />
            Open it on your laptop or desktop to play.
          </p>
        </div>
      </div>
    </div>
  );
}
